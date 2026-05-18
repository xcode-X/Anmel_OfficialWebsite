/**
 * Default services used when API is unavailable (fallback for Nav and Services pages).
 * Each service includes detailed methodology, features, and targeted outcomes.
 */
export const defaultServices = [
  {
    slug: 'security-assessment',
    title: 'Security Assessment',
    shortDescription: 'Full-spectrum vulnerability assessments and penetration testing.',
    description: 'We identify and validate security weaknesses across your infrastructure, applications, and networks. Our assessments go beyond automated scanning to uncover complex logic flaws and chained vulnerabilities that attackers exploit.',
    features: [
      'In-depth Penetration Testing (Web, Network, API)',
      'Automated Vulnerability Scanning & Management',
      'Configuration Review for Cloud & On-Premise',
      'Prioritized Remediation Roadmaps',
      'Executive & Technical Reporting',
      'Post-Remediation Verification'
    ],
    process: [
      { step: 1, title: 'Reconnaissance', description: 'Information gathering and asset mapping.' },
      { step: 2, title: 'Vulnerability Analysis', description: 'Identifying potential entry points and misconfigurations.' },
      { step: 3, title: 'Exploitation', description: 'Manual verification of risks through controlled testing.' },
      { step: 4, title: 'Reporting', description: 'Detailed findings with risk scoring and mitigation steps.' }
    ],
    outcomes: 'A clear, validated map of your security posture with a prioritized plan to close critical gaps.'
  },
  {
    slug: 'secure-development',
    title: 'Secure Web Engineering',
    shortDescription: 'Security-by-design for modern web applications.',
    description: 'We help you build resilient applications by integrating security into every phase of the Software Development Life Cycle (SDLC). From initial threat modeling to secure code reviews and CI/CD security automation.',
    features: [
      'Threat Modeling & Secure Design Review',
      'Secure Code Review (Manual & Automated)',
      'CI/CD Pipeline Security Integration',
      'SAST, DAST & IAST Implementation',
      'Container & Microservices Hardening',
      'Developer Security Training'
    ],
    process: [
      { step: 1, title: 'Design Review', description: 'Identifying structural security flaws in early stages.' },
      { step: 2, title: 'Secure Coding', description: 'Helping developers implement best practices (OWASP Top 10).' },
      { step: 3, title: 'Automated Testing', description: 'Deploying security guards within your build pipelines.' },
      { step: 4, title: 'Compliance Check', description: 'Ensuring code meets regulatory and industry standards.' }
    ],
    outcomes: 'Applications that are resilient by design, reducing the cost of security fixes and accelerating time-to-market.'
  },
  {
    slug: 'compliance',
    title: 'Compliance & Audit Readiness',
    shortDescription: 'Navigating GDPR, SOC 2, and ISO 27001 with confidence.',
    description: 'We prepare your organization for successful audits by aligning your technical controls and policies with global standards. We provide the expertise needed to achieve and maintain complex compliance requirements.',
    features: [
      'GDPR & Data Privacy Assessments',
      'SOC 2 Type I & II Readiness Support',
      'ISO 27001 Implementation & Audit Prep',
      'Policy & Procedure Development',
      'Continuous Compliance Monitoring',
      'Third-party Risk Management'
    ],
    process: [
      { step: 1, title: 'Gap Discovery', description: 'Assessing current state against target framework.' },
      { step: 2, title: 'Remediation', description: 'Implementing required controls and evidence collection.' },
      { step: 3, title: 'Audit Simulation', description: 'Internal audit to verify readiness.' },
      { step: 4, title: 'Certification Support', description: 'Supporting you throughout the official audit process.' }
    ],
    outcomes: 'Achieved compliance certifications that build trust with enterprise partners and regulators.'
  },
  {
    slug: 'monitoring',
    title: 'Detection & Response',
    shortDescription: '24/7 visibility and rapid incident response.',
    description: 'We design and optimize security operations to detect threats in real-time. Our team helps you build the visibility and response capabilities needed to minimize the impact of security incidents.',
    features: [
      'SIEM Solution Design & Tuning',
      'Managed Detection & Response (MDR) Advisory',
      'Incident Response Plan Development',
      'Threat Hunting & Log Analysis',
      'Digital Forensics & Incident Analysis',
      'Post-Incident Recovery Support'
    ],
    process: [
      { step: 1, title: 'Visibility Prep', description: 'Defining high-value assets and log sources.' },
      { step: 2, title: 'Detection Logic', description: 'Building rules to identify abnormal behavior.' },
      { step: 3, title: 'Incident Response', description: 'Executing containment and eradication playbooks.' },
      { step: 4, title: 'Lessons Learned', description: 'Iterating on defenses based on real-world data.' }
    ],
    outcomes: 'Reduced mean-time-to-detection (MTTD) and effective response strategies that protect your business continuity.'
  },
  {
    slug: 'cloud-security',
    title: 'Cloud Security Architecture',
    shortDescription: 'Hardening AWS, Azure, and Google Cloud environments.',
    description: 'Secure your cloud transformation with expert architecture reviews and configuration hardening. We ensure your multi-cloud or hybrid environments are protected against common cloud-specific attack vectors.',
    features: [
      'Cloud Infrastructure Security Review',
      'IAM Policy & Permission Optimization',
      'Kubernetes & Docker Security',
      'Serverless Security Assessment',
      'Network Segmentation in the Cloud',
      'Cloud Compliance Automation'
    ],
    process: [
      { step: 1, title: 'Cloud Audit', description: 'Reviewing current cloud configuration and sprawl.' },
      { step: 2, title: 'Risk Mapping', description: 'Identifying identity and configuration risks.' },
      { step: 3, title: 'Hardening', description: 'Applying best practices and automated guards.' },
      { step: 4, title: 'Monitoring', description: 'Setting up cloud-native security alerts.' }
    ],
    outcomes: 'A hardened cloud footprint optimized for both security and operational efficiency.'
  },
  {
    slug: 'training',
    title: 'Security Awareness & Culture',
    shortDescription: 'Empowering your human firewall.',
    description: 'Security is a shared responsibility. We provide the training and simulations needed to build a security-first culture among your developers, executives, and general staff.',
    features: [
      'Security Awareness Training for Staff',
      'Secure Coding Workshops for Developers',
      'Phishing Simulation & Reporting',
      'Executive Security Briefings',
      'Custom Security Policy Training',
      'Social Engineering Assessments'
    ],
    process: [
      { step: 1, title: 'Baseline Check', description: 'Measuring current security awareness levels.' },
      { step: 2, title: 'Custom Training', description: 'Delivering role-based security education.' },
      { step: 3, title: 'Reinforcement', description: 'Running phishing exercises and workshops.' },
      { step: 4, title: 'Metric Analysis', description: 'Tracking improvements in security behavior.' }
    ],
    outcomes: 'A reduced human risk profile and a measurable increase in employee security vigilance.'
  }
];
