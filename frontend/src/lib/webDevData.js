import {
  Code, Layout, Database, Search, Smartphone, Shield, Globe, Layers, Zap,
  GitBranch, Palette, Server, Lock, Compass, PenTool, Hammer, Rocket,
} from 'lucide-react';
import {
  capabilityImages, caseStudyImages, blogImages, aboutGalleryImages,
} from './siteImages';

export const webDevStats = [
  { value: '80+', label: 'Web projects shipped' },
  { value: '40+', label: 'Active client accounts' },
  { value: '4+', label: 'Years building for web' },
  { value: '98%', label: 'On-time delivery rate' },
];

export const webServices = [
  {
    title: 'Custom web applications',
    description: 'Internal tools, customer portals, and SaaS products built on modern stacks—with auth, roles, and audit trails from the first sprint.',
    icon: Code,
    image: capabilityImages.webdev,
    features: ['React & Node.js', 'Role-based access', 'API-first architecture', 'Production monitoring'],
    color: '#0EA5E9',
  },
  {
    title: 'Marketing & corporate sites',
    description: 'Fast, accessible sites that load quickly on mobile networks and tell your story without bloated page builders.',
    icon: Globe,
    image: aboutGalleryImages.collaboration,
    features: ['Core Web Vitals focus', 'CMS integration', 'Multilingual ready', 'Analytics setup'],
    color: '#7C3AED',
  },
  {
    title: 'E-commerce platforms',
    description: 'Storefronts and checkout flows tuned for conversion, inventory sync, and secure payment handling.',
    icon: Smartphone,
    image: caseStudyImages.ecommerce,
    features: ['Custom storefronts', 'Payment gateways', 'Inventory sync', 'Order dashboards'],
    color: '#F97316',
  },
  {
    title: 'UI/UX design',
    description: 'Wireframes and high-fidelity UI that your team can actually build—not pretty mockups that get shelved.',
    icon: Layout,
    image: aboutGalleryImages.consultation,
    features: ['User flows & wireframes', 'Design systems', 'WCAG accessibility', 'Prototype testing'],
    color: '#2FA084',
  },
  {
    title: 'APIs & integrations',
    description: 'Connect CRMs, payment providers, and legacy systems with documented, rate-limited APIs your devs will thank you for.',
    icon: Database,
    image: blogImages.compliance,
    features: ['REST & GraphQL', 'Webhooks', 'Third-party sync', 'Developer docs'],
    color: '#5D1C6A',
  },
  {
    title: 'Security & performance',
    description: 'Because we are a security company first—every build gets hardening, dependency review, and performance profiling.',
    icon: Shield,
    image: caseStudyImages.financial,
    features: ['OWASP review', 'WAF & headers', 'Load testing', 'SEO technical audit'],
    color: '#0EA5E9',
  },
];

export const featuredProjects = [
  {
    slug: 'regional-fintech-portal',
    title: 'Regional fintech client portal',
    category: 'Web application',
    description: 'A secure dashboard for transaction monitoring, KYC workflows, and compliance reporting—used daily by operations teams across three countries.',
    image: caseStudyImages.financial,
    tags: ['React', 'Node.js', 'PostgreSQL'],
    metrics: { load: '<1.2s', uptime: '99.9%' },
    span: 'lg:col-span-2 lg:row-span-2',
    liveUrl: 'https://anmelinc.com',
    liveLabel: 'View live demo',
  },
  {
    slug: 'healthcare-booking',
    title: 'Healthcare appointment platform',
    category: 'Product design + build',
    description: 'Patient booking, SMS reminders, and admin scheduling for a Monrovia clinic network.',
    image: caseStudyImages.healthcare,
    tags: ['Next.js', 'Tailwind', 'Twilio'],
    metrics: { bookings: '+34%', mobile: '72% traffic' },
    span: 'lg:col-span-1',
    liveUrl: 'https://anmelinc.com/education',
    liveLabel: 'Visit live site',
  },
  {
    slug: 'retail-commerce',
    title: 'Multi-vendor retail storefront',
    category: 'E-commerce',
    description: 'Catalog, cart, and vendor payouts with mobile-money integration for West African shoppers.',
    image: caseStudyImages.ecommerce,
    tags: ['React', 'Stripe', 'Redis'],
    metrics: { conversion: '+18%', pages: '40+ SKUs' },
    span: 'lg:col-span-1',
    liveUrl: 'https://anmelinc.com/case-studies',
    liveLabel: 'Explore project',
  },
];

export const processSteps = [
  {
    num: '01',
    title: 'Discovery',
    desc: 'We map goals, users, and constraints in a focused workshop. You leave with a scoped brief—not a 40-page deck.',
    detail: '1–2 sessions · Stakeholder interviews · Technical audit',
    icon: Compass,
    color: '#2FA084',
  },
  {
    num: '02',
    title: 'Design',
    desc: 'Wireframes and UI in Figma, reviewed with your team before a single line of production code.',
    detail: 'User flows · Component library · Accessibility pass',
    icon: PenTool,
    color: '#5D1C6A',
  },
  {
    num: '03',
    title: 'Build',
    desc: 'Two-week sprints with demos, staging links, and transparent task boards. You see progress, not surprises.',
    detail: 'CI/CD · Code review · Security checks each sprint',
    icon: Hammer,
    color: '#F59E0B',
  },
  {
    num: '04',
    title: 'Launch & support',
    desc: 'Deployment, monitoring, documentation, and a handover session so your team owns the codebase.',
    detail: 'Runbooks · Training · Optional retainer support',
    icon: Rocket,
    color: '#0EA5E9',
  },
];

/** Brand colors for stack badges — includes HTML & CSS */
export const technologies = [
  { name: 'HTML5', category: 'Markup', abbr: 'HTML', bg: '#E34F26', fg: '#FFFFFF' },
  { name: 'CSS3', category: 'Styling', abbr: 'CSS', bg: '#1572B6', fg: '#FFFFFF' },
  { name: 'JavaScript', category: 'Language', abbr: 'JS', bg: '#F7DF1E', fg: '#323330' },
  { name: 'TypeScript', category: 'Language', abbr: 'TS', bg: '#3178C6', fg: '#FFFFFF' },
  { name: 'React', category: 'Frontend', abbr: 'React', bg: '#61DAFB', fg: '#0A0C14' },
  { name: 'Next.js', category: 'Framework', abbr: 'Next', bg: '#000000', fg: '#FFFFFF' },
  { name: 'Node.js', category: 'Backend', abbr: 'Node', bg: '#339933', fg: '#FFFFFF' },
  { name: 'Tailwind CSS', category: 'CSS', abbr: 'TW', bg: '#06B6D4', fg: '#FFFFFF' },
  { name: 'PostgreSQL', category: 'Database', abbr: 'SQL', bg: '#4169E1', fg: '#FFFFFF' },
  { name: 'GraphQL', category: 'API', abbr: 'GQL', bg: '#E10098', fg: '#FFFFFF' },
  { name: 'Docker', category: 'DevOps', abbr: 'Docker', bg: '#2496ED', fg: '#FFFFFF' },
  { name: 'AWS / Vercel', category: 'Hosting', abbr: 'Cloud', bg: '#FF9900', fg: '#0A0C14' },
];

export const pricingTiers = [
  {
    name: 'Starter',
    price: 'From $2,500',
    period: 'typical landing site or MVP scope',
    description: 'Best for a focused marketing site, landing page, or proof-of-concept with clear requirements.',
    features: ['Up to 5 pages', 'Mobile-responsive design', 'Contact form & analytics', '2 revision rounds', '30-day post-launch support'],
    highlighted: false,
    cta: 'Request a quote',
  },
  {
    name: 'Growth',
    price: 'From $8,000',
    period: 'web app or e-commerce build',
    description: 'For teams needing custom functionality, integrations, or a full storefront with admin tools.',
    features: ['Custom features & dashboards', 'API integrations', 'CMS or admin panel', 'Security review included', '90-day support window'],
    highlighted: true,
    cta: 'Book a scoping call',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'multi-team, regulated, or long-term',
    description: 'Complex platforms, compliance requirements, or ongoing delivery with dedicated senior engineers.',
    features: ['Dedicated project lead', 'SLA & priority support', 'Compliance documentation', 'Penetration test coordination', 'Retainer options'],
    highlighted: false,
    cta: 'Talk to sales',
  },
];

export const webDevFaqs = [
  {
    q: 'How long does a typical website take?',
    a: 'A marketing site usually ships in 4–6 weeks. Custom web apps run 8–16 weeks depending on scope. We give you a timeline after discovery—no vague “it depends” without numbers.',
  },
  {
    q: 'Do you work with existing codebases?',
    a: 'Yes. We audit what you have, fix critical issues first, and refactor incrementally so you are not stuck in a full rewrite unless that is actually the right call.',
  },
  {
    q: 'Who owns the code and designs?',
    a: 'You do. Repos, Figma files, and deployment credentials are handed over at launch. We document everything so you are not locked in.',
  },
  {
    q: 'Can you handle hosting and DevOps?',
    a: 'We set up staging and production on AWS, Vercel, or your preferred provider, with CI/CD pipelines and monitoring. You can self-manage after handover or keep us on retainer.',
  },
  {
    q: 'How is security built into web projects?',
    a: 'Every project gets dependency scanning, secure headers, auth review, and OWASP-aligned checks—standard for us because security is our core business, not an upsell.',
  },
  {
    q: 'What do you need from us to get started?',
    a: 'A 30-minute intro call, access to any brand assets you have, and clarity on who approves decisions. We handle the rest from there.',
  },
];

export const fallbackTestimonials = [
  {
    _id: 'wd-1',
    quote: 'Anmel rebuilt our client portal in half the time our previous vendor quoted—and the codebase is something our internal team can actually maintain.',
    name: 'James K.',
    role: 'Head of Operations',
    company: 'Regional financial services',
    outcome: 'Portal live in 10 weeks',
    accent: 'sky',
    rating: 5,
  },
  {
    _id: 'wd-2',
    quote: 'They did not just make it look good. Page load dropped noticeably on mobile, and our booking completion rate went up within the first month.',
    name: 'Amara T.',
    role: 'Director',
    company: 'Healthcare network',
    outcome: '+34% online bookings',
    accent: 'purple',
    rating: 5,
  },
  {
    _id: 'wd-3',
    quote: 'Honest scoping, weekly demos, and no surprise invoices. That alone puts them ahead of most agencies we have worked with.',
    name: 'David M.',
    role: 'Founder',
    company: 'E-commerce startup',
    outcome: 'Storefront shipped on schedule',
    accent: 'orange',
    rating: 5,
  },
];

export const webDevHeroImage = capabilityImages.webdev;
export const webDevAboutPrimary = blogImages.security;
export const webDevAboutAccent = aboutGalleryImages.consultation;
