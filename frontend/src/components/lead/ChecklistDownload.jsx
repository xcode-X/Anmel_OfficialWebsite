import { useState } from 'react';
import { motion } from 'framer-motion';
import logoAnmel from '../../images/logo_anmel_transparent.png';

const checklistSections = [
  {
    title: 'Governance & Risk Management',
    items: [
      ['Maintain approved asset inventory', 'Weekly'],
      ['Classify business-critical data and owners', 'Quarterly'],
      ['Review vendor/security third-party exposure', 'Quarterly'],
      ['Track open risks with accountable owner + due date', 'Continuous'],
    ],
  },
  {
    title: 'Identity, Access & Endpoint Security',
    items: [
      ['Enable MFA for all privileged and remote access accounts', 'Immediate'],
      ['Enforce least-privilege and role-based access', 'Monthly review'],
      ['Disable stale accounts and orphaned credentials', 'Weekly'],
      ['Apply endpoint protection + EDR on all managed hosts', 'Continuous'],
    ],
  },
  {
    title: 'Application & API Security',
    items: [
      ['Use secure SDLC checklist before release', 'Per release'],
      ['Run dependency and SAST checks in CI/CD', 'Per build'],
      ['Validate input/output encoding and sanitize untrusted data', 'Per feature'],
      ['Protect APIs with auth, rate limit, and logging', 'Continuous'],
    ],
  },
  {
    title: 'Infrastructure, Cloud & Network',
    items: [
      ['Harden baseline configuration for servers/services', 'Quarterly'],
      ['Restrict exposed ports/services to approved business need', 'Weekly'],
      ['Enforce TLS, HSTS, and secure cipher policy', 'Continuous'],
      ['Segment production/staging/internal networks', 'Quarterly'],
    ],
  },
  {
    title: 'Monitoring, Incident Response & Recovery',
    items: [
      ['Centralize logs and alert on high-risk events', 'Continuous'],
      ['Test incident response runbooks with tabletop exercises', 'Quarterly'],
      ['Backup critical systems and test restore end-to-end', 'Monthly'],
      ['Define breach notification and stakeholder communication flow', 'Quarterly'],
    ],
  },
];

export default function ChecklistDownload() {
  const [downloaded, setDownloaded] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [orgName, setOrgName] = useState('Client Organization');
  const [industry, setIndustry] = useState('General');
  const [teamSize, setTeamSize] = useState('1-50');
  const [riskTier, setRiskTier] = useState('Medium');
  const [complianceScope, setComplianceScope] = useState('ISO 27001, SOC 2');

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const [
        docx,
        { saveAs },
      ] = await Promise.all([
        import('docx'),
        import('file-saver'),
      ]);

      const {
        Document,
        Packer,
        Paragraph,
        HeadingLevel,
        TextRun,
        Table,
        TableCell,
        TableRow,
        WidthType,
        BorderStyle,
        ImageRun,
      } = docx;

      const reviewDate = new Date();
      const nextReview = new Date(reviewDate);
      nextReview.setMonth(nextReview.getMonth() + 3);
      const assessmentId = `CHK-${Date.now().toString().slice(-8)}`;

      const tailoredRecommendations = [
        `Industry focus: ${industry} (${riskTier} risk profile).`,
        `Team size band: ${teamSize}. Define control ownership by function (IT, Security, Engineering, Operations).`,
        `Compliance targets: ${complianceScope}. Map each control to evidence artifacts before audit windows.`,
        'Use a weekly security standup to track overdue remediation and blocked controls.',
        'Run quarterly executive risk reviews with metrics: open high findings, MTTR, MFA coverage, backup restore success.',
      ];

      const rows = [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Control' })] }),
            new TableCell({ children: [new Paragraph({ text: 'Review cadence' })] }),
            new TableCell({ children: [new Paragraph({ text: 'Owner' })] }),
            new TableCell({ children: [new Paragraph({ text: 'Status' })] }),
          ],
        }),
        ...checklistSections.flatMap((section) =>
          section.items.map(([control, cadence]) =>
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: `${section.title}: ${control}` })] }),
                new TableCell({ children: [new Paragraph({ text: cadence })] }),
                new TableCell({ children: [new Paragraph({ text: '________________' })] }),
                new TableCell({ children: [new Paragraph({ text: 'Not started / In progress / Complete' })] }),
              ],
            })
          )
        ),
      ];

      let logoImage = null;
      try {
        const res = await fetch(logoAnmel);
        const img = await res.arrayBuffer();
        logoImage = new ImageRun({
          data: img,
          transformation: { width: 220, height: 70 },
        });
      } catch {
        logoImage = null;
      }

      const doc = new Document({
        sections: [
          {
            children: [
              ...(logoImage ? [new Paragraph({ children: [logoImage] })] : []),
              new Paragraph({
                heading: HeadingLevel.TITLE,
                children: [new TextRun({ text: 'Anmel Inc Client Security Checklist', bold: true })],
              }),
              new Paragraph({ text: 'Institution: Anmel Inc' }),
              new Paragraph({ text: `Client organization: ${orgName}` }),
              new Paragraph({ text: `Industry: ${industry}` }),
              new Paragraph({ text: `Team size: ${teamSize}` }),
              new Paragraph({ text: `Risk tier: ${riskTier}` }),
              new Paragraph({ text: `Compliance scope: ${complianceScope}` }),
              new Paragraph({ text: `Checklist ID: ${assessmentId}` }),
              new Paragraph({ text: `Generated: ${reviewDate.toLocaleDateString()}` }),
              new Paragraph({ text: `Next recommended review: ${nextReview.toLocaleDateString()}` }),
              new Paragraph({ text: '' }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'This checklist is customized for client operational readiness, application security, and governance best practices.',
                  }),
                ],
              }),
              new Paragraph({ text: '' }),
              new Paragraph({ heading: HeadingLevel.HEADING_2, text: 'Tailored Anmel Inc Recommendations' }),
              ...tailoredRecommendations.map((line, idx) =>
                new Paragraph({
                  children: [new TextRun({ text: `${idx + 1}. ${line}` })],
                })
              ),
              new Paragraph({ text: '' }),
              ...checklistSections.flatMap((section) => [
                new Paragraph({
                  heading: HeadingLevel.HEADING_2,
                  children: [new TextRun({ text: section.title, bold: true })],
                }),
                ...section.items.map(([item], idx) =>
                  new Paragraph({
                    children: [new TextRun({ text: `${idx + 1}. ${item}` })],
                  })
                ),
                new Paragraph({ text: '' }),
              ]),
              new Paragraph({ heading: HeadingLevel.HEADING_2, text: 'Control Matrix' }),
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows,
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
              new Paragraph({ heading: HeadingLevel.HEADING_2, text: 'Evidence & Sign-off' }),
              new Paragraph({ text: 'Security Lead: ____________________   Date: ____________' }),
              new Paragraph({ text: 'IT/Engineering Lead: ______________   Date: ____________' }),
              new Paragraph({ text: 'Executive Sponsor: ________________   Date: ____________' }),
              new Paragraph({ text: '' }),
              new Paragraph({
                children: [new TextRun({ text: 'Prepared by Anmel Inc | Monrovia, Liberia' })],
              }),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const safeClient = orgName.trim().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'client';
      saveAs(blob, `Anmel Inc-security-checklist-${safeClient}.docx`);
      setDownloaded(true);
    } catch (err) {
      console.error(err);
      alert('Could not generate checklist. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="w-full max-w-sm rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5"
    >
      <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Free resource</h4>
      <p className="mt-1.5 text-base font-semibold text-[#A78BFA]">Cybersecurity Checklist</p>
      <p className="mt-1 text-sm text-stone-400">Comprehensive, Anmel Inc-customized best-practice checklist for client security operations.</p>
      <div className="mt-4 space-y-2">
        <input
          type="text"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          placeholder="Client organization name"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="Industry"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
          />
          <select
            value={teamSize}
            onChange={(e) => setTeamSize(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
          >
            <option>1-50</option>
            <option>51-200</option>
            <option>201-1000</option>
            <option>1000+</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={riskTier}
            onChange={(e) => setRiskTier(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>
          <input
            type="text"
            value={complianceScope}
            onChange={(e) => setComplianceScope(e.target.value)}
            placeholder="Compliance scope"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
          />
        </div>
      </div>
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="mt-4 w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#7C3AED]/20 text-[#A78BFA] font-semibold text-sm border border-[#7C3AED]/30 hover:bg-[#7C3AED]/30 transition"
      >
        {downloading ? 'Preparing...' : downloaded ? 'Downloaded ✓' : 'Download checklist'}
      </button>
    </motion.div>
  );
}
