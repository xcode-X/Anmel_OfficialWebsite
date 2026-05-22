import { Activity, MessageSquare, ClipboardCheck } from 'lucide-react';
import { aboutGalleryImages } from './siteImages';

export const fieldEngagements = [
  {
    slug: 'security-operations',
    src: aboutGalleryImages.operations,
    alt: 'Security operations and monitoring context',
    seed: 'about-ops',
    title: 'Security operations',
    tag: 'Detect & respond',
    icon: Activity,
    desc: 'We stand up monitoring playbooks, tune detections to your real traffic, and run table-top exercises so your team handles incidents calmly when they happen.',
    bullets: ['SIEM / EDR tuning', 'Detection engineering', 'Incident playbooks'],
    color: '#0EA5E9',
    overview:
      'Our security operations engagements help you move from reactive firefighting to a measured detect-and-respond capability. We work alongside your team to tune alerts, document runbooks, and validate that escalation paths actually work under pressure.',
    whatWeDo: [
      'Baseline your current logging, SIEM, and EDR coverage against real attack patterns',
      'Tune noisy detections and add high-signal rules aligned to your threat model',
      'Facilitate tabletop exercises with engineering and leadership stakeholders',
      'Deliver incident playbooks with clear ownership, communication templates, and evidence trails',
    ],
    outcomes: [
      { value: '60%', label: 'Fewer false positives (typical)' },
      { value: '<4h', label: 'Mean time to triage target' },
      { value: '100%', label: 'Playbook coverage for critical assets' },
    ],
    relatedService: 'monitoring',
  },
  {
    slug: 'advisory-sessions',
    src: aboutGalleryImages.consultation,
    alt: 'Consultation and working session',
    seed: 'about-consult',
    title: 'Advisory sessions',
    tag: 'Workshops & strategy',
    icon: MessageSquare,
    desc: 'Senior consultants walk leadership and engineering through findings, threat models, and remediation roadmaps—translating risk into clear business priorities.',
    bullets: ['Executive briefings', 'Threat modeling', 'Roadmap planning'],
    color: '#7C3AED',
    overview:
      'Advisory sessions are where technical risk meets business decision-making. We facilitate structured workshops that give executives clarity on exposure, give engineers actionable priorities, and leave everyone aligned on what to fix first.',
    whatWeDo: [
      'Executive-ready briefings that translate findings into business impact and cost of delay',
      'Collaborative threat modeling for critical workflows, APIs, and data stores',
      'Prioritized remediation roadmaps with effort estimates and dependency mapping',
      'Quarterly check-ins to track progress and adjust scope as your environment evolves',
    ],
    outcomes: [
      { value: '1–2 days', label: 'Typical workshop duration' },
      { value: 'Top 10', label: 'Prioritized actions from day one' },
      { value: '90 days', label: 'Roadmap horizon we plan against' },
    ],
    relatedService: 'security-assessment',
  },
  {
    slug: 'architecture-review',
    src: aboutGalleryImages.collaboration,
    alt: 'Collaborative planning and architecture review',
    seed: 'about-team',
    title: 'Architecture review',
    tag: 'Build it secure',
    icon: ClipboardCheck,
    desc: 'Hands-on reviews of code, cloud, and identity—paired with concrete fixes documented as tickets your engineers can pick up and ship the same sprint.',
    bullets: ['Cloud & IAM review', 'Secure code review', 'Actionable tickets'],
    color: '#F97316',
    overview:
      'Architecture reviews go deep on how your systems are actually built—not just how they are documented. We examine cloud configurations, identity boundaries, and application code to surface design-level weaknesses before they become production incidents.',
    whatWeDo: [
      'Review cloud IAM, network segmentation, and secrets management patterns',
      'Perform targeted secure code review on high-risk modules and auth flows',
      'Validate third-party integrations and data-handling boundaries',
      'File actionable tickets with severity, reproduction steps, and fix guidance',
    ],
    outcomes: [
      { value: 'Same sprint', label: 'Engineers can start fixes immediately' },
      { value: '3 layers', label: 'Cloud, identity & application coverage' },
      { value: 'Evidence', label: 'Every finding backed by proof' },
    ],
    relatedService: 'secure-development',
  },
];

export function getFieldEngagement(slug) {
  return fieldEngagements.find((item) => item.slug === slug) ?? null;
}
