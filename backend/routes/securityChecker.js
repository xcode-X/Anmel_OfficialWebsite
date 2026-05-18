import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { isDbConnected } from '../lib/dbReady.js';
import SecurityScanRecord from '../models/SecurityScanRecord.js';
import { runInteleraAiPentestSync, streamInteleraAiPentestSync } from '../lib/pentestPlatform.js';

const router = Router();
const execFileAsync = promisify(execFile);

function normalizeTargetUrl(input) {
  if (!input) return null;
  const raw = String(input).trim();
  if (!raw) return null;
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(withProtocol).toString();
  } catch {
    return null;
  }
}

function finding(id, severity, title, details, meta = {}) {
  return { id, severity, title, details, ...meta };
}

function deriveAttackScenarios(findings) {
  const scenarios = [];
  const has = (id) => findings.some((f) => typeof f.id === 'string' && f.id.startsWith(id));

  if (has('missing-csp') || has('inline-script-heavy')) {
    scenarios.push({
      name: 'Client-side script injection exposure',
      likelihood: 'high',
      impact: 'high',
      confidence: 'medium',
      attackPath: 'An attacker may abuse weak script controls to run untrusted code in user sessions.',
      businessRisk: 'Session theft, sensitive data exposure, and account takeover risk.',
      mitigationPriority: 'P1',
      mitigation: 'Enforce strict CSP with nonce/hash, reduce inline scripts, and sanitize dynamic content.',
    });
  }
  if (has('missing-hsts') || has('transport-http') || has('mixed-content')) {
    scenarios.push({
      name: 'Transport/session interception risk',
      likelihood: 'medium',
      impact: 'high',
      confidence: 'high',
      attackPath: 'Traffic or resources may be downgraded/intercepted when transport hardening is missing.',
      businessRisk: 'Credential leakage and data tampering in transit.',
      mitigationPriority: 'P1',
      mitigation: 'Force HTTPS everywhere, enable HSTS, and remove all HTTP resource dependencies.',
    });
  }
  if (findings.some((f) => typeof f.id === 'string' && f.id.startsWith('sensitive-'))) {
    scenarios.push({
      name: 'Sensitive file/data exposure',
      likelihood: 'high',
      impact: 'high',
      confidence: 'high',
      attackPath: 'Publicly reachable sensitive paths can leak configuration and internal secrets.',
      businessRisk: 'Environment compromise, privilege escalation, and potential service breach.',
      mitigationPriority: 'P1',
      mitigation: 'Block sensitive paths at edge/web server, rotate secrets, and verify no historic backups are public.',
    });
  }
  if (has('possible-missing-csrf')) {
    scenarios.push({
      name: 'Cross-site request forgery risk',
      likelihood: 'medium',
      impact: 'medium',
      confidence: 'low',
      attackPath: 'State-changing requests may be triggerable by untrusted origins without robust anti-CSRF controls.',
      businessRisk: 'Unauthorized account or settings changes.',
      mitigationPriority: 'P2',
      mitigation: 'Use anti-CSRF tokens, same-site cookies, and origin/referer validation.',
    });
  }
  if (has('risky-methods')) {
    scenarios.push({
      name: 'Method abuse surface',
      likelihood: 'medium',
      impact: 'medium',
      confidence: 'medium',
      attackPath: 'Unneeded HTTP methods increase endpoint manipulation opportunities.',
      businessRisk: 'Unintended data modification and API misuse.',
      mitigationPriority: 'P2',
      mitigation: 'Restrict methods per route and reject unsupported verbs at edge and app layers.',
    });
  }

  return scenarios;
}

function computeRiskScore(findings) {
  const score = findings.reduce((acc, f) => acc + (f.severity === 'high' ? 25 : f.severity === 'medium' ? 12 : 5), 0);
  return Math.min(100, score);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sameOrigin(a, b) {
  try {
    return new URL(a).origin === new URL(b).origin;
  } catch {
    return false;
  }
}

function extractLinks(baseUrl, html) {
  const matches = [...html.matchAll(/href=["']([^"']+)["']/gi)].map((m) => m[1]).slice(0, 500);
  const links = [];
  for (const href of matches) {
    try {
      const u = new URL(href, baseUrl);
      if (['http:', 'https:'].includes(u.protocol)) links.push(u.toString());
    } catch {
      // ignore invalid links
    }
  }
  return [...new Set(links)];
}

async function fetchWithTimeout(url, options = {}, ms = 10000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(t);
  }
}

const CHECK_METHOD_META = {
  'intelera-ai-python-primary': {
    name: 'Intelera AI Python (primary engine)',
    detail: 'Bounded sync pentest: reconnaissance, tool-assisted scan, analysis, and attack-path ranking.',
  },
  'intelera-sync-pentest': {
    name: 'Synchronized pentest loop',
    detail: 'Tick-based engagement with agent orchestration and session memory.',
  },
  'target-reachability': {
    name: 'Target reachability & capture',
    detail: 'HTTP(S) request with redirect follow; response headers and body used for transport and script inventory.',
  },
  'intelera-ai-pentest-platform': {
    name: 'Intelera AI pentest platform',
    detail: 'Python FastAPI service runs authorized tooling and agent phases under configured scope and API key.',
  },
  headers: { name: 'Security header analysis', detail: 'HSTS, CSP, frame controls, X-Content-Type-Options, Referrer-Policy, etc.' },
  transport: { name: 'Transport & TLS signals', detail: 'HTTPS usage, mixed-content patterns in markup.' },
  'html-passive-patterns': { name: 'Passive HTML / markup review', detail: 'Forms, inline scripts, password fields, CSRF hints, tech fingerprints.' },
  'active-safe-crawl': { name: 'Same-origin safe crawl', detail: 'Limited multi-page fetch to compare security headers across discovered pages.' },
  'active-safe-probes': { name: 'Non-destructive path probes', detail: 'GET probes for common sensitive paths and security.txt presence.' },
  'anomaly-heuristics': { name: 'Heuristic anomaly signals', detail: 'Patterns suggesting exposed tech or admin surfaces (indicative only).' },
};

/**
 * Structured pentest report metadata: type, methods, process — for UI and downloadable reports.
 */
function buildPentestReport({
  pentestEngine,
  scanMode,
  scanDepth,
  checksRun,
  inteleraAiAvailable,
  findingsCounts,
}) {
  const isPrimaryPython = pentestEngine === 'intelera-ai-python';
  const modeLabel =
    scanMode === 'passive' ? 'Passive only' : scanMode === 'active' ? 'Active only' : 'Passive + active (safe)';
  const depthLabel = scanDepth === 'in-depth' ? 'In-depth' : 'Standard';

  const methods = (checksRun || []).map((id) => {
    const meta = CHECK_METHOD_META[id];
    return {
      id,
      name: meta?.name || id.replace(/-/g, ' '),
      detail: meta?.detail || 'Executed as part of this assessment.',
    };
  });

  const processPrimary = [
    {
      order: 1,
      phase: 'Scope & configuration',
      detail: `Target URL validated. Scan configuration: ${modeLabel}, ${depthLabel} depth.`,
    },
    {
      order: 2,
      phase: 'Intelera AI Python engagement',
      detail:
        'Primary assessment runs on the Intelera AI pentest platform: reconnaissance, tool-assisted checks, analysis, ranked attack paths, and agent logs (bounded sync).',
    },
    {
      order: 3,
      phase: 'Reachability & transport check (Node)',
      detail:
        'This service confirms the target responds over HTTP(S) and records lightweight transport signals; it does not duplicate full port scanning when Python is primary.',
    },
    {
      order: 4,
      phase: 'Finding synthesis & mapping',
      detail:
        'Dashboard findings combine Intelera outputs with reachability signals; issues are mapped toward OWASP/CWE-style categories where applicable.',
    },
    {
      order: 5,
      phase: 'Risk score & narrative',
      detail:
        'Risk score and executive messaging are produced; AI-assisted narrative is used when OpenAI is configured.',
    },
  ];

  const processNode = [
    {
      order: 1,
      phase: 'Scope & configuration',
      detail: `Target URL validated. Scan configuration: ${modeLabel}, ${depthLabel} depth.`,
    },
    {
      order: 2,
      phase: 'Passive HTTP(S) analysis',
      detail: 'Initial fetch: security headers, transport hints, HTML patterns, script sources, and heuristic indicators.',
    },
    {
      order: 3,
      phase: 'Active safe validation (when not passive-only)',
      detail: 'Same-origin crawl, sensitive-path probes (non-destructive GET), OPTIONS Allow review, and optional top-port surface scan via nmap when enabled.',
    },
    {
      order: 4,
      phase: 'Intelera AI supplement (when configured)',
      detail: inteleraAiAvailable
        ? 'Intelera AI Python sync pentest ran as a supplement and enriched results with tool/agent output.'
        : 'Intelera AI can be attached via PENTEST_PLATFORM_URL for deeper tool-assisted phases.',
    },
    {
      order: 5,
      phase: 'Finding synthesis & risk scoring',
      detail: 'Findings mapped to scenarios, OWASP/CWE-style fields where applicable, weakness examples, and overall risk score.',
    },
    {
      order: 6,
      phase: 'Narrative',
      detail: 'AI-assisted executive narrative when OpenAI is configured; otherwise static summaries.',
    },
  ];

  return {
    assessmentType: isPrimaryPython
      ? 'Authorized application pentest-style assessment (Intelera AI Python primary)'
      : 'External web application security assessment (Node) with optional Intelera AI supplement',
    assessmentSummary: isPrimaryPython
      ? `Primary pentesting was performed by the Intelera AI Python platform (${modeLabel.toLowerCase()}, ${depthLabel.toLowerCase()}). This Node service added reachability and basic transport checks only.`
      : `Assessment combined Node-based passive and safe active checks (${modeLabel.toLowerCase()}, ${depthLabel.toLowerCase()})${
          inteleraAiAvailable ? ', plus Intelera AI Python output where available.' : '.'
        }`,
    scanConfiguration: { scanMode, scanDepth, modeLabel, depthLabel },
    methods,
    process: isPrimaryPython ? processPrimary : processNode,
    findingsOverview: findingsCounts,
  };
}

function mapToOwaspAndCwe(f) {
  const id = typeof f?.id === 'string' ? f.id : String(f?.id ?? '');
  if (id.includes('csp') || id.includes('inline-script')) return { owasp: 'A03:2021 - Injection', cwe: 'CWE-79' };
  if (id.includes('csrf')) return { owasp: 'A01:2021 - Broken Access Control', cwe: 'CWE-352' };
  if (id.includes('transport') || id.includes('hsts') || id.includes('mixed-content')) return { owasp: 'A02:2021 - Cryptographic Failures', cwe: 'CWE-319' };
  if (id.includes('sensitive-') || id.includes('tech-')) return { owasp: 'A05:2021 - Security Misconfiguration', cwe: 'CWE-16' };
  if (id.includes('risky-methods')) return { owasp: 'A05:2021 - Security Misconfiguration', cwe: 'CWE-749' };
  return { owasp: 'A09:2021 - Security Logging and Monitoring Failures', cwe: 'CWE-778' };
}

function buildWeaknessExamples(findings) {
  const examples = [];
  const add = (name, risk, abused, mitigation) => examples.push({ name, risk, abused, mitigation });
  if (findings.some((f) => typeof f.id === 'string' && (f.id.includes('csp') || f.id.includes('inline-script')))) {
    add(
      'Injection-style client script risk (XSS class)',
      'High',
      'Untrusted browser-side script execution can lead to token/session exposure.',
      'Apply strict CSP, output encoding, and centralized sanitization.'
    );
  }
  if (findings.some((f) => typeof f.id === 'string' && (f.id.includes('transport') || f.id.includes('hsts')))) {
    add(
      'Transport channel weakness',
      'High',
      'Downgraded/intercepted traffic may expose credentials and data.',
      'Enforce HTTPS with HSTS and remove insecure dependencies.'
    );
  }
  if (findings.some((f) => typeof f.id === 'string' && f.id.includes('sensitive-'))) {
    add(
      'Sensitive resource exposure',
      'High',
      'Public access to backups/configs can expose secrets and internal architecture.',
      'Deny sensitive paths and rotate any potentially exposed secrets.'
    );
  }
  if (findings.some((f) => typeof f.id === 'string' && f.id.includes('csrf'))) {
    add(
      'Cross-site request forgery susceptibility',
      'Medium',
      'Untrusted origins may trigger state-changing requests in victim sessions.',
      'Implement anti-CSRF tokens and strict same-site cookie policy.'
    );
  }
  return examples;
}

async function runNmapSurfaceScan(targetUrl) {
  const host = new URL(targetUrl).hostname;
  try {
    const { stdout } = await execFileAsync('nmap', ['-Pn', '-T3', '--top-ports', '100', '--open', host], { timeout: 30000 });
    const openPorts = [];
    for (const line of String(stdout).split('\n')) {
      if (/^\d+\/tcp\s+open/i.test(line.trim())) {
        openPorts.push(line.trim());
      }
    }
    return { enabled: true, host, openPorts, raw: String(stdout).slice(0, 5000) };
  } catch {
    return { enabled: false, host, openPorts: [], raw: 'Nmap unavailable or failed on this server runtime.' };
  }
}

function buildStaticSummary(findings) {
  const critical = findings.filter((f) => f.severity === 'high').length;
  const medium = findings.filter((f) => f.severity === 'medium').length;
  if (!findings.length) return 'No obvious issues were detected in this passive scan. Continue with authenticated and code-level testing.';
  return `Passive scan detected ${critical} high-risk and ${medium} medium-risk areas. Prioritize missing security headers and exposed transport risks, then verify auth/session controls with deeper testing.`;
}

function extractScriptSources(baseUrl, html) {
  const matches = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1]);
  const out = [];
  for (const src of matches) {
    try {
      out.push(new URL(src, baseUrl).toString());
    } catch {
      // ignore invalid src
    }
  }
  return [...new Set(out)];
}

function safeJsonStringify(value, maxLen = 120_000) {
  try {
    const s = JSON.stringify(value);
    if (s.length <= maxLen) return s;
    return `${s.slice(0, maxLen)}…(truncated)`;
  } catch {
    return '"[unserializable]"';
  }
}

/** Keep MongoDB `result` under BSON limits; full API response can still be large but we cap stored + risky fields. */
function compactInteleraAiForStorage(ai) {
  if (!ai || typeof ai !== 'object') return ai;
  const out = { ...ai };
  if (Array.isArray(out.agent_logs)) {
    out.agent_logs = out.agent_logs.slice(0, 40).map((row) => ({
      ...row,
      payload:
        row?.payload && typeof row.payload === 'object'
          ? safeJsonStringify(row.payload, 8_000)
          : row?.payload,
    }));
  }
  if (out.agent_memory && typeof out.agent_memory === 'object') {
    const mo = { ...out.agent_memory };
    if (mo.last_outputs && typeof mo.last_outputs === 'object') {
      const lo = {};
      for (const [k, v] of Object.entries(mo.last_outputs)) {
        lo[k] = typeof v === 'string' ? v.slice(0, 12_000) : safeJsonStringify(v, 8_000);
      }
      mo.last_outputs = lo;
    }
    out.agent_memory = mo;
  }
  return out;
}

/** Avoid nested try/catch brace issues; handle oversized or non-serializable payloads. */
function sendAnalyzeJsonResponse(res, responsePayload) {
  try {
    return res.json(responsePayload);
  } catch (jsonErr) {
    console.warn('[security-checker] res.json failed, sending slim payload:', jsonErr?.message || jsonErr);
    const slim = {
      ...responsePayload,
      inteleraAi: {
        available: false,
        error: 'Scan completed but the full response was too large to return. Retry or disable Intelera AI pentest integration.',
      },
      findings: responsePayload.findings,
      executiveSummary: responsePayload.executiveSummary,
    };
    return res.json(slim);
  }
}

async function getAiSummary({ targetUrl, findings, headers }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { provider: 'fallback', text: buildStaticSummary(findings) };

  const prompt = [
    'You are an application security analyst.',
    `Target: ${targetUrl}`,
    `Headers: ${safeJsonStringify(headers)}`,
    `Findings: ${safeJsonStringify(findings)}`,
    'Write a concise action plan (max 7 bullets) with priority order and quick wins.',
  ].join('\n');

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_SECURITY_MODEL || 'gpt-4o-mini',
        temperature: 0.2,
        messages: [
          { role: 'system', content: 'You provide safe, defensive web security guidance only.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      return { provider: 'fallback', text: buildStaticSummary(findings) };
    }
    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    return { provider: 'openai', text: text || buildStaticSummary(findings) };
  } catch {
    return { provider: 'fallback', text: buildStaticSummary(findings) };
  }
}

/** Derive dashboard findings from Intelera AI Python response when it is the primary engine. */
function findingsFromInteleraAi(inteleraAi) {
  const out = [];
  if (!inteleraAi || typeof inteleraAi !== 'object') return out;
  if (!inteleraAi.available) {
    out.push(
      finding(
        'intelera-ai-connection',
        'medium',
        'Intelera AI Python engine did not complete successfully',
        typeof inteleraAi.error === 'string'
          ? inteleraAi.error
          : inteleraAi.reason || 'Verify PENTEST_PLATFORM_URL, API key, and that the Python service is running.',
      ),
    );
    return out;
  }
  const paths =
    inteleraAi.attack_paths?.length > 0
      ? inteleraAi.attack_paths
      : inteleraAi.agent_memory?.ranked_paths || [];
  if (Array.isArray(paths) && paths.length > 0) {
    const top = paths[0];
    const rs = Number(top.risk_score) || 0;
    const sev = rs >= 70 ? 'high' : rs >= 40 ? 'medium' : 'low';
    out.push(
      finding(
        'intelera-ranked-path',
        sev,
        'Attack path analysis (Intelera AI Python)',
        top.summary || 'See Intelera AI panel for ranked chains and risk scores.',
        { risk: top.risk_score, engine: 'intelera-ai-python' },
      ),
    );
  } else {
    out.push(
      finding(
        'intelera-ai-engagement',
        'low',
        'Intelera AI Python engagement finished',
        'Review agent logs, tool output, and paths in the Intelera AI panel.',
        { engine: 'intelera-ai-python' },
      ),
    );
  }
  return out;
}

async function getAiSummaryInteleraPrimary({ targetUrl, inteleraAi, findings, headers }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      provider: 'fallback',
      text:
        `Primary assessment: Intelera AI Python pentest engine. ${inteleraAi?.available ? 'Use the Intelera AI panel for attack paths and agent output.' : 'Engine unavailable — check the Python service.'}`,
    };
  }
  const prompt = [
    'You are a senior application security analyst.',
    'The PRIMARY assessment was produced by the Intelera AI Python pentest platform (bounded sync: recon, tool-assisted scan, analysis, attack-path ranking).',
    `Target: ${targetUrl}`,
    `Lightweight Node checks (reachability / transport only): ${safeJsonStringify(findings)}`,
    `Intelera AI Python result JSON: ${safeJsonStringify(inteleraAi)}`,
    'Write a concise prioritized action plan (max 7 bullets). Lead with Intelera AI findings; mention transport only if relevant.',
  ].join('\n');
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_SECURITY_MODEL || 'gpt-4o-mini',
        temperature: 0.2,
        messages: [
          { role: 'system', content: 'You provide safe, defensive security guidance. The Python engine is the source of truth for pentest results.' },
          { role: 'user', content: prompt },
        ],
      }),
    });
    if (!response.ok) {
      return { provider: 'fallback', text: buildStaticSummary(findings) };
    }
    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    return { provider: 'openai', text: text || buildStaticSummary(findings) };
  } catch {
    return { provider: 'fallback', text: buildStaticSummary(findings) };
  }
}

/** Shared tail for Intelera-primary scans (sync or live stream). */
async function finalizeInteleraPrimaryScan({
  targetUrl,
  startedAt,
  scanDepth,
  scanMode,
  inteleraAi,
  findings,
  headers,
  discovered,
  scripts,
  nmap,
}) {
  let aiSummary;
  try {
    aiSummary = await getAiSummaryInteleraPrimary({ targetUrl, inteleraAi, findings, headers });
  } catch (sumErr) {
    console.warn('[security-checker] getAiSummaryInteleraPrimary failed:', sumErr?.message || sumErr);
    aiSummary = { provider: 'fallback', text: buildStaticSummary(findings) };
  }

  const mappedFindings = findings.map((f) => ({ ...f, ...mapToOwaspAndCwe(f) }));
  const weaknessExamples = buildWeaknessExamples(mappedFindings);
  const attackScenarios = deriveAttackScenarios(findings);
  let riskScore = computeRiskScore(mappedFindings);
  if (inteleraAi?.available) {
    const paths =
      inteleraAi.attack_paths?.length > 0
        ? inteleraAi.attack_paths
        : inteleraAi.agent_memory?.ranked_paths || [];
    const maxPath = paths.reduce((m, p) => Math.max(m, Number(p.risk_score) || 0), 0);
    riskScore = Math.max(riskScore, Math.min(100, Math.round(maxPath)));
  }
  const completedAt = new Date();
  const postures = riskScore >= 70 ? 'Critical attention required' : riskScore >= 40 ? 'Moderate risk posture' : 'Baseline risk posture';
  const keyMessage = inteleraAi?.available
    ? 'Primary assessment: Intelera AI Python pentest engine. Review attack paths, agent logs, and tool output below.'
    : 'Intelera AI Python engine did not complete successfully. Confirm the pentest service is running and API keys match.';
  const sevHigh = mappedFindings.filter((f) => f.severity === 'high').length;
  const sevMed = mappedFindings.filter((f) => f.severity === 'medium').length;
  const sevLow = mappedFindings.filter((f) => f.severity === 'low').length;

  const checksRun = ['intelera-ai-python-primary', 'intelera-sync-pentest', 'target-reachability'];
  if (inteleraAi?.available) {
    checksRun.push('intelera-ai-pentest-platform');
  }

  const pentestEngineId = 'intelera-ai-python';
  const pentestReport = buildPentestReport({
    pentestEngine: pentestEngineId,
    scanMode,
    scanDepth,
    checksRun,
    inteleraAiAvailable: Boolean(inteleraAi?.available),
    findingsCounts: { total: mappedFindings.length, high: sevHigh, medium: sevMed, low: sevLow },
  });

  const responsePayload = {
    targetUrl,
    startedAt,
    completedAt,
    pentestEngine: pentestEngineId,
    pentestReport,
    checksRun,
    scanMode,
    scanDepth,
    discovered,
    scriptSources: [...new Set(scripts)].slice(0, 80),
    coverageNote:
      'Primary pentesting is performed by the Intelera AI Python platform (bounded sync: recon, tool-assisted scan, analysis, attack paths). This Node service only confirms reachability and basic transport.',
    executiveSummary: {
      riskScore,
      posture: postures,
      keyMessage,
    },
    attackScenarios,
    findings: mappedFindings,
    weaknessExamples,
    nmap,
    aiSummary,
    inteleraAi,
    legalNote:
      'Authorized testing only. The Intelera AI Python engine runs tool-assisted phases within configured scope and safe-exploit settings.',
    methodology: {
      standard: ['Intelera AI Python', 'Sync pentest loop', 'Tool orchestration', 'Attack-path ranking', 'Agent logs'],
      framework: 'Intelera AI Python pentest platform (primary)',
    },
  };

  try {
    if (isDbConnected()) {
      const aiText = typeof aiSummary?.text === 'string' ? aiSummary.text : '';
      const scriptSourcesArr = responsePayload.scriptSources || [];
      const resultForDb = {
        ...responsePayload,
        inteleraAi: compactInteleraAiForStorage(responsePayload.inteleraAi),
      };
      await SecurityScanRecord.create({
        targetUrl,
        startedAt,
        completedAt,
        riskScore,
        posture: postures,
        executiveKeyMessage: keyMessage,
        scanMode,
        scanDepth,
        findingsCount: mappedFindings.length,
        severityCounts: { high: sevHigh, medium: sevMed, low: sevLow },
        aiProvider: aiSummary?.provider || '',
        aiSummaryText: aiText.length > 100000 ? `${aiText.slice(0, 100000)}…` : aiText,
        attackScenariosCount: Array.isArray(attackScenarios) ? attackScenarios.length : 0,
        weaknessExamplesCount: Array.isArray(weaknessExamples) ? weaknessExamples.length : 0,
        discoveredUrlsCount: Array.isArray(discovered) ? discovered.length : 0,
        scriptSourcesCount: scriptSourcesArr.length,
        checksRunCount: Array.isArray(responsePayload.checksRun) ? responsePayload.checksRun.length : 0,
        nmapEnabled: Boolean(nmap?.enabled),
        nmapOpenPortsCount: Array.isArray(nmap?.openPorts) ? nmap.openPorts.length : 0,
        result: resultForDb,
      });
    }
  } catch (persistErr) {
    console.warn('[security-checker] Failed to persist scan record:', persistErr.message);
  }

  return responsePayload;
}

router.post('/analyze',
  body('url').notEmpty(),
  body('scanDepth').optional().isIn(['standard', 'in-depth']),
  body('scanMode').optional().isIn(['passive', 'active', 'both']),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const targetUrl = normalizeTargetUrl(req.body.url);
      if (!targetUrl) return res.status(400).json({ error: 'Please provide a valid website URL.' });

    const startedAt = new Date();
    const scanDepth = req.body.scanDepth || 'standard';
    const scanMode = req.body.scanMode || 'both';
    const findings = [];
    let headers = {};
    let html = '';
    const discovered = [];
    const scripts = [];
    let nmap = { enabled: false, host: '', openPorts: [], raw: '' };

    const pentestUrl = process.env.PENTEST_PLATFORM_URL?.trim();
    const inteleraPrimary = Boolean(pentestUrl) && process.env.INTELERA_AI_PRIMARY !== 'false';

    let inteleraAi = { available: false, reason: 'Skipped' };
    let skipLegacyFullScan = false;

    if (inteleraPrimary) {
      try {
        inteleraAi = await runInteleraAiPentestSync({
          targetUrl,
          fullCrew: process.env.PENTEST_INTELERA_FULL_CREW === 'true',
        });
      } catch (e) {
        inteleraAi = { available: false, error: e.message || String(e) };
      }
      try {
        const reach = await fetchWithTimeout(
          targetUrl,
          {
            redirect: 'follow',
            headers: { 'User-Agent': 'Intelera-Security-Checker/1.0 reachability' },
          },
          12000,
        );
        headers = Object.fromEntries(reach.headers.entries());
        html = await reach.text();
        discovered.push({ url: targetUrl, status: reach.status });
        if (!targetUrl.startsWith('https://')) {
          findings.push(
            finding('transport-http', 'high', 'Site is not using HTTPS', 'Enable HTTPS and redirect all HTTP traffic to TLS.'),
          );
        }
        scripts.push(...extractScriptSources(targetUrl, html));
        findings.push(...findingsFromInteleraAi(inteleraAi));
      } catch {
        return res.status(400).json({ error: 'Unable to reach target URL for scanning.' });
      }
      const host = new URL(targetUrl).hostname;
      nmap = {
        enabled: false,
        host,
        openPorts: [],
        raw: 'Port and service probing runs on the Intelera AI Python pentest engine (not duplicated on this Node server).',
      };
      skipLegacyFullScan = true;
    }

    if (!skipLegacyFullScan) {
    try {
      const response = await fetchWithTimeout(targetUrl, {
        redirect: 'follow',
        headers: { 'User-Agent': 'Intelera-Security-Checker/1.0' },
      }, 12000);

      headers = Object.fromEntries(response.headers.entries());
      html = await response.text();

      if (!targetUrl.startsWith('https://')) {
        findings.push(finding('transport-http', 'high', 'Site is not using HTTPS', 'Enable HTTPS and redirect all HTTP traffic to TLS.'));
      }
      if (!headers['strict-transport-security']) {
        findings.push(finding('missing-hsts', 'high', 'Missing HSTS header', 'Add Strict-Transport-Security with long max-age and includeSubDomains.'));
      }
      if (!headers['content-security-policy']) {
        findings.push(finding('missing-csp', 'high', 'Missing Content-Security-Policy', 'Define a strict CSP to reduce XSS and data injection risks.'));
      }
      const cspHeader = headers['content-security-policy'];
      const cspHasFrameAncestors =
        typeof cspHeader === 'string' && cspHeader.includes('frame-ancestors');
      if (!headers['x-frame-options'] && !cspHasFrameAncestors) {
        findings.push(finding('missing-clickjacking-control', 'medium', 'Clickjacking protection not detected', 'Add X-Frame-Options DENY/SAMEORIGIN or CSP frame-ancestors.'));
      }
      if (!headers['x-content-type-options']) {
        findings.push(finding('missing-nosniff', 'medium', 'Missing X-Content-Type-Options', "Set X-Content-Type-Options to 'nosniff'."));
      }
      if (!headers['referrer-policy']) {
        findings.push(finding('missing-referrer-policy', 'low', 'Missing Referrer-Policy', 'Set a strict referrer policy such as strict-origin-when-cross-origin.'));
      }

      if (scanMode !== 'passive') {
        const hasPasswordField = /<input[^>]+type=["']password["']/i.test(html);
        const hasCsrfToken = /(csrf|xsrf|__requestverificationtoken)/i.test(html);
        if (hasPasswordField && !hasCsrfToken) {
          findings.push(finding('possible-missing-csrf', 'medium', 'No obvious CSRF token markers found', 'Verify that all state-changing forms include CSRF protection.'));
        }
      }

      const insecureSrc = /<(script|img|iframe)[^>]+src=["']http:\/\//i.test(html);
      if (insecureSrc) {
        findings.push(finding('mixed-content', 'medium', 'Potential mixed-content resources detected', 'Serve all scripts/images/iframes over HTTPS.'));
      }

      const inlineScriptCount = (html.match(/<script(?![^>]*\ssrc=)[^>]*>/gi) || []).length;
      if (inlineScriptCount > 3) {
        findings.push(finding('inline-script-heavy', 'low', 'Heavy inline script usage', 'Reduce inline scripts and use nonce/hash-based CSP controls.'));
      }
      scripts.push(...extractScriptSources(targetUrl, html));

      // Unknown-pattern anomaly checks (heuristics for suspicious tech exposure/signatures).
      const suspiciousPatterns = [
        { re: /wp-content|wp-includes/i, id: 'tech-wordpress', title: 'CMS fingerprint: WordPress indicators detected' },
        { re: /phpmyadmin/i, id: 'tech-phpmyadmin', title: 'Potential admin tooling exposure patterns detected' },
        { re: /\/graphql/i, id: 'tech-graphql', title: 'GraphQL endpoint patterns detected' },
      ];
      for (const p of suspiciousPatterns) {
        if (p.re.test(html) || p.re.test(targetUrl)) {
          findings.push(finding(
            p.id,
            'low',
            p.title,
            'Review access controls and exposure posture for this technology surface.'
          ));
        }
      }

      if (scanMode !== 'passive') {
        // Controlled active checks (safe, non-destructive): same-origin crawl + endpoint/config probing.
        const maxPages = scanDepth === 'in-depth' ? 14 : 6;
        const queue = [targetUrl];
        const visited = new Set();
        const requiredHeaders = ['strict-transport-security', 'content-security-policy', 'x-content-type-options'];

        while (queue.length && visited.size < maxPages) {
          const current = queue.shift();
          if (!current || visited.has(current) || !sameOrigin(targetUrl, current)) continue;
          visited.add(current);
          await sleep(scanDepth === 'in-depth' ? 140 : 220);

          try {
            const pageRes = await fetchWithTimeout(current, {
              redirect: 'follow',
              headers: { 'User-Agent': 'Intelera-Security-Checker/1.0 active-checker' },
            }, 10000);
            const pageHeaders = Object.fromEntries(pageRes.headers.entries());
            const pageHtml = await pageRes.text();
            discovered.push({ url: current, status: pageRes.status });

            for (const h of requiredHeaders) {
              if (!pageHeaders[h]) {
                findings.push(finding(
                  `missing-${h}-${visited.size}`,
                  'medium',
                  `Missing ${h} on discovered page`,
                  `Endpoint ${current} did not include ${h}. Apply consistent security headers across all pages.`
                ));
              }
            }

            const links = extractLinks(current, pageHtml).filter((u) => sameOrigin(targetUrl, u));
            for (const link of links) {
              if (!visited.has(link) && !queue.includes(link) && queue.length < maxPages * 2) queue.push(link);
            }
          } catch {
            findings.push(finding(
              `crawl-failure-${visited.size}`,
              'low',
              'Crawl request failed on discovered page',
              `Could not fetch ${current} during active crawl. Verify availability and routing protections.`
            ));
          }
        }

        const sensitivePaths = [
          '/.git/config',
          '/.env',
          '/backup.zip',
          '/server-status',
          '/.well-known/security.txt',
        ];

        for (const p of sensitivePaths) {
          await sleep(120);
          try {
            const probeUrl = new URL(p, targetUrl).toString();
            const probe = await fetchWithTimeout(probeUrl, {
              method: 'GET',
              headers: { 'User-Agent': 'Intelera-Security-Checker/1.0 probe' },
            }, 9000);
            if (probe.status === 200 && p !== '/.well-known/security.txt') {
              findings.push(finding(
                `sensitive-${p}`,
                'high',
                `Potential sensitive path exposed: ${p}`,
                `The endpoint ${probeUrl} returned 200. Restrict public access and verify no confidential data is exposed.`
              ));
            }
            if (p === '/.well-known/security.txt' && probe.status !== 200) {
              findings.push(finding(
                'missing-security-txt',
                'low',
                'security.txt not found',
                'Consider publishing /.well-known/security.txt for coordinated vulnerability disclosure.'
              ));
            }
          } catch {
            // ignore transient probe errors
          }
        }

        try {
          const optionsRes = await fetchWithTimeout(targetUrl, {
            method: 'OPTIONS',
            headers: { 'User-Agent': 'Intelera-Security-Checker/1.0 probe' },
          }, 9000);
          const allow = optionsRes.headers.get('allow') || '';
          if (/PUT|DELETE|TRACE/i.test(allow)) {
            findings.push(finding(
              'risky-methods',
              'medium',
              'Potentially risky HTTP methods advertised',
              `Server Allow header includes: ${allow}. Confirm only required methods are exposed publicly.`
            ));
          }
        } catch {
          // ignore
        }
      }
    } catch {
      return res.status(400).json({ error: 'Unable to reach target URL for scanning.' });
    }
    }

    if (skipLegacyFullScan) {
      const responsePayload = await finalizeInteleraPrimaryScan({
        targetUrl,
        startedAt,
        scanDepth,
        scanMode,
        inteleraAi,
        findings,
        headers,
        discovered,
        scripts,
        nmap,
      });
      return sendAnalyzeJsonResponse(res, responsePayload);
    }

    let aiSummary;
    try {
      aiSummary = await getAiSummary({ targetUrl, findings, headers });
    } catch (sumErr) {
      console.warn('[security-checker] getAiSummary failed:', sumErr?.message || sumErr);
      aiSummary = { provider: 'fallback', text: buildStaticSummary(findings) };
    }
    if (scanMode !== 'passive') {
      nmap = await runNmapSurfaceScan(targetUrl);
      if (nmap.enabled && nmap.openPorts.length > 10) {
        findings.push(finding(
          'broad-open-port-surface',
          'medium',
          'Broad open port surface detected',
          'Multiple open ports were detected by surface scan. Validate exposure against approved network design.',
          { owasp: 'A05:2021 - Security Misconfiguration', cwe: 'CWE-16' }
        ));
      }
    }

    const mappedFindings = findings.map((f) => ({ ...f, ...mapToOwaspAndCwe(f) }));
    const weaknessExamples = buildWeaknessExamples(mappedFindings);
    const attackScenarios = deriveAttackScenarios(findings);
    let riskScore = computeRiskScore(mappedFindings);
    const completedAt = new Date();
    const postures = riskScore >= 70 ? 'Critical attention required' : riskScore >= 40 ? 'Moderate risk posture' : 'Baseline risk posture';
    const keyMessage = findings.length
      ? 'Security gaps were identified and mapped to likely attack scenarios. Prioritize P1 mitigations immediately.'
      : 'No major passive/active signals were detected in this scan window. Continue scheduled monitoring and authenticated testing.';
    const sevHigh = mappedFindings.filter((f) => f.severity === 'high').length;
    const sevMed = mappedFindings.filter((f) => f.severity === 'medium').length;
    const sevLow = mappedFindings.filter((f) => f.severity === 'low').length;

    try {
      if (pentestUrl) {
        inteleraAi = await runInteleraAiPentestSync({
          targetUrl,
          fullCrew: process.env.PENTEST_INTELERA_FULL_CREW === 'true',
        });
      } else {
        inteleraAi = { available: false, reason: 'PENTEST_PLATFORM_URL not set' };
      }
    } catch (e) {
      inteleraAi = { available: false, error: e.message || String(e) };
    }

    const checksRun = [
      'headers',
      'transport',
      'html-passive-patterns',
      'active-safe-crawl',
      'active-safe-probes',
      'anomaly-heuristics',
    ];
    if (inteleraAi?.available) {
      checksRun.push('intelera-ai-pentest-platform');
    }

    const pentestEngineId = 'node';
    const pentestReport = buildPentestReport({
      pentestEngine: pentestEngineId,
      scanMode,
      scanDepth,
      checksRun,
      inteleraAiAvailable: Boolean(inteleraAi?.available),
      findingsCounts: { total: mappedFindings.length, high: sevHigh, medium: sevMed, low: sevLow },
    });

    const responsePayload = {
      targetUrl,
      startedAt,
      completedAt,
      pentestEngine: pentestEngineId,
      pentestReport,
      checksRun,
      scanMode,
      scanDepth,
      discovered,
      scriptSources: [...new Set(scripts)].slice(0, 80),
      coverageNote:
        'Coverage includes passive analysis and safe active probing on Node. When PENTEST_PLATFORM_URL is set without primary mode, Intelera AI supplements the scan.',
      executiveSummary: {
        riskScore,
        posture: postures,
        keyMessage,
      },
      attackScenarios,
      findings: mappedFindings,
      weaknessExamples,
      nmap,
      aiSummary,
      inteleraAi,
      legalNote:
        'This checker performs passive, non-intrusive analysis on Node by default. When Intelera AI pentest integration is enabled, additional authorized tool-assisted probes may run on the Python platform. Only test systems you own or have explicit written permission to assess.',
      methodology: {
        standard: ['Recon & Scope', 'Passive Analysis', 'Active Safe Validation', 'Risk Scoring', 'OWASP Mapping', 'Recommendations'],
        framework: 'OWASP Testing Guide aligned (Node); optional Intelera AI supplement',
      },
    };

    try {
      if (isDbConnected()) {
        const aiText = typeof aiSummary?.text === 'string' ? aiSummary.text : '';
        const scriptSourcesArr = responsePayload.scriptSources || [];
        const resultForDb = {
          ...responsePayload,
          inteleraAi: compactInteleraAiForStorage(responsePayload.inteleraAi),
        };
        await SecurityScanRecord.create({
          targetUrl,
          startedAt,
          completedAt,
          riskScore,
          posture: postures,
          executiveKeyMessage: keyMessage,
          scanMode,
          scanDepth,
          findingsCount: mappedFindings.length,
          severityCounts: { high: sevHigh, medium: sevMed, low: sevLow },
          aiProvider: aiSummary?.provider || '',
          aiSummaryText: aiText.length > 100000 ? `${aiText.slice(0, 100000)}…` : aiText,
          attackScenariosCount: Array.isArray(attackScenarios) ? attackScenarios.length : 0,
          weaknessExamplesCount: Array.isArray(weaknessExamples) ? weaknessExamples.length : 0,
          discoveredUrlsCount: Array.isArray(discovered) ? discovered.length : 0,
          scriptSourcesCount: scriptSourcesArr.length,
          checksRunCount: Array.isArray(responsePayload.checksRun) ? responsePayload.checksRun.length : 0,
          nmapEnabled: Boolean(nmap?.enabled),
          nmapOpenPortsCount: Array.isArray(nmap?.openPorts) ? nmap.openPorts.length : 0,
          result: resultForDb,
        });
      }
    } catch (persistErr) {
      console.warn('[security-checker] Failed to persist scan record:', persistErr.message);
    }

    return sendAnalyzeJsonResponse(res, responsePayload);
    } catch (err) {
      console.error('[security-checker] /analyze failed:', err?.stack || err);
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Security scan failed. Please try again.',
          detail: process.env.NODE_ENV !== 'production' ? err?.message : undefined,
        });
      }
    }
  }
);

function writeNdjson(res, obj) {
  if (!res.writableEnded) res.write(`${JSON.stringify(obj)}\n`);
}

/** Live NDJSON stream: Intelera ticks in real time, then final report payload. Requires Intelera primary config. */
router.post(
  '/analyze-stream',
  body('url').notEmpty(),
  body('scanDepth').optional().isIn(['standard', 'in-depth']),
  body('scanMode').optional().isIn(['passive', 'active', 'both']),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const targetUrl = normalizeTargetUrl(req.body.url);
      if (!targetUrl) return res.status(400).json({ error: 'Please provide a valid website URL.' });

      const pentestUrl = process.env.PENTEST_PLATFORM_URL?.trim();
      const inteleraPrimary = Boolean(pentestUrl) && process.env.INTELERA_AI_PRIMARY !== 'false';
      if (!inteleraPrimary) {
        return res.status(400).json({
          error:
            'Live streaming requires the Intelera AI pentest service: set PENTEST_PLATFORM_URL and keep INTELERA_AI_PRIMARY enabled.',
        });
      }

      res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      if (typeof res.flushHeaders === 'function') res.flushHeaders();

      const startedAt = new Date();
      const scanDepth = req.body.scanDepth || 'standard';
      const scanMode = req.body.scanMode || 'both';

      writeNdjson(res, { channel: 'meta', type: 'start', targetUrl, startedAt: startedAt.toISOString() });

      let inteleraAi = { available: false, reason: 'Skipped' };
      try {
        await streamInteleraAiPentestSync({
          targetUrl,
          fullCrew: process.env.PENTEST_INTELERA_FULL_CREW === 'true',
          onEvent: (evt) => {
            if (evt?.type === 'complete' && evt.result) {
              inteleraAi = { available: true, ...evt.result };
            }
            writeNdjson(res, { channel: 'intelera', ...evt });
          },
        });
      } catch (e) {
        inteleraAi = { available: false, error: e.message || String(e) };
        writeNdjson(res, { channel: 'intelera', type: 'error', message: inteleraAi.error });
      }

      const findings = [];
      let headers = {};
      let html = '';
      const discovered = [];
      const scripts = [];
      let nmap = { enabled: false, host: '', openPorts: [], raw: '' };

      try {
        const reach = await fetchWithTimeout(
          targetUrl,
          {
            redirect: 'follow',
            headers: { 'User-Agent': 'Intelera-Security-Checker/1.0 reachability' },
          },
          12000,
        );
        headers = Object.fromEntries(reach.headers.entries());
        html = await reach.text();
        discovered.push({ url: targetUrl, status: reach.status });
        if (!targetUrl.startsWith('https://')) {
          findings.push(
            finding('transport-http', 'high', 'Site is not using HTTPS', 'Enable HTTPS and redirect all HTTP traffic to TLS.'),
          );
        }
        scripts.push(...extractScriptSources(targetUrl, html));
        findings.push(...findingsFromInteleraAi(inteleraAi));
        writeNdjson(res, { channel: 'node', type: 'reachability', ok: true, status: reach.status });
      } catch {
        writeNdjson(res, {
          channel: 'node',
          type: 'error',
          message: 'Unable to reach target URL for scanning.',
        });
        res.end();
        return;
      }

      const host = new URL(targetUrl).hostname;
      nmap = {
        enabled: false,
        host,
        openPorts: [],
        raw: 'Port and service probing runs on the Intelera AI Python pentest engine (not duplicated on this Node server).',
      };

      const responsePayload = await finalizeInteleraPrimaryScan({
        targetUrl,
        startedAt,
        scanDepth,
        scanMode,
        inteleraAi,
        findings,
        headers,
        discovered,
        scripts,
        nmap,
      });
      writeNdjson(res, { channel: 'result', type: 'complete', payload: responsePayload });
      res.end();
    } catch (err) {
      console.error('[security-checker] /analyze-stream failed:', err?.stack || err);
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Security scan failed. Please try again.',
          detail: process.env.NODE_ENV !== 'production' ? err?.message : undefined,
        });
      } else if (!res.writableEnded) {
        writeNdjson(res, { channel: 'error', type: 'fatal', message: err?.message || String(err) });
        res.end();
      }
    }
  },
);

router.get('/records', authMiddleware, adminOnly, async (req, res) => {
  if (!isDbConnected()) return res.json([]);
  try {
    const rows = await SecurityScanRecord.find()
      .sort({ completedAt: -1 })
      .limit(500)
      .select('-result')
      .lean();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Failed to load records' });
  }
});

router.get('/records/:id', authMiddleware, adminOnly, async (req, res) => {
  if (!isDbConnected()) return res.status(404).json({ error: 'Not found' });
  try {
    const row = await SecurityScanRecord.findById(req.params.id).lean();
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch {
    res.status(400).json({ error: 'Invalid id' });
  }
});

router.delete('/records/:id', authMiddleware, adminOnly, async (req, res) => {
  if (!isDbConnected()) return res.status(503).json({ error: 'Database unavailable' });
  try {
    const row = await SecurityScanRecord.findByIdAndDelete(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true, id: req.params.id });
  } catch {
    res.status(400).json({ error: 'Invalid id' });
  }
});

export default router;
