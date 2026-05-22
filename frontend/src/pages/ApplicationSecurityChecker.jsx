import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  GitBranch,
  Layers,
  ListOrdered,
  Radar,
  ShieldAlert,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from 'docx';
import { api, securityChecker } from '../lib/api';
import { notifySecurityScanComplete } from '../lib/securityScanBroadcast';
import logoAnmel from '../images/logo_anmel_transparent.png';

const severityClasses = {
  high: 'border-red-400/40 bg-red-500/10 text-red-300',
  medium: 'border-amber-400/40 bg-amber-500/10 text-amber-300',
  low: 'border-sky-400/40 bg-sky-500/10 text-sky-300',
};

export default function ApplicationSecurityChecker() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  /** Live Anmel Inc NDJSON events (tick/session) while stream is active */
  const [livePentest, setLivePentest] = useState([]);

  const institutionName = 'Anmel Inc';
  const clientName = 'Client Organization';
  const analystName = 'Anmel Inc Security Team';
  const confidentiality = 'Confidential';
  const scanMode = 'both';
  const scanDepth = 'in-depth';

  const counts = useMemo(() => {
    const findings = result?.findings || [];
    return {
      high: findings.filter((f) => f.severity === 'high').length,
      medium: findings.filter((f) => f.severity === 'medium').length,
      low: findings.filter((f) => f.severity === 'low').length,
    };
  }, [result]);

  const runCheck = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLivePentest([]);
    setLoading(true);

    const phases = ['Connecting to Anmel Inc AI pentest engine...', 'Live tools on target...', 'Synthesizing report...'];
    let idx = 0;
    setPhase(phases[idx]);
    const ticker = window.setInterval(() => {
      idx = (idx + 1) % phases.length;
      setPhase(phases[idx]);
    }, 1400);

    const tryLiveStream = async () => {
      const res = await fetch('/api/security-checker/analyze-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/x-ndjson' },
        body: JSON.stringify({ url, scanMode, scanDepth }),
      });
      if (res.status === 400) {
        return { fallback: true, gotPayload: false };
      }
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || res.statusText);
      }
      if (!res.body?.getReader) {
        return { fallback: true, gotPayload: false };
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let gotPayload = false;
      let capturedPayload = null;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let nl;
        while ((nl = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, nl).trim();
          buffer = buffer.slice(nl + 1);
          if (!line) continue;
          try {
            const obj = JSON.parse(line);
            if (obj.channel === 'Anmel Inc' && (obj.type === 'tick' || obj.type === 'session')) {
              if (obj.type === 'session') {
                setLivePentest((prev) =>
                  [
                    ...prev,
                    {
                      id: `sess-${obj.session_id}-${prev.length}`,
                      phase: 'session',
                      n: '',
                      summary: `Engagement started · ${obj.session_id || ''}`,
                    },
                  ].slice(-120),
                );
              } else {
                const phaseLabel = obj.phase || obj.tick?.phase || '?';
                const n = obj.n ?? '';
                const summary =
                  obj.tick?.output != null
                    ? JSON.stringify(obj.tick.output).slice(0, 160)
                    : obj.tick?.phase || '';
                setLivePentest((prev) =>
                  [...prev, { id: `${Date.now()}-${prev.length}`, phase: phaseLabel, n, summary }].slice(-120),
                );
              }
            }
            if (obj.channel === 'result' && obj.type === 'complete' && obj.payload) {
              capturedPayload = obj.payload;
              setResult(obj.payload);
              gotPayload = true;
            }
          } catch {
            /* ignore bad line */
          }
        }
      }
      return { fallback: false, gotPayload, payload: capturedPayload };
    };

    try {
      const streamResult = await tryLiveStream();
      let finalResult = streamResult.payload || null;
      if (streamResult.fallback || !streamResult.gotPayload) {
        finalResult = await api.post('/security-checker/analyze', { url, scanMode, scanDepth });
      }
      if (finalResult) {
        setResult(finalResult);
        await securityChecker.persistRecord(finalResult, { url, scanMode, scanDepth });
      }
      setPhase('Analysis completed.');
      notifySecurityScanComplete();
    } catch (err) {
      setError(err.message || 'Security check failed.');
      setPhase('');
    } finally {
      window.clearInterval(ticker);
      setLoading(false);
    }
  };

  const downloadPdfReport = () => {
    if (!result) return;
    const doc = new jsPDF();
    let y = 14;
    const reportId = `INT-${Date.now().toString().slice(-8)}`;
    const assessmentDate = new Date(result.completedAt || Date.now()).toLocaleDateString();

    const line = (text, gap = 7) => {
      const chunks = doc.splitTextToSize(String(text), 180);
      doc.text(chunks, 14, y);
      y += chunks.length * 6 + (gap - 6);
      if (y > 275) {
        doc.addPage();
        y = 14;
      }
    };

    // Cover page
    doc.setFontSize(18);
    doc.text(institutionName, 14, 22);
    doc.setFontSize(15);
    doc.text('Executive Security Assessment Report', 14, 33);
    doc.setFontSize(11);
    doc.text(`Client: ${clientName}`, 14, 48);
    doc.text(`Target: ${result.targetUrl}`, 14, 56);
    doc.text(`Assessment Date: ${assessmentDate}`, 14, 64);
    doc.text(`Analyst: ${analystName}`, 14, 72);
    doc.text(`Report ID: ${reportId}`, 14, 80);
    doc.text(`Confidentiality: ${confidentiality}`, 14, 88);
    doc.text('Scope: External web application and network surface analysis (defensive, non-destructive).', 14, 100, { maxWidth: 180 });
    doc.text('Authorized Use Only: This report is provided to the named client and approved stakeholders.', 14, 114, { maxWidth: 180 });
    doc.text('Analyst Signature: ________________________________', 14, 130);
    doc.text('Client Acknowledgement: ____________________________', 14, 142);
    doc.text(`${institutionName} - Monrovia, Liberia`, 14, 270);
    doc.addPage();
    y = 14;

    doc.setFontSize(12);
    line('Anmel Inc Application Security Assessment Report', 9);
    line(`Target: ${result.targetUrl}`);
    line(`Scan Mode: ${result.scanMode} | Depth: ${result.scanDepth}`);
    line(`Started: ${new Date(result.startedAt).toLocaleString()}`);
    line(`Completed: ${new Date(result.completedAt).toLocaleString()}`, 10);

    line('Pentest type & methodology', 8);
    line(result.pentestReport?.assessmentType || `Engine: ${result.pentestEngine || 'unknown'}`);
    line(result.pentestReport?.assessmentSummary || result.coverageNote || '', 8);
    if (result.pentestReport?.scanConfiguration) {
      const sc = result.pentestReport.scanConfiguration;
      line(`Configuration: ${sc.modeLabel || result.scanMode} · ${sc.depthLabel || result.scanDepth}`, 8);
    }
    if (result.pentestReport?.methods?.length) {
      line('Methods & techniques used:', 6);
      result.pentestReport.methods.forEach((m, i) => {
        line(`${i + 1}. ${m.name}: ${m.detail}`, 6);
      });
    }
    if (result.pentestReport?.process?.length) {
      line('Process performed', 6);
      result.pentestReport.process.forEach((p) => {
        line(`${p.order}. ${p.phase}: ${p.detail}`, 6);
      });
    }
    if (result.pentestReport?.findingsOverview) {
      const fo = result.pentestReport.findingsOverview;
      line(
        `Findings recorded: ${fo.total ?? 0} total (High ${fo.high ?? 0}, Medium ${fo.medium ?? 0}, Low ${fo.low ?? 0})`,
        10,
      );
    }

    line('Executive Summary', 8);
    line(`Risk Score: ${result.executiveSummary?.riskScore ?? 'N/A'} / 100`);
    line(`Posture: ${result.executiveSummary?.posture || 'N/A'}`);
    line(result.executiveSummary?.keyMessage || '', 10);

    line('Attack Scenario Model', 8);
    if (result.attackScenarios?.length) {
      result.attackScenarios.forEach((s, idx) => {
        line(`${idx + 1}. ${s.name} [Priority ${s.mitigationPriority}]`);
        line(`   Likelihood: ${s.likelihood} | Impact: ${s.impact} | Confidence: ${s.confidence}`);
        line(`   Path: ${s.attackPath}`);
        line(`   Business Risk: ${s.businessRisk}`);
        line(`   Mitigation: ${s.mitigation}`, 8);
      });
    } else {
      line('No specific attack scenarios were inferred from current findings.', 10);
    }

    line('Risk Summary', 8);
    line(`High: ${counts.high} | Medium: ${counts.medium} | Low: ${counts.low}`, 10);

    line('OWASP/CWE-mapped Findings', 8);
    if (result.findings?.length) {
      result.findings.forEach((f, idx) => {
        line(`${idx + 1}. ${f.title} [${String(f.severity).toUpperCase()}]`);
        line(`   Method: finding derived from ${result.pentestEngine === 'anmel-ai-python' ? 'Anmel Inc AI + reachability' : 'Node passive/active checks'}${result.pentestEngine === 'anmel-ai-python' && result.inteleraAi?.available ? ' (primary engine)' : ''}.`);
        line(`   OWASP: ${f.owasp || 'N/A'} | CWE: ${f.cwe || 'N/A'}`);
        line(`   Detail: ${f.details}`, 8);
      });
    } else {
      line('No findings available.', 10);
    }

    line('Weakness Examples (Defensive)', 8);
    if (result.weaknessExamples?.length) {
      result.weaknessExamples.forEach((w, idx) => {
        line(`${idx + 1}. ${w.name} [Risk: ${w.risk}]`);
        line(`   Typical abuse: ${w.abused}`);
        line(`   Recommended mitigation: ${w.mitigation}`, 8);
      });
    } else {
      line('No weakness examples generated for this scan.', 10);
    }

    line('Network Surface (Nmap)', 8);
    if (result.nmap?.enabled) {
      line(`Host: ${result.nmap.host}`);
      line(`Open ports discovered: ${result.nmap.openPorts.length}`);
      result.nmap.openPorts.slice(0, 40).forEach((p) => line(`- ${p}`));
    } else {
      line(`Host: ${result.nmap?.host || 'N/A'}`);
      line(result.nmap?.raw || 'Nmap scan not available in this runtime.');
    }

    line('AI Recommendations', 8);
    line(result.aiSummary?.text || 'No AI recommendations returned.', 10);

    line('Discovered Endpoints', 8);
    if (result.discovered?.length) {
      result.discovered.slice(0, 120).forEach((d) => line(`- ${d.status} ${d.url}`));
    } else {
      line('No additional endpoints discovered.');
    }

    line('Coverage & Legal Notes', 8);
    line(result.coverageNote || '');
    line(result.legalNote || '');

    const safeHost = (new URL(result.targetUrl)).hostname.replace(/[^a-z0-9.-]/gi, '_');
    doc.save(`Anmel Inc-security-assessment-${safeHost}.pdf`);
  };

  const downloadWordReport = async () => {
    if (!result) return;
    const reportId = `INT-${Date.now().toString().slice(-8)}`;
    const assessmentDate = new Date(result.completedAt || Date.now()).toLocaleDateString();
    const safeHost = (new URL(result.targetUrl)).hostname.replace(/[^a-z0-9.-]/gi, '_');

    let logoImage = null;
    try {
      const res = await fetch(logoAnmel);
      const buffer = await res.arrayBuffer();
      logoImage = new ImageRun({
        data: buffer,
        transformation: { width: 220, height: 70 },
      });
    } catch {
      logoImage = null;
    }

    const sectionChildren = [];
    if (logoImage) {
      sectionChildren.push(
        new Paragraph({ alignment: AlignmentType.LEFT, children: [logoImage] }),
      );
    }

    sectionChildren.push(
      new Paragraph({
        heading: HeadingLevel.TITLE,
        children: [new TextRun({ text: institutionName, bold: true })],
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: 'Executive Security Assessment Report', bold: true })],
      }),
      new Paragraph({ text: '' }),
      new Paragraph({ children: [new TextRun({ text: `Client: ${clientName}`, bold: true })] }),
      new Paragraph({ text: `Target: ${result.targetUrl}` }),
      new Paragraph({ text: `Assessment Date: ${assessmentDate}` }),
      new Paragraph({ text: `Analyst: ${analystName}` }),
      new Paragraph({ text: `Report ID: ${reportId}` }),
      new Paragraph({ text: `Confidentiality: ${confidentiality}` }),
      new Paragraph({ text: '' }),
      new Paragraph({ text: 'Scope: External web application and network surface analysis (defensive, non-destructive).' }),
      new Paragraph({ text: 'Authorized Use: This report is for approved stakeholders only.' }),
      new Paragraph({ text: '' }),
      new Paragraph({ children: [new TextRun({ text: 'Analyst Signature: ________________________________' })] }),
      new Paragraph({ children: [new TextRun({ text: 'Client Acknowledgement: ____________________________' })] }),
      new Paragraph({ text: '' }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, text: 'Pentest type & methodology' }),
      new Paragraph({
        children: [new TextRun({ text: result.pentestReport?.assessmentType || `Engine: ${result.pentestEngine || ''}`, bold: true })],
      }),
      new Paragraph({ text: result.pentestReport?.assessmentSummary || result.coverageNote || '' }),
      new Paragraph({
        text: result.pentestReport?.scanConfiguration
          ? `Configuration: ${result.pentestReport.scanConfiguration.modeLabel} · ${result.pentestReport.scanConfiguration.depthLabel}`
          : `Scan mode: ${result.scanMode} · Depth: ${result.scanDepth}`,
      }),
      new Paragraph({ text: '' }),
      new Paragraph({ heading: HeadingLevel.HEADING_3, text: 'Methods & techniques' }),
      ...(result.pentestReport?.methods?.length
        ? result.pentestReport.methods.map(
            (m, i) =>
              new Paragraph({
                text: `${i + 1}. ${m.name}: ${m.detail}`,
              }),
          )
        : [new Paragraph({ text: 'See coverage note for techniques used.' })]),
      new Paragraph({ text: '' }),
      new Paragraph({ heading: HeadingLevel.HEADING_3, text: 'Process' }),
      ...(result.pentestReport?.process?.length
        ? result.pentestReport.process.map((p) => new Paragraph({ text: `${p.order}. ${p.phase}: ${p.detail}` }))
        : [new Paragraph({ text: 'Process details not available for this export.' })]),
      new Paragraph({ text: '' }),
      new Paragraph({
        children: [
          new TextRun({
            text: result.pentestReport?.findingsOverview
              ? `Findings recorded: ${result.pentestReport.findingsOverview.total} total (High ${result.pentestReport.findingsOverview.high}, Medium ${result.pentestReport.findingsOverview.medium}, Low ${result.pentestReport.findingsOverview.low})`
              : '',
          }),
        ],
      }),
      new Paragraph({ text: '' }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, text: 'Executive Summary' }),
      new Paragraph({ text: `Risk Score: ${result.executiveSummary?.riskScore ?? 'N/A'} / 100` }),
      new Paragraph({ text: `Posture: ${result.executiveSummary?.posture || 'N/A'}` }),
      new Paragraph({ text: result.executiveSummary?.keyMessage || '' }),
      new Paragraph({ text: '' }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, text: 'Risk Summary' }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ text: 'High' })] }),
              new TableCell({ children: [new Paragraph({ text: String(counts.high) })] }),
              new TableCell({ children: [new Paragraph({ text: 'Medium' })] }),
              new TableCell({ children: [new Paragraph({ text: String(counts.medium) })] }),
              new TableCell({ children: [new Paragraph({ text: 'Low' })] }),
              new TableCell({ children: [new Paragraph({ text: String(counts.low) })] }),
            ],
          }),
        ],
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: '777777' },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: '777777' },
          left: { style: BorderStyle.SINGLE, size: 1, color: '777777' },
          right: { style: BorderStyle.SINGLE, size: 1, color: '777777' },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
          insideVertical: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
        },
      }),
      new Paragraph({ text: '' }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, text: 'Findings (OWASP/CWE mapped)' }),
    );

    if (result.findings?.length) {
      result.findings.forEach((f, idx) => {
        sectionChildren.push(
          new Paragraph({ children: [new TextRun({ text: `${idx + 1}. ${f.title}`, bold: true })] }),
          new Paragraph({ text: `Severity: ${String(f.severity).toUpperCase()} | OWASP: ${f.owasp || 'N/A'} | CWE: ${f.cwe || 'N/A'}` }),
          new Paragraph({
            text: `Method: finding derived from ${
              result.pentestEngine === 'anmel-ai-python' ? 'Anmel Inc AI + reachability' : 'Node passive/active checks'
            }${result.pentestEngine === 'anmel-ai-python' && result.inteleraAi?.available ? ' (primary engine)' : ''}.`,
          }),
          new Paragraph({ text: f.details }),
        );
      });
    } else {
      sectionChildren.push(new Paragraph({ text: 'No findings generated.' }));
    }

    sectionChildren.push(
      new Paragraph({ text: '' }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, text: 'AI Recommendations' }),
      new Paragraph({ text: result.aiSummary?.text || 'No AI recommendations returned.' }),
      new Paragraph({ text: '' }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, text: 'Coverage & Legal Notes' }),
      new Paragraph({ text: result.coverageNote || '' }),
      new Paragraph({ text: result.legalNote || '' }),
    );

    const doc = new Document({
      sections: [{ children: sectionChildren }],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Anmel Inc-security-assessment-${safeHost}.docx`);
  };

  return (
    <div className="min-h-screen bg-[#040914] pt-28 text-white">
      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0A1529] via-[#0A1122] to-[#111827] p-8 shadow-[0_20px_80px_rgba(2,8,23,0.55)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#22D3EE]/30 bg-[#06B6D4]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#67E8F9]">
            <Radar className="h-4 w-4" />
            Application Security Checker
          </div>
          <h1 className="mt-5 text-3xl font-bold sm:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
            Anmel Inc AI
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300">
            Authorized targets only. With the Anmel Inc AI Python service configured, scans use a{' '}
            <span className="font-semibold text-cyan-100">live NDJSON stream</span>: each pentest loop tick and phase is
            pushed to your browser in real time while tools run against the target, then the full report is delivered when
            the engagement completes. Node still adds reachability and basic transport checks.
          </p>

          <form onSubmit={runCheck} className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yourdomain.com"
              className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE]"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-[#22D3EE] to-[#0EA5E9] px-5 py-3 text-sm font-semibold text-[#04111E] disabled:opacity-50"
            >
              {loading ? 'Scanning...' : 'Run live check'}
            </button>
          </form>

          {phase && <p className="mt-3 text-xs text-cyan-300">{phase}</p>}
          {error && <p className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

          {(loading || livePentest.length > 0) && (
            <div className="mt-6 rounded-2xl border border-cyan-500/25 bg-black/30 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-cyan-100">
                <Activity className="h-4 w-4 animate-pulse text-cyan-400" />
                Live pentest feed (tools on target)
              </div>
              <p className="mb-3 text-xs text-slate-500">
                Streamed from the Anmel Inc AI Python engine: session start, each loop tick (phase / tool output), then the
                compiled report.
              </p>
              <div className="max-h-52 space-y-1.5 overflow-y-auto font-mono text-[11px] text-slate-300">
                {livePentest.length === 0 && loading && (
                  <div className="text-slate-500">Waiting for first event from pentest engine…</div>
                )}
                {livePentest.map((row) => (
                  <div key={row.id} className="rounded border border-white/5 bg-white/[0.03] px-2 py-1">
                    <span className="text-cyan-500/90">{row.phase}</span>
                    {row.n !== '' && row.n != null && <span className="text-slate-500"> · tick {row.n}</span>}
                    {row.summary ? <span className="mt-0.5 block text-slate-400">{row.summary}</span> : null}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {result && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-6">
            <div className="flex justify-end">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={downloadPdfReport}
                  className="rounded-lg border border-[#22D3EE]/40 bg-[#0EA5E9]/10 px-4 py-2 text-sm font-semibold text-[#67E8F9]"
                >
                  Download PDF report
                </button>
                <button
                  type="button"
                  onClick={downloadWordReport}
                  className="rounded-lg border border-violet-400/40 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-200"
                >
                  Download Word report
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-950/30 via-[#0A1529]/80 to-transparent p-5">
              <h2 className="mb-3 flex flex-wrap items-center gap-2 text-lg font-semibold text-white">
                <Layers className="h-5 w-5 text-emerald-300" />
                Pentesting report — type, methods &amp; process
              </h2>
              <p className="text-sm font-semibold text-emerald-100">
                {result.pentestReport?.assessmentType ||
                  (result.pentestEngine === 'anmel-ai-python'
                    ? 'Anmel Inc AI Python (primary) assessment'
                    : 'Node-based security assessment')}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                {result.pentestReport?.assessmentSummary || result.coverageNote}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1">
                  Engine: <span className="font-mono text-slate-200">{result.pentestEngine}</span>
                </span>
                <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1">
                  {result.pentestReport?.scanConfiguration?.modeLabel || result.scanMode} ·{' '}
                  {result.pentestReport?.scanConfiguration?.depthLabel || result.scanDepth}
                </span>
                {result.pentestReport?.findingsOverview && (
                  <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1">
                    Findings: {result.pentestReport.findingsOverview.total} total (H {result.pentestReport.findingsOverview.high} / M{' '}
                    {result.pentestReport.findingsOverview.medium} / L {result.pentestReport.findingsOverview.low})
                  </span>
                )}
              </div>

              <div className="mt-5 grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-100">
                    <Wrench className="h-4 w-4 text-cyan-400" />
                    Methods &amp; techniques used
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-300">
                    {(result.pentestReport?.methods?.length ? result.pentestReport.methods : []).map((m) => (
                      <li key={m.id} className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                        <span className="font-medium text-cyan-100">{m.name}</span>
                        <span className="mt-1 block text-xs text-slate-400">{m.detail}</span>
                      </li>
                    ))}
                    {!result.pentestReport?.methods?.length && (
                      <li className="text-slate-500">Method details follow server checks (see checksRun in API).</li>
                    )}
                  </ul>
                </div>
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-100">
                    <ListOrdered className="h-4 w-4 text-violet-400" />
                    Process
                  </h3>
                  <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-300">
                    {(result.pentestReport?.process?.length ? result.pentestReport.process : []).map((p) => (
                      <li key={p.order} className="marker:text-violet-400">
                        <span className="font-medium text-slate-100">{p.phase}</span>
                        <span className="mt-0.5 block text-xs text-slate-400">{p.detail}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>

            {result.inteleraAi != null && (
              <div className="rounded-2xl border border-cyan-400/25 bg-gradient-to-br from-cyan-950/50 via-[#0A1529]/80 to-transparent p-5">
                <h2 className="mb-3 flex flex-wrap items-center gap-2 text-lg font-semibold text-white">
                  <Bot className="h-5 w-5 text-cyan-300" />
                  {result.pentestEngine === 'anmel-ai-python' ? 'Primary: Anmel Inc AI Python' : 'Anmel Inc AI — supplement'}
                  {result.pentestEngine === 'anmel-ai-python' && (
                    <span className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                      Main engine
                    </span>
                  )}
                </h2>
                {!result.inteleraAi.available && (
                  <p className="text-sm text-slate-400">
                    {result.inteleraAi.reason ||
                      result.inteleraAi.error ||
                      'Connect the Python pentest service (see server PENTEST_PLATFORM_URL) to enable live tool orchestration.'}
                  </p>
                )}
                {result.inteleraAi.available && (
                  <div className="space-y-4 text-sm text-slate-200">
                    <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                      {result.inteleraAi.session_id && (
                        <span>
                          Session: <span className="font-mono text-cyan-200">{result.inteleraAi.session_id}</span>
                        </span>
                      )}
                      {result.inteleraAi.ticks != null && <span>Ticks: {result.inteleraAi.ticks}</span>}
                      {result.inteleraAi.last_tick?.reason && (
                        <span>Outcome: {String(result.inteleraAi.last_tick.reason)}</span>
                      )}
                    </div>
                    {(() => {
                      const pathList =
                        result.inteleraAi.attack_paths?.length > 0
                          ? result.inteleraAi.attack_paths
                          : result.inteleraAi.agent_memory?.ranked_paths || [];
                      return pathList.length > 0;
                    })() && (
                      <div>
                        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-cyan-100">
                          <GitBranch className="h-4 w-4" />
                          Ranked attack paths
                        </h3>
                        <div className="max-h-56 space-y-2 overflow-y-auto">
                          {(result.inteleraAi.attack_paths?.length > 0
                            ? result.inteleraAi.attack_paths
                            : result.inteleraAi.agent_memory?.ranked_paths || []
                          ).map((p) => (
                            <div
                              key={p.id || p.summary}
                              className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs"
                            >
                              <div className="flex justify-between gap-2 text-slate-300">
                                <span className="font-semibold text-amber-100">Risk {p.risk_score}</span>
                              </div>
                              <p className="mt-1 text-slate-300">{p.summary}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {result.inteleraAi.agent_logs?.length > 0 && (
                      <div>
                        <h3 className="mb-2 text-sm font-semibold text-slate-200">Agent activity</h3>
                        <div className="max-h-40 space-y-1 overflow-y-auto font-mono text-[11px] text-slate-400">
                          {result.inteleraAi.agent_logs.slice(0, 12).map((log) => (
                            <div key={log.id} className="rounded border border-white/5 px-2 py-1">
                              <span className="text-cyan-400">{log.agent}</span> · {log.message}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4">
                <p className="text-xs uppercase tracking-wider text-red-200">High risk</p>
                <p className="mt-2 text-3xl font-bold text-red-100">{counts.high}</p>
              </div>
              <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4">
                <p className="text-xs uppercase tracking-wider text-amber-200">Medium risk</p>
                <p className="mt-2 text-3xl font-bold text-amber-100">{counts.medium}</p>
              </div>
              <div className="rounded-xl border border-sky-400/30 bg-sky-500/10 p-4">
                <p className="text-xs uppercase tracking-wider text-sky-200">Low risk</p>
                <p className="mt-2 text-3xl font-bold text-sky-100">{counts.low}</p>
              </div>
            </div>

            {result.executiveSummary && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <h2 className="mb-3 text-lg font-semibold">Executive Summary</h2>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-wider text-slate-400">Risk score</p>
                    <p className="mt-1 text-3xl font-bold text-white">{result.executiveSummary.riskScore}/100</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:col-span-2">
                    <p className="text-xs uppercase tracking-wider text-slate-400">Posture</p>
                    <p className="mt-1 text-base font-semibold text-slate-100">{result.executiveSummary.posture}</p>
                    <p className="mt-2 text-sm text-slate-300">{result.executiveSummary.keyMessage}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <AlertTriangle className="h-5 w-5 text-red-300" />
                Real-time Attack Scenario Model
              </h2>
              {result.attackScenarios?.length ? (
                <div className="space-y-3">
                  {result.attackScenarios.map((s) => (
                    <div key={s.name} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-white">{s.name}</p>
                        <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-0.5 text-[11px] font-semibold text-cyan-200">
                          {s.mitigationPriority}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-slate-300">
                        Likelihood: {s.likelihood} · Impact: {s.impact} · Confidence: {s.confidence}
                      </p>
                      <p className="mt-2 text-sm text-slate-200"><span className="font-semibold">Path:</span> {s.attackPath}</p>
                      <p className="mt-1 text-sm text-slate-200"><span className="font-semibold">Business risk:</span> {s.businessRisk}</p>
                      <p className="mt-1 text-sm text-cyan-200"><span className="font-semibold">Recommended action:</span> {s.mitigation}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-300">No specific attack scenarios inferred from this scan cycle.</p>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h2 className="mb-3 text-lg font-semibold">OWASP Report Structure</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {(result.methodology?.standard || []).map((step) => (
                  <div key={step} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-200">
                    {step}
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-400">{result.methodology?.framework}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Bot className="h-5 w-5 text-cyan-300" />
                AI Agent Recommendations ({result.aiSummary?.provider || 'fallback'})
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-200">{result.aiSummary?.text}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h2 className="mb-3 text-lg font-semibold">Weakness Examples (Defensive)</h2>
              {result.weaknessExamples?.length ? (
                <div className="space-y-3">
                  {result.weaknessExamples.map((w) => (
                    <div key={w.name} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="font-semibold text-white">{w.name}</p>
                      <p className="mt-1 text-xs text-slate-300">Risk: {w.risk}</p>
                      <p className="mt-1 text-sm text-slate-200"><span className="font-semibold">Typical abuse:</span> {w.abused}</p>
                      <p className="mt-1 text-sm text-cyan-200"><span className="font-semibold">Mitigation:</span> {w.mitigation}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-300">No weakness examples generated for this scan.</p>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h2 className="mb-3 text-lg font-semibold">Network Surface (Nmap)</h2>
              {result.nmap?.enabled ? (
                <div>
                  <p className="text-sm text-slate-300">Host: {result.nmap.host}</p>
                  <p className="mt-1 text-sm text-slate-300">Open ports: {result.nmap.openPorts.length}</p>
                  <div className="mt-3 max-h-48 overflow-y-auto rounded-lg border border-white/10 bg-black/30 p-3 text-xs text-slate-200">
                    {result.nmap.openPorts.length
                      ? result.nmap.openPorts.map((p) => <div key={p}>{p}</div>)
                      : <div>No open top ports detected.</div>}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-300">{result.nmap?.raw || 'Nmap was not available in this runtime.'}</p>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <ShieldAlert className="h-5 w-5 text-amber-300" />
                Findings
              </h2>
              <p className="mb-4 text-xs text-slate-400">
                These findings come from the assessment pipeline summarized in <span className="text-slate-300">Pentesting report</span>{' '}
                above (type, methods, process). Each item includes severity, defensive OWASP/CWE-style mapping where applicable, and
                remediation context.
              </p>
              <div className="space-y-3">
                {result.findings?.length ? (
                  result.findings.map((item) => (
                    <div key={item.id} className={`rounded-xl border p-4 ${severityClasses[item.severity] || severityClasses.low}`}>
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold">{item.title}</p>
                        <span className="text-xs uppercase tracking-wider">{item.severity}</span>
                      </div>
                      {(item.owasp || item.cwe) && (
                        <p className="mt-1 text-[11px] text-slate-400">
                          {item.owasp && <span className="mr-2">OWASP: {item.owasp}</span>}
                          {item.cwe && <span>CWE: {item.cwe}</span>}
                        </p>
                      )}
                      <p className="mt-1 text-sm opacity-95">{item.details}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-emerald-200">
                    <div className="flex items-center gap-2 font-semibold"><CheckCircle2 className="h-4 w-4" /> No obvious passive findings</div>
                    <p className="mt-1 text-sm">Continue with authenticated and code-level testing for deeper coverage.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
              <p className="mb-2">
                Scan mode: <span className="font-semibold text-slate-100">{result.scanMode}</span> · Depth:{' '}
                <span className="font-semibold text-slate-100">{result.scanDepth}</span>
              </p>
              {result.coverageNote && <p className="mb-2">{result.coverageNote}</p>}
              <p className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-cyan-300" />
                {result.legalNote || 'Only test systems you own or are explicitly authorized to assess.'}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
