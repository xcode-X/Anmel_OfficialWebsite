/**
 * Introductory catalog for /education — merged with GET /api/courses when available.
 * category: cybersecurity | web-development | ux-design
 * Each module includes topics (concepts) + labs (hands-on practicals).
 */

export const defaultCourses = [
  {
    order: 1,
    slug: 'intro-cyber-security-foundations',
    category: 'cybersecurity',
    title: 'Cybersecurity Fundamentals',
    tagline: '2-month intro to core concepts, threats, defenses, and practical skills.',
    level: 'Beginner',
    durationWeeks: 8,
    format: 'Lectures + hands-on labs + weekly assignments',
    audience: 'Beginners who want foundational cybersecurity knowledge and practical exposure',
    shortDescription:
      'Core cybersecurity concepts, threats, defense strategies, and hands-on skills to protect systems and data—over 8 weeks with labs, assignments, and a final project.',
    description:
      'This course introduces learners to the fundamentals of cybersecurity, including core concepts, threats, defense strategies, and practical skills needed to protect systems and data. Delivery includes weekly lectures, guided hands-on labs (in authorized environments only), and assignments that build toward a final security assessment project. Assessment: weekly assignments 30%, practical labs 30%, final project 40%. Tools used may include Wireshark, Nmap, VirtualBox/VMware, and Kali Linux in isolated lab setups—never against systems you are not authorized to test.',
    highlights: [
      '8 weeks (2 months) · Lectures + hands-on labs + weekly assignments',
      'Assessment: Weekly assignments 30% · Practical labs 30% · Final project 40%',
      'Tools & resources: Wireshark, Nmap, VirtualBox/VMware, Kali Linux, hands-on lab environment',
      'Outcome: Foundational cybersecurity knowledge plus practical exposure to common tools',
    ],
    modules: [
      {
        title: 'Week 1: Introduction to Cybersecurity',
        summary: 'What cybersecurity is, why it matters, and the threat landscape at a high level.',
        topics: [
          'What is cybersecurity?',
          'Importance of cybersecurity in today’s world',
          'Types of cyber threats (malware, phishing, ransomware)',
          'CIA Triad (Confidentiality, Integrity, Availability)',
        ],
        labs: [
          { title: 'Practical: Identifying phishing emails', focus: 'Analyze instructor-provided samples; document red flags and safe reporting steps.' },
          { title: 'Practical: Basic security awareness exercises', focus: 'Complete awareness checklist and short scenario quizzes (safe, offline or demo content).' },
        ],
        assignment: 'Research and present a recent cyberattack (scope and format per instructor brief).',
      },
      {
        title: 'Week 2: Networking Fundamentals',
        summary: 'How data moves on networks—foundation for everything that follows.',
        topics: [
          'Basics of computer networks',
          'IP addressing and DNS',
          'OSI & TCP/IP models',
          'Common network protocols (HTTP, HTTPS, FTP)',
        ],
        labs: [
          { title: 'Practical: Wireshark — basic packet analysis', focus: 'Capture or review provided traces in a lab VM; identify DNS, HTTP/S, and handshake patterns.' },
          { title: 'Practical: IP configuration exercises', focus: 'Configure static vs DHCP in a safe lab; verify with ping and ipconfig/ifconfig.' },
        ],
        assignment: 'Map a simple network diagram for a given scenario (home or small office).',
      },
      {
        title: 'Week 3: Operating System Security',
        summary: 'Securing endpoints through users, permissions, and system hardening basics.',
        topics: [
          'Windows & Linux basics',
          'User authentication and permissions',
          'File systems and security controls',
          'System vulnerabilities',
        ],
        labs: [
          { title: 'Practical: User account management', focus: 'Create/restrict users and groups on Windows and/or Linux lab VMs.' },
          { title: 'Practical: File permission configuration', focus: 'Set ownership and chmod/ACL exercises on sample directories.' },
        ],
        assignment: 'Compare Windows vs Linux security features (short written or slide comparison).',
      },
      {
        title: 'Week 4: Threats, Vulnerabilities & Attacks',
        summary: 'How attacks work conceptually—always in ethical, defensive context.',
        topics: [
          'Types of cyber attacks (DoS, MITM, SQL injection)',
          'Vulnerability concepts',
          'Social engineering techniques',
        ],
        labs: [
          { title: 'Practical: Simulated attack demonstrations', focus: 'Instructor-led demos in isolated lab; students document indicators and mitigations.' },
          { title: 'Practical: Vulnerability scanning basics', focus: 'Run approved scans only against provided lab targets; interpret results at a high level.' },
        ],
        assignment: 'Case study analysis of a cyber incident (template provided).',
      },
      {
        title: 'Week 5: Cryptography Basics',
        summary: 'Encryption, hashing, and how the web protects data in transit.',
        topics: [
          'Encryption vs hashing',
          'Symmetric vs asymmetric encryption',
          'SSL/TLS basics',
          'Password security',
        ],
        labs: [
          { title: 'Practical: Encrypting/decrypting files', focus: 'Use lab-approved tools (e.g., gpg/openssl) on sample files only.' },
          { title: 'Practical: Hashing passwords', focus: 'Compare hashing outputs; discuss why plaintext storage is never acceptable.' },
        ],
        assignment: 'Explain how HTTPS works (diagram + short written explanation).',
      },
      {
        title: 'Week 6: Network Security',
        summary: 'Firewalls, monitoring, and designing safer network perimeters.',
        topics: [
          'Firewalls and IDS/IPS',
          'VPNs and secure communication',
          'Network security best practices',
        ],
        labs: [
          { title: 'Practical: Basic firewall configuration', focus: 'Allow/deny rules in a virtual lab firewall appliance or host firewall.' },
          { title: 'Practical: Network monitoring basics', focus: 'Review logs or simple alerts from a demo SIEM or router output.' },
        ],
        assignment: 'Design a secure small-office network (diagram + short rationale).',
      },
      {
        title: 'Week 7: Ethical Hacking & Penetration Testing (Intro)',
        summary: 'Ethical scope, methodology, and intro tools—lab environments only.',
        topics: [
          'Ethical hacking concepts',
          'Penetration testing phases',
          'Introduction to tools (Nmap, Metasploit — awareness level)',
        ],
        labs: [
          { title: 'Practical: Basic scanning using Nmap', focus: 'Scan authorized lab hosts only; document open ports and services.' },
          { title: 'Practical: Identifying open ports', focus: 'Relate port list to attack surface and hardening priorities.' },
        ],
        assignment: 'Perform a basic vulnerability scan in the provided lab environment only; submit findings summary.',
      },
      {
        title: 'Week 8: Security Best Practices & Career Path',
        summary: 'Frameworks, risk, certifications, and your capstone security assessment.',
        topics: [
          'Cybersecurity frameworks and policies',
          'Risk management basics',
          'Career paths in cybersecurity',
          'Certifications overview (Security+, CEH, CISSP — high-level)',
        ],
        labs: [
          { title: 'Practical: Personal cybersecurity plan', focus: 'Draft habits, tools, and learning goals for the next 6–12 months.' },
          { title: 'Practical: Resume / LinkedIn optimization', focus: 'Tailor profile toward entry-level security roles with instructor feedback.' },
          { title: 'Final project (capstone)', focus: 'Conduct a basic security assessment of an approved system or scenario; aligns with course outcome and assessment rubric.' },
        ],
        assignment: 'Submit final project deliverables per brief (replaces separate weekly assignment where applicable).',
      },
    ],
    prerequisites: ['Comfort using a web browser and email; willingness to install lab VMs or use provided cloud lab'],
    outcomes:
      'By the end of the course, students will: understand core cybersecurity concepts; identify common threats and vulnerabilities; apply basic security measures; use beginner-level cybersecurity tools responsibly; and understand career pathways and certifications in the field.',
    certification: 'Anmel Inc Introductory Certificate of Completion',
  },
  {
    order: 2,
    slug: 'intro-digital-safety-privacy',
    category: 'cybersecurity',
    title: 'Introduction to Digital Safety & Privacy',
    tagline: 'Stay safe online, protect your data, and build responsible habits.',
    level: 'Beginner',
    durationWeeks: 8,
    format: 'Lectures + hands-on activities + weekly assignments',
    audience: 'Anyone who wants a strong foundation in digital safety, privacy awareness, and responsible online behavior',
    shortDescription:
      'Essential knowledge and practical skills to stay safe online, protect personal data, and maintain privacy—over 8 weeks with activities, assignments, and a final awareness campaign project.',
    description:
      'This course equips learners with essential knowledge and practical skills to stay safe online, protect personal data, and maintain privacy in the digital world. Weekly lectures, hands-on activities, and assignments build toward a final project. Assessment: weekly assignments 30%, practical activities 30%, final project 40%. External references (Google Safety Center, CISA, NCSC, EFF, GDPR resources, and others) support instructors and students—see the resource guide in the syllabus.',
    highlights: [
      '8 weeks (2 months) · Lectures + hands-on activities + weekly assignments',
      'Assessment: Weekly assignments 30% · Practical activities 30% · Final project 40%',
      'Outcome: Strong foundation in digital safety, privacy awareness, and responsible online behavior',
      'Globally recognized references: Google Safety Center, CISA, NCSC, EFF, GDPR, Privacy International, and more',
    ],
    resourceGuide: [
      {
        heading: 'Learning platforms',
        items: [
          'Google Safety Center',
          'Cybersecurity and Infrastructure Security Agency (CISA)',
          'National Cyber Security Centre (NCSC)',
          'Stay Safe Online (National Cybersecurity Alliance)',
        ],
      },
      {
        heading: 'Privacy & data protection',
        items: ['Electronic Frontier Foundation (EFF)', 'General Data Protection Regulation (GDPR)', 'Privacy International'],
      },
      {
        heading: 'Tools & practical resources',
        items: ['Bitwarden', 'Mozilla Firefox (privacy-focused settings)', 'DuckDuckGo'],
      },
      {
        heading: 'Interactive learning & awareness',
        items: ['Google Interland', 'Common Sense Media', 'Khan Academy (Internet safety modules)'],
      },
      {
        heading: 'Recommended reading',
        items: ['The Art of Invisibility — Kevin Mitnick', 'Data and Goliath — Bruce Schneier'],
      },
    ],
    modules: [
      {
        title: 'Week 1: Understanding Digital Safety & Privacy',
        summary: 'Foundational language for staying safe and private online.',
        topics: [
          'What is digital safety?',
          'What is digital privacy?',
          'Digital footprint and online identity',
          'Risks of unsafe online behavior',
        ],
        labs: [
          { title: 'Practical: Reviewing personal digital footprint', focus: 'Inventory accounts and public profiles you control; note what a stranger could learn.' },
          { title: 'Practical: Identifying risky online behaviors', focus: 'Work through short scenarios and label risk level with instructor debrief.' },
        ],
        assignment: 'Write a reflection on your digital footprint (length and prompts per instructor).',
      },
      {
        title: 'Week 2: Safe Internet Usage',
        summary: 'Browsing, HTTPS, downloads, and how tracking works at a high level.',
        topics: [
          'Safe browsing habits',
          'Recognizing secure websites (HTTPS)',
          'Avoiding malicious downloads and links',
          'Understanding cookies and tracking',
        ],
        labs: [
          { title: 'Practical: Identifying secure vs unsafe websites', focus: 'Compare URL bars, certificates, and red flags using instructor-provided examples.' },
          { title: 'Practical: Browser privacy settings configuration', focus: 'Step through key settings in Chrome/Firefox/Safari (or demo) and record changes.' },
        ],
        assignment: 'Audit your browser safety settings and submit a short checklist of changes made or planned.',
      },
      {
        title: 'Week 3: Passwords & Authentication',
        summary: 'Strong secrets, managers, MFA, and common attacks.',
        topics: [
          'Creating strong passwords',
          'Password managers',
          'Multi-factor authentication (MFA)',
          'Common password attacks',
        ],
        labs: [
          { title: 'Practical: Setting up a password manager', focus: 'Use Bitwarden or instructor-approved tool with a test vault—no real secrets required in week one.' },
          { title: 'Practical: Enabling MFA on key accounts', focus: 'Enable MFA on at least one non-critical account following a safe recovery plan.' },
        ],
        assignment: 'Create a password security improvement plan for your high-value accounts.',
      },
      {
        title: 'Week 4: Social Media Safety',
        summary: 'Privacy settings, oversharing, harassment, and fake profiles.',
        topics: [
          'Privacy settings on social platforms',
          'Oversharing risks',
          'Cyberbullying and online harassment',
          'Fake profiles and scams',
        ],
        labs: [
          { title: 'Practical: Updating social media privacy settings', focus: 'Walk through settings on one platform you use; export or screenshot settings summary (redacted).' },
          { title: 'Practical: Identifying fake accounts', focus: 'Compare real vs fake profile signals using anonymized examples.' },
        ],
        assignment: 'Analyze a social media risk scenario (case brief provided by instructor).',
      },
      {
        title: 'Week 5: Online Scams & Fraud Awareness',
        summary: 'Phishing, smishing, vishing, identity theft, and suspicious messages.',
        topics: [
          'Phishing, smishing, and vishing',
          'Online fraud schemes',
          'Identity theft',
          'Recognizing suspicious messages',
        ],
        labs: [
          { title: 'Practical: Phishing detection exercises', focus: 'Label safe vs unsafe samples; discuss reporting paths.' },
          { title: 'Practical: Email and message analysis', focus: 'Headers and sender patterns at a beginner level—no clicking unknown links.' },
        ],
        assignment: 'Create awareness tips for avoiding scams (handout or short video script).',
      },
      {
        title: 'Week 6: Protecting Personal Data',
        summary: 'Data types, sharing risks, permissions, and minimization.',
        topics: [
          'Types of personal and sensitive data',
          'Data sharing risks',
          'Data protection principles',
          'App permissions and data collection',
        ],
        labs: [
          { title: 'Practical: Reviewing app permissions', focus: 'Audit permissions on phone or tablet; revoke unnecessary access.' },
          { title: 'Practical: Data privacy checklist', focus: 'Complete a household or personal data map worksheet.' },
        ],
        assignment: 'Evaluate selected apps based on privacy risks (rubric provided).',
      },
      {
        title: 'Week 7: Device & Network Safety',
        summary: 'Endpoints, updates, Wi‑Fi, and shared devices.',
        topics: [
          'Securing devices (phones, laptops)',
          'Software updates and antivirus',
          'Public Wi‑Fi risks',
          'Safe use of shared devices',
        ],
        labs: [
          { title: 'Practical: Device security setup', focus: 'Screen lock, disk encryption toggle (where applicable), automatic updates.' },
          { title: 'Practical: Network safety checks', focus: 'Home router basics, guest network idea, VPN awareness (conceptual).' },
        ],
        assignment: 'Create a personal device security checklist.',
      },
      {
        title: 'Week 8: Digital Rights, Ethics & Best Practices',
        summary: 'Rights, ethics, law at a high level, habits, and capstone.',
        topics: [
          'Digital rights and responsibilities',
          'Online ethics and behavior',
          'Basic privacy laws overview',
          'Building long-term safe habits',
        ],
        labs: [
          { title: 'Practical: Personal digital safety plan', focus: 'Consolidate habits, tools, and goals for the next year.' },
          { title: 'Practical: Ethical scenario discussions', focus: 'Small groups discuss dilemmas (sharing, consent, reporting).' },
          { title: 'Final project: Digital Safety & Privacy Awareness Campaign', focus: 'Design a mini-campaign (slides, poster, or short video outline) for a chosen audience—school, workplace, or family.' },
        ],
        assignment: 'Submit final campaign deliverables per rubric (integrates weekly work where applicable).',
      },
    ],
    prerequisites: ['None'],
    outcomes:
      'By the end of the course, students will: understand digital safety and privacy concepts; identify online risks and scams; protect personal and sensitive information; apply safe online practices; and develop long-term digital responsibility habits.',
    certification: 'Anmel Inc Introductory Certificate of Completion',
  },
  {
    order: 3,
    slug: 'intro-networking-for-security',
    category: 'cybersecurity',
    title: 'Introduction to Networking for Security',
    tagline: 'Fundamentals of networking—and how to secure them.',
    level: 'Beginner',
    durationWeeks: 8,
    format: 'Lectures + hands-on labs + assignments + mini project',
    audience:
      'Beginners in cybersecurity, IT students, system administrators, and anyone interested in network security.',
    shortDescription:
      'Eight weeks of networking fundamentals with a security lens: protocols, threats, defenses, monitoring, and a final mini project designing a secure small-business network.',
    description:
      'This course introduces fundamental networking concepts and explains how networks are secured against cyber threats. Students will learn how network protocols work, how attackers exploit networks, and how to implement essential security controls such as firewalls, monitoring tools, and secure configurations. Training combines lectures, hands-on labs, assignments, and a mini project over 2 months (8 weeks). Tools may include Wireshark, Nmap, Cisco Packet Tracer, and monitoring demos—only in authorized lab environments, never against systems you are not permitted to test.',
    highlights: [
      'Duration: 2 months (8 weeks) · Training mode: Lectures + hands-on labs + assignments + mini project',
      'Assessment: Practical exam · Final project presentation · Participation and lab performance',
      'Target audience: Beginners in cybersecurity, IT students, system administrators, and anyone interested in network security',
      'References: Cisco Networking Academy, CompTIA, IETF, CISA, NIST, SANS, TryHackMe, and more (see resource guide)',
    ],
    resourceGuide: [
      {
        heading: 'Networking fundamentals',
        items: ['Cisco Networking Academy', 'CompTIA (Network+ resources)', 'Internet Engineering Task Force (IETF)'],
      },
      {
        heading: 'Network security & best practices',
        items: [
          'Cybersecurity and Infrastructure Security Agency (CISA)',
          'National Institute of Standards and Technology (NIST)',
          'SANS Institute',
        ],
      },
      {
        heading: 'Tools & hands-on practice',
        items: ['Wireshark', 'Nmap', 'Cisco Packet Tracer'],
      },
      {
        heading: 'Interactive learning platforms',
        items: ['TryHackMe', 'Hack The Box', 'Cybrary'],
      },
      {
        heading: 'Recommended reading',
        items: [
          'Computer Networking: A Top-Down Approach — James F. Kurose & Keith W. Ross',
          'Network Security Essentials — William Stallings',
        ],
      },
    ],
    modules: [
      {
        title: 'Week 1: Fundamentals of Computer Networking',
        summary: 'What networks are, how they are shaped, models, devices, and addressing.',
        topics: [
          'What is networking?',
          'Types of networks (LAN, WAN, MAN, WLAN)',
          'Network topologies',
          'OSI Model',
          'TCP/IP Model',
          'Network devices (routers, switches, hubs, access points)',
          'IP addressing basics (IPv4 and IPv6)',
        ],
        labs: [
          { title: 'Lab: Identify networking devices', focus: 'Recognize device roles in a small topology or diagram.' },
          { title: 'Lab: Basic network setup simulation', focus: 'Use Packet Tracer or similar tools to model a simple LAN.' },
          { title: 'Lab: IP addressing exercises', focus: 'Practice IPv4 and IPv6 basics with guided worksheets.' },
        ],
        skillsGained: ['Understand how networks operate', 'Identify components of a network infrastructure'],
      },
      {
        title: 'Week 2: Network Protocols and Communication',
        summary: 'Protocols, ports, packets, and reading live traffic.',
        topics: [
          'TCP vs UDP',
          'DNS, DHCP, HTTP, HTTPS',
          'ARP and ICMP',
          'Ports and services',
          'Network communication process',
          'Packet structure and transmission',
        ],
        labs: [
          { title: 'Lab: Packet capture using Wireshark', focus: 'Capture traffic in an authorized lab environment.' },
          { title: 'Lab: Analyze network traffic', focus: 'Filter and follow conversations in captured data.' },
          { title: 'Lab: Identify common protocols in captured packets', focus: 'Relate fields to DNS, HTTP/S, TCP/UDP, and more.' },
        ],
        skillsGained: ['Understand how data travels across networks', 'Ability to analyze network traffic'],
      },
      {
        title: 'Week 3: Introduction to Cybersecurity and Network Threats',
        summary: 'Threat landscape and how attacks show up on the wire.',
        topics: [
          'Cybersecurity fundamentals',
          'Types of cyber threats',
          'Network-based attacks',
          'Malware and ransomware',
          'Phishing and social engineering',
          'Denial of Service (DoS / DDoS)',
        ],
        labs: [
          { title: 'Lab: Identify suspicious network traffic', focus: 'Review sanitized captures and log snippets for red flags.' },
          { title: 'Lab: Simulated phishing detection exercise', focus: 'Spot tactics and reporting steps in safe scenarios.' },
          { title: 'Lab: Case studies of cyber attacks', focus: 'Discuss timelines, impact, and lessons learned.' },
        ],
        skillsGained: ['Recognize common network security threats', 'Understand attacker techniques'],
      },
      {
        title: 'Week 4: Network Security Fundamentals',
        summary: 'CIA, architecture, and core defensive technologies.',
        topics: [
          'Security principles (CIA Triad)',
          'Network security architecture',
          'Firewalls and security devices',
          'Intrusion Detection Systems (IDS)',
          'Intrusion Prevention Systems (IPS)',
          'VPN basics',
        ],
        labs: [
          { title: 'Lab: Firewall rule configuration', focus: 'Allow/deny rules in a virtual appliance or lab firewall.' },
          { title: 'Lab: IDS demonstration', focus: 'Observe alerts and tune benign vs suspicious examples.' },
          { title: 'Lab: Network segmentation practice', focus: 'Sketch or lab-build zones and trust boundaries.' },
        ],
        skillsGained: ['Understand core network defense mechanisms'],
      },
      {
        title: 'Week 5: Securing Network Infrastructure',
        summary: 'Hardening routers, switches, VLANs, wireless, and configs.',
        topics: [
          'Router and switch security',
          'Access control lists (ACL)',
          'Network segmentation',
          'VLAN security',
          'Wireless network security',
          'Secure network configuration',
        ],
        labs: [
          { title: 'Lab: Configure VLANs', focus: 'Segment traffic in Packet Tracer or equivalent lab.' },
          { title: 'Lab: Basic ACL implementation', focus: 'Permit/deny traffic matching simple policies.' },
          { title: 'Lab: Secure Wi‑Fi configuration', focus: 'WPA settings, guest networks, and passphrase hygiene on demo gear.' },
        ],
        skillsGained: ['Implement basic network security configurations'],
      },
      {
        title: 'Week 6: Monitoring and Network Defense',
        summary: 'Visibility, logging, SIEM concepts, IR basics, and scanning.',
        topics: [
          'Network monitoring tools',
          'Security logging',
          'SIEM basics',
          'Threat detection techniques',
          'Incident response basics',
          'Network scanning tools',
        ],
        labs: [
          { title: 'Lab: Use Nmap for scanning', focus: 'Authorized lab targets only; document open ports and services.' },
          { title: 'Lab: Monitor traffic patterns', focus: 'Baseline vs unusual activity in sample data.' },
          { title: 'Lab: Analyze logs for threats', focus: 'Correlate lines from firewall, IDS, or syslog samples.' },
        ],
        skillsGained: ['Detect unusual network activity', 'Understand monitoring systems'],
      },
      {
        title: 'Week 7: Ethical Hacking Basics for Network Security',
        summary: 'Ethical testing mindset, vulns, and responsible tool use.',
        topics: [
          'Introduction to ethical hacking',
          'Penetration testing concepts',
          'Vulnerability assessment',
          'Common network vulnerabilities',
          'Password attacks',
          'Security testing tools',
        ],
        labs: [
          { title: 'Lab: Basic vulnerability scan', focus: 'Run scans only against permitted lab systems.' },
          { title: 'Lab: Password strength analysis', focus: 'Policy vs cracked or weak examples (synthetic data).' },
          { title: 'Lab: Identify weak network points', focus: 'Map findings to mitigations in a short report.' },
        ],
        skillsGained: ['Understand how hackers test networks', 'Learn how to identify vulnerabilities'],
      },
      {
        title: 'Week 8: Final Project and Practical Implementation',
        summary: 'Secure design, policy, scenarios, review, and capstone presentation.',
        topics: [
          'Secure network design',
          'Network security policy basics',
          'Real-world security scenarios',
          'Review and exam preparation',
        ],
        labs: [
          { title: 'Final project: Design a secure small business network', focus: 'Topology, segmentation, and control choices justified in writing.' },
          { title: 'Final project: Implement basic security controls', focus: 'Demonstrate in lab or simulation per brief.' },
          { title: 'Final project: Present your network security plan', focus: 'Short presentation to peers and instructor feedback.' },
        ],
        skillsGained: [
          'Design a coherent secure network for a small organization',
          'Communicate risks and controls to a non-technical audience',
        ],
        assignment:
          'Assessment includes a practical exam, final project presentation, and participation/lab performance (per instructor rubric).',
      },
    ],
    prerequisites: ['Comfort with basic computer use; prior Intro to Cybersecurity or Digital Safety is helpful but not required'],
    outcomes:
      'By the end of the 2-month training, students will be able to: understand how computer networks function and communicate; explain networking models such as OSI and TCP/IP; identify common network devices and their roles; analyze network traffic using professional tools; recognize major cyber threats targeting networks; implement basic network security controls; configure firewalls, VLANs, and access control mechanisms; monitor networks for suspicious activity; perform basic vulnerability assessments; design a simple secure network for a small organization; apply cybersecurity best practices in real-world environments; and prepare for entry-level cybersecurity or networking roles.',
    certification: 'Anmel Inc Introductory Certificate of Completion',
  },
  {
    order: 10,
    slug: 'intro-web-html-css',
    category: 'web-development',
    title: 'Introduction to HTML & CSS',
    tagline: 'Structure, style, and ship responsive sites from zero.',
    level: 'Introductory',
    durationWeeks: 8,
    format: 'Lectures + practical coding sessions + assignments + final project',
    audience:
      'Beginners interested in web development, students, entrepreneurs, and individuals starting careers in tech.',
    shortDescription:
      'Eight weeks from first HTML file to a deployed, responsive multi-page site and portfolio-ready project—HTML structure, CSS layout, Flexbox, Grid, and modern UI polish.',
    description:
      'This course introduces the core technologies used to build websites: HTML (HyperText Markup Language) and CSS (Cascading Style Sheets). Students will learn how to structure web pages, style them professionally, and build responsive websites suitable for modern devices. Training combines lectures, practical coding sessions, assignments, and a final project over 2 months (8 weeks).',
    highlights: [
      'Duration: 2 months (8 weeks) · Training mode: Lectures + practical coding sessions + assignments + final project',
      'Assessment: Practical coding test · Final website project · Participation and assignments',
      'Target audience: Beginners in web development, students, entrepreneurs, and people starting tech careers',
      'Capstone: Multi-page responsive site you can present and add to a basic portfolio',
    ],
    modules: [
      {
        title: 'Week 1: Introduction to Web Development',
        summary: 'How the web works, your first editor, and your first HTML page.',
        topics: [
          'How the web works',
          'Introduction to websites and browsers',
          'Web development overview (Frontend vs Backend)',
          'What is HTML?',
          'Structure of a web page',
          'HTML document structure',
          'Basic HTML tags',
        ],
        labs: [
          { title: 'Lab: Install a code editor', focus: 'Set up VS Code or similar; extensions optional (e.g., Live Server).' },
          { title: 'Lab: Create your first web page', focus: 'Save and open `index.html` in a browser; verify title and body content.' },
          { title: 'Lab: Write basic HTML structure', focus: 'Doctype, `html`, `head`, `meta`, `title`, and semantic body content.' },
        ],
        skillsGained: ['Understand the fundamentals of web development', 'Create a basic webpage using HTML'],
      },
      {
        title: 'Week 2: Working with HTML Elements',
        summary: 'Text, lists, links, images, and a tidy folder structure.',
        topics: [
          'Headings and paragraphs',
          'Text formatting',
          'Lists (ordered and unordered)',
          'Links and navigation',
          'Images in HTML',
          'File paths and folder structure',
        ],
        labs: [
          { title: 'Lab: Create a personal profile page', focus: 'Multiple sections with headings, text, and lists.' },
          { title: 'Lab: Add images and links', focus: 'Relative paths to assets; internal and external links.' },
          { title: 'Lab: Organize project folders', focus: 'Separate pages, images, and styles in a simple site tree.' },
        ],
        skillsGained: ['Structure content correctly in HTML', 'Build multi-section webpages'],
      },
      {
        title: 'Week 3: HTML Layout and Page Structure',
        summary: 'Semantic layout, tables, and your first forms.',
        topics: [
          'Semantic HTML elements',
          'Header, footer, section, article, nav',
          'Div and span usage',
          'HTML tables',
          'Forms introduction',
        ],
        labs: [
          { title: 'Lab: Build a simple website layout', focus: 'Use landmarks (`header`, `nav`, `main`, `footer`) for a small multi-section page.' },
          { title: 'Lab: Create a contact form', focus: 'Labels, inputs, and submit—keyboard-friendly markup (validation can be basic).' },
          { title: 'Lab: Create a table-based content section', focus: 'Structured data in `<table>` with headings and rows.' },
        ],
        skillsGained: ['Organize web pages using proper structure', 'Build interactive forms'],
      },
      {
        title: 'Week 4: Introduction to CSS',
        summary: 'Selectors, the cascade, and styling text and backgrounds.',
        topics: [
          'What is CSS?',
          'CSS syntax and rules',
          'Inline, internal, and external CSS',
          'CSS selectors',
          'Colors and backgrounds',
          'Text styling',
        ],
        labs: [
          { title: 'Lab: Style an HTML page', focus: 'Link an external stylesheet; override with intentional specificity.' },
          { title: 'Lab: Apply colors and fonts', focus: 'Web-safe and webfont basics; contrast-aware text on backgrounds.' },
          { title: 'Lab: Create a simple styled webpage', focus: 'Match a loose visual brief with typography and color.' },
        ],
        skillsGained: ['Apply styles to web pages', 'Understand CSS structure'],
      },
      {
        title: 'Week 5: CSS Layout and Design',
        summary: 'Box model, positioning, and Flexbox for real layouts.',
        topics: [
          'Box model',
          'Margin, padding, borders',
          'Display properties',
          'Positioning elements',
          'Flexbox basics',
        ],
        labs: [
          { title: 'Lab: Build a responsive layout using Flexbox', focus: 'Row/column direction, wrap, and `justify` / `align` on a simple page shell.' },
          { title: 'Lab: Adjust spacing and alignment', focus: 'Tune margin, padding, and gaps for consistent rhythm.' },
          { title: 'Lab: Design a simple landing page', focus: 'Hero, feature blocks, and footer using Flexbox.' },
        ],
        skillsGained: ['Control page layout and spacing', 'Create structured web designs'],
      },
      {
        title: 'Week 6: Responsive Web Design',
        summary: 'Mobile-first thinking, media queries, and flexible layouts.',
        topics: [
          'Responsive design concepts',
          'Media queries',
          'Mobile-first design',
          'Responsive images',
          'Flexible layouts',
        ],
        labs: [
          { title: 'Lab: Make the website mobile-friendly', focus: 'Breakpoints and fluid typography or spacing where appropriate.' },
          { title: 'Lab: Create responsive navigation', focus: 'Collapsible or stacked nav patterns with CSS only.' },
          { title: 'Lab: Test on different screen sizes', focus: 'Use DevTools device mode; fix at least two layout issues.' },
        ],
        skillsGained: ['Build websites that work on phones, tablets, and desktops'],
      },
      {
        title: 'Week 7: Advanced Styling and UI Improvement',
        summary: 'Grid, form styling, motion, and polishing the interface.',
        topics: [
          'CSS Grid introduction',
          'Styling forms',
          'Hover effects and transitions',
          'Basic animations',
          'Improving website user interface',
        ],
        labs: [
          { title: 'Lab: Improve previous projects', focus: 'Refactor markup/CSS for clarity and consistency across pages.' },
          { title: 'Lab: Add animations and effects', focus: 'Transitions and simple `@keyframes` without harming usability.' },
          { title: 'Lab: Design a modern website interface', focus: 'Apply spacing, color, and components to a cohesive look.' },
        ],
        skillsGained: ['Enhance website appearance', 'Create engaging user interfaces'],
      },
      {
        title: 'Week 8: Final Project and Portfolio Website',
        summary: 'Plan, build, deploy, and present your capstone site.',
        topics: [
          'Website planning',
          'UI layout design',
          'Project development',
          'Deployment basics',
          'Portfolio preparation',
        ],
        labs: [
          { title: 'Final project: Build a complete multi-page website', focus: 'Several linked pages with shared navigation and styling.' },
          { title: 'Final project: Apply HTML structure and CSS styling', focus: 'Semantic HTML and maintainable CSS across the project.' },
          { title: 'Final project: Make the website responsive', focus: 'Verified layouts from small phones to desktop widths.' },
          { title: 'Final project: Present your project', focus: 'Walkthrough of goals, challenges, and live demo or recording.' },
        ],
        skillsGained: [
          'Ship a portfolio-ready static site',
          'Explain design and implementation choices to others',
        ],
        assignment:
          'Assessment includes a practical coding test, final website project, and participation/assignments (per instructor rubric).',
      },
    ],
    prerequisites: ['Basic computer literacy and comfort managing files and folders'],
    outcomes:
      'By the end of the 2-month training, students will be able to: understand how websites are built and displayed on the internet; write clean and structured HTML code; create well-organized web pages using semantic HTML; add images, links, tables, and forms to websites; apply CSS styling to design professional-looking web pages; use the CSS box model and layout techniques; build responsive websites that work on all devices; use Flexbox and basic CSS Grid for layouts; improve user experience with animations and effects; create and deploy a complete website project; build a basic web development portfolio; and prepare for further learning in JavaScript and full-stack development.',
    certification: 'Anmel Inc Introductory Certificate of Completion',
  },
  {
    order: 11,
    slug: 'intro-javascript-essentials',
    category: 'web-development',
    title: 'Introduction to JavaScript Essentials',
    tagline: 'Logic, DOM, and interactivity—on the real web.',
    level: 'Introductory',
    durationWeeks: 8,
    format: 'Lectures + hands-on coding + assignments + final project',
    audience:
      'Beginners in programming, web development students, and individuals interested in building interactive websites.',
    shortDescription:
      'Eight weeks from first script to a fully interactive web app: variables, control flow, functions, data structures, loops, DOM, events, validation, debugging, and a capstone you present.',
    description:
      'This course introduces the core principles of JavaScript programming used to build dynamic and interactive web applications. Students will learn programming logic, DOM manipulation, event handling, and basic debugging while building real-world mini projects. Training combines lectures, hands-on coding, assignments, and a final project over 2 months (8 weeks). Use only instructor-approved pages and APIs; never run scripts against sites you do not own or lack permission to test.',
    highlights: [
      'Duration: 2 months (8 weeks) · Training mode: Lectures + hands-on coding + assignments + final project',
      'Assessment: Practical coding test · Final project presentation · Assignments and lab participation',
      'Target audience: Beginners in programming, web students, and people who want interactive sites',
      'Capstone: Fully interactive app (e.g., to-do list, grade calculator, dynamic form, or landing page with dynamic features)',
    ],
    modules: [
      {
        title: 'Week 1: Introduction to JavaScript and Programming Fundamentals',
        summary: 'What JS is, your environment, and your first programs.',
        topics: [
          'What is JavaScript?',
          'Role of JavaScript in web development',
          'Setting up JavaScript environment',
          'Writing first JavaScript program',
          'Variables and data types',
          'Operators in JavaScript',
        ],
        labs: [
          { title: 'Lab: Setup development environment', focus: 'VS Code (or similar) + modern browser; run scripts from HTML or console as directed.' },
          { title: 'Lab: Write your first JavaScript script', focus: 'Hello world in a `.js` file or inline; open the page and confirm output.' },
          { title: 'Lab: Variable declarations and calculations', focus: 'Practice `let`/`const`, numbers, strings, and simple expressions.' },
        ],
        skillsGained: ['Understand JavaScript basics', 'Write simple JavaScript programs'],
      },
      {
        title: 'Week 2: Control Flow and Logic',
        summary: 'Decisions, comparisons, and branching programs.',
        topics: [
          'Conditional statements (if, else, else if)',
          'Comparison operators',
          'Logical operators',
          'Switch statements',
          'Introduction to problem solving',
        ],
        labs: [
          { title: 'Lab: Build a grading system program', focus: 'Map numeric scores to letter grades with clear branches.' },
          { title: 'Lab: Create simple decision-based applications', focus: 'Small programs that respond differently to user-like inputs or test data.' },
          { title: 'Lab: Practice coding exercises', focus: 'Drills on conditions and edge cases (empty input, boundaries).' },
        ],
        skillsGained: ['Apply logic in programming', 'Write programs that make decisions'],
      },
      {
        title: 'Week 3: Functions and Code Reusability',
        summary: 'Functions, parameters, returns, arrows, and scope.',
        topics: [
          'Introduction to functions',
          'Function declarations and expressions',
          'Parameters and arguments',
          'Return values',
          'Arrow functions',
          'Scope basics',
        ],
        labs: [
          { title: 'Lab: Create reusable functions', focus: 'Extract repeated logic into named functions with clear inputs/outputs.' },
          { title: 'Lab: Build calculator functions', focus: 'Add, subtract, multiply, divide with validation and readable errors.' },
          { title: 'Lab: Code debugging exercises', focus: 'Fix intentional bugs using console.log and stepping through calls.' },
        ],
        skillsGained: ['Organize code efficiently', 'Build reusable program logic'],
      },
      {
        title: 'Week 4: Arrays and Objects',
        summary: 'Structured data: lists, methods, objects, and iteration.',
        topics: [
          'Arrays in JavaScript',
          'Array methods',
          'Objects and properties',
          'Accessing and modifying data',
          'Looping through arrays and objects',
        ],
        labs: [
          { title: 'Lab: Build a student record system', focus: 'Arrays or arrays of objects representing students and grades.' },
          { title: 'Lab: Practice array manipulation', focus: 'Push, map, filter-style exercises without relying on a framework.' },
          { title: 'Lab: Create object-based data structures', focus: 'Model entities with properties; read and update safely.' },
        ],
        skillsGained: ['Work with structured data', 'Manage collections of data'],
      },
      {
        title: 'Week 5: Loops and Iteration',
        summary: 'For, while, and patterns for repeating work.',
        topics: [
          'For loop',
          'While loop',
          'Do while loop',
          'ForEach loop',
          'Looping best practices',
          'Nested loops',
        ],
        labs: [
          { title: 'Lab: Create number-based programs', focus: 'Sums, factorial-style patterns, and tables using loops.' },
          { title: 'Lab: Data processing exercises', focus: 'Transform or filter collections with explicit loops.' },
          { title: 'Lab: Build simple list management programs', focus: 'CRUD-lite in memory: add/remove/list items with loops.' },
        ],
        skillsGained: ['Automate repetitive tasks', 'Process data efficiently'],
      },
      {
        title: 'Week 6: DOM Manipulation (Making Websites Interactive)',
        summary: 'Connect scripts to real HTML and CSS.',
        topics: [
          'What is the DOM?',
          'Selecting HTML elements',
          'Changing content dynamically',
          'Styling elements with JavaScript',
          'Creating and removing elements',
          'Introduction to event handling',
        ],
        labs: [
          { title: 'Lab: Create an interactive webpage', focus: 'Wire buttons or inputs to update the DOM from your script.' },
          { title: 'Lab: Build a dynamic content changer', focus: 'Swap text, lists, or sections based on user actions.' },
          { title: 'Lab: Modify webpage elements using JavaScript', focus: 'Create/remove nodes; toggle classes for layout changes.' },
        ],
        skillsGained: ['Connect JavaScript with HTML and CSS', 'Build interactive web pages'],
      },
      {
        title: 'Week 7: Events and User Interaction',
        summary: 'Listeners, input events, forms, and debugging in the browser.',
        topics: [
          'Event listeners',
          'Mouse events',
          'Keyboard events',
          'Form validation',
          'Basic debugging',
          'Browser console tools',
        ],
        labs: [
          { title: 'Lab: Build a form validation system', focus: 'Inline feedback for required fields, formats, and ranges (no libraries required).' },
          { title: 'Lab: Create interactive buttons', focus: 'Multiple controls updating shared state on the page.' },
          { title: 'Lab: Debug JavaScript errors', focus: 'Use console, breakpoints, and stack traces to fix sample bugs.' },
        ],
        skillsGained: ['Handle user input', 'Improve website usability'],
      },
      {
        title: 'Week 8: Final Project and Practical Application',
        summary: 'Plan, build, test, deploy, and present your interactive app.',
        topics: [
          'Project planning',
          'Combining HTML, CSS, and JavaScript',
          'Code optimization basics',
          'Debugging and testing',
          'Deployment basics',
        ],
        labs: [
          {
            title: 'Final project: Build a fully interactive web application',
            focus:
              'Choose one focus area (or combine at instructor discretion): to-do list app; student grade calculator; interactive form system; or simple business landing page with dynamic features.',
          },
          { title: 'Final project: Integrate structure, style, and behavior', focus: 'Semantic HTML, maintainable CSS, and clear JS organization.' },
          { title: 'Final project: Test, fix, and deploy', focus: 'Manual test pass; fix critical bugs; optional static deploy (e.g., GitHub Pages).' },
          { title: 'Final project: Present your project', focus: 'Demo the app and explain design tradeoffs and what you would improve next.' },
        ],
        skillsGained: [
          'Ship a complete interactive web project end to end',
          'Explain your code and choices to peers and instructors',
        ],
        assignment:
          'Assessment includes a practical coding test, final project presentation, and assignments/lab participation (per instructor rubric).',
      },
    ],
    prerequisites: ['Introduction to HTML & CSS or equivalent comfort with HTML and basic CSS'],
    outcomes:
      'By the end of the 2-month training, students will be able to: understand the fundamentals of JavaScript programming; write JavaScript code to perform calculations and logic; use variables, operators, and data types effectively; implement conditional logic in applications; create reusable functions and modular code; work with arrays and objects to manage data; use loops to automate repetitive tasks; manipulate web pages using the Document Object Model (DOM); build interactive websites with event handling; validate user input in forms; debug JavaScript code using browser developer tools; and develop a complete interactive web project.',
    certification: 'Anmel Inc Introductory Certificate of Completion',
  },
  {
    order: 12,
    slug: 'intro-building-web-projects',
    category: 'web-development',
    title: 'Full Stack Web Development',
    tagline: 'Client, server, database, and deployment—one coherent path.',
    level: 'Intermediate',
    durationWeeks: 8,
    format: 'Lectures + hands-on coding + assignments + projects (2 minor + 1 major)',
    audience:
      'Learners who completed front-end basics and want to build complete web applications with a server, data persistence, and deployment.',
    shortDescription:
      'Eight weeks covering HTTP, Node/Express-style APIs, databases, integration, and two minor projects plus a major capstone—deployed and demo-ready.',
    description:
      'This course introduces full-stack web development: how browsers talk to servers, how to build REST-style APIs, how to persist data, and how to wire a modern front end to a back end safely. You will complete two guided minor projects to practice integration and one major project that demonstrates end-to-end ownership. Labs use instructor-approved stacks and environments only—never probe systems you do not own or lack permission to test.',
    highlights: [
      'Duration: 2 months (8 weeks) · Training mode: Lectures + hands-on coding + assignments + projects',
      'Projects: 2 minor (weeks 4 & 6) + 1 major capstone (weeks 7–8)',
      'Assessment: Minor & major deliverables · Code quality & participation · Final presentation (per instructor rubric)',
      'Outcome: Deployable full-stack app with API, persistence, and a documented demo',
    ],
    modules: [
      {
        title: 'Week 1: Introduction to Full-Stack Development',
        summary: 'How the pieces fit: client, server, database, and hosting.',
        topics: [
          'What is full-stack development?',
          'Client vs server vs database (high-level)',
          'HTTP, HTTPS, and request/response cycle',
          'Role of HTML, CSS, and JavaScript in modern apps',
          'Common stacks (conceptual overview)',
          'Development environment: VS Code, Node.js, npm, Git basics',
        ],
        labs: [
          { title: 'Lab: Install and verify toolchain', focus: 'Node LTS, npm, Git, and a code editor; run `node -v` and `npm -v`.' },
          { title: 'Lab: Clone or scaffold a starter repo', focus: 'Folder layout for a small full-stack-style project; first commit.' },
          { title: 'Lab: Map a request in DevTools', focus: 'Inspect Network tab for a simple page load; identify status, headers, MIME types.' },
        ],
        skillsGained: ['Describe how full-stack web applications are structured', 'Set up a working local development environment'],
      },
      {
        title: 'Week 2: Frontend Integration & APIs',
        summary: 'Consuming data from a server and handling async flows.',
        topics: [
          'Single-page vs multi-page patterns (intro)',
          'JSON as the common data format',
          'fetch and async/await basics',
          'Consuming REST endpoints from the browser',
          'Loading, error, and empty states',
          'CORS (conceptual—why it matters)',
        ],
        labs: [
          { title: 'Lab: Fetch data from a public or instructor API', focus: 'Render cards or a list from JSON; handle errors gracefully.' },
          { title: 'Lab: Refactor to small UI modules', focus: 'Separate fetch logic from DOM updates for readability.' },
          { title: 'Lab: Form → GET/POST (mock or instructor)', focus: 'Submit data and refresh UI from response (authorized endpoints only).' },
        ],
        skillsGained: ['Connect a front end to HTTP APIs', 'Write predictable async UI flows'],
      },
      {
        title: 'Week 3: Backend Fundamentals — Node & Express',
        summary: 'Routing, middleware, JSON bodies, and REST conventions.',
        topics: [
          'Node.js runtime and modules (CommonJS/ESM as used in course)',
          'Express (or equivalent) router',
          'Routes, parameters, query strings',
          'Request body parsing (JSON)',
          'Middleware chain and error handling',
          'HTTP status codes and REST semantics',
        ],
        labs: [
          { title: 'Lab: Hello API', focus: 'GET `/health` returning JSON; run with `npm run dev` or script provided.' },
          { title: 'Lab: CRUD on in-memory store', focus: 'Implement create/read/update/delete for a resource; test with Thunder Client or curl.' },
          { title: 'Lab: Basic validation', focus: 'Reject bad input with 400 and clear messages.' },
        ],
        skillsGained: ['Design and implement REST-style routes', 'Test APIs with a client tool'],
      },
      {
        title: 'Week 4: Minor Project 1 — End-to-End Mini Application',
        summary: 'First vertical slice: API + front end that consumes it.',
        topics: [
          'Reading a project brief',
          'Repository structure for a small full-stack app',
          'Integration checklist (API contract ↔ UI)',
          'Definition of done for minor project 1',
        ],
        labs: [
          {
            title: 'Minor project 1: Specification and backlog',
            focus: 'Break the brief into tasks, acceptance criteria, and a short test plan.',
          },
          {
            title: 'Minor project 1: Implement API + UI',
            focus: 'Example scope: resource list (e.g., notes, tasks, or inventory) with create + list; match instructor stack.',
          },
          {
            title: 'Minor project 1: Demo and review',
            focus: 'Record or live demo; peer review; fix at least one feedback item.',
          },
        ],
        skillsGained: ['Ship a working client–server feature end to end', 'Iterate from feedback on a small codebase'],
        assignment: 'Submit minor project 1 per rubric (code, README run instructions, short demo).',
      },
      {
        title: 'Week 5: Databases & Persistence',
        summary: 'Storing and querying data beyond in-memory maps.',
        topics: [
          'SQL vs document databases (intro)',
          'Connecting an app to a database (course-chosen driver/ORM)',
          'Models/schemas and simple migrations',
          'CRUD with persistence',
          'Environment variables for secrets',
          'Basic query safety (parameterized queries)',
        ],
        labs: [
          { title: 'Lab: Replace in-memory store with database', focus: 'Same API surface; data survives server restarts.' },
          { title: 'Lab: Seed script', focus: 'Load starter data for development and testing.' },
          { title: 'Lab: Relationship sketch (optional)', focus: 'One-to-many at intro level if the stack allows.' },
        ],
        skillsGained: ['Persist application data in a database', 'Manage configuration without committing secrets'],
      },
      {
        title: 'Week 6: Minor Project 2 — Data-Driven Application',
        summary: 'Forms, validation, and stored records with a richer workflow.',
        topics: [
          'User flows and validation on server and client',
          'Optional: simple authentication or session (course-level)',
          'Minor project 2 scope and grading rubric',
        ],
        labs: [
          {
            title: 'Minor project 2: Plan and schema',
            focus: 'Entities, fields, and validation rules; align with DB tables or collections.',
          },
          {
            title: 'Minor project 2: Build multi-step or multi-resource flow',
            focus: 'Example: contact/booking, catalog with categories, or admin-style list + edit—per instructor brief.',
          },
          {
            title: 'Minor project 2: Test and document',
            focus: 'Manual test cases; README with env vars and setup steps.',
          },
        ],
        skillsGained: ['Build a multi-screen flow backed by persisted data', 'Document setup so others can run your project'],
        assignment: 'Submit minor project 2 per rubric (working deploy or local run + demo).',
      },
      {
        title: 'Week 7: Major Project — Build Sprint (Part 1)',
        summary: 'Architecture, core features, and integration for the capstone.',
        topics: [
          'Major project scope and milestones',
          'Structuring routes, services, and UI layers',
          'Authentication/authorization (if included in brief)',
          'Error handling and logging basics',
          'Manual testing and smoke checklist',
        ],
        labs: [
          {
            title: 'Major project: Architecture and backlog',
            focus: 'Wireframes or route map; prioritize must-have vs nice-to-have.',
          },
          {
            title: 'Major project: Core API and UI integration',
            focus: 'Implement main user journeys; stub edge cases for next week.',
          },
          {
            title: 'Major project: Checkpoint review',
            focus: 'Instructor or peer review; adjust plan before final week.',
          },
        ],
        skillsGained: ['Plan a multi-feature full-stack application', 'Execute a mid-project integration checkpoint'],
      },
      {
        title: 'Week 8: Major Project — Deploy, Polish & Present',
        summary: 'Production-minded deploy, quality pass, and capstone demo.',
        topics: [
          'Deployment options (platform overview)',
          'Environment variables and production configs',
          'HTTPS and domain basics',
          'Final debugging and polish',
          'Presentation structure and Q&A',
        ],
        labs: [
          {
            title: 'Major project: Hardening and deploy',
            focus: 'Deploy to instructor-approved hosting; verify env and health checks.',
          },
          {
            title: 'Major project: Final QA',
            focus: 'Cross-browser smoke test; fix critical bugs; document known limitations.',
          },
          {
            title: 'Major project: Final presentation',
            focus: 'Live demo: problem, stack, architecture, challenges, and next steps.',
          },
        ],
        skillsGained: [
          'Deploy a full-stack application to a public or staging URL',
          'Present technical work clearly to technical and non-technical listeners',
        ],
        assignment:
          'Assessment includes the two minor projects, major project, participation, assignments/labs, and final presentation (per instructor rubric).',
      },
    ],
    prerequisites: [
      'Introduction to HTML & CSS and Introduction to JavaScript Essentials (or equivalent HTML, CSS, and JavaScript skills)',
    ],
    outcomes:
      'By the end of the 2-month training, students will be able to: explain how full-stack web applications are structured and how HTTP connects clients and servers; set up a local development environment for Node-based back ends; build and consume REST-style APIs from a front end; implement server-side routes and middleware; persist data using a database and environment-based configuration; complete two minor projects that integrate UI, API, and data; design and deliver a major full-stack project with deployment and documentation; apply basic security hygiene (secrets, validation, safe queries); debug across client and server using browser and server tools; and present a deployed application with clear explanation of architecture and tradeoffs.',
    certification: 'Anmel Inc Certificate of Completion',
  },
  {
    order: 13,
    slug: 'intro-ux-ui-design',
    category: 'ux-design',
    title: 'Introduction to UX/UI Design',
    tagline: 'Research, structure, and craft interfaces people actually use.',
    level: 'Beginner',
    durationWeeks: 8,
    format: 'Lectures + hands-on design labs + assignments + portfolio project',
    audience:
      'Beginners in design, career switchers, developers who want stronger product sense, and anyone building digital experiences.',
    shortDescription:
      'Eight weeks from problem framing and research to wireframes, visual UI, prototyping in Figma, usability testing, and a portfolio-ready case study.',
    description:
      'This course introduces user experience (UX) and user interface (UI) design for digital products. You will practice user-centered methods—research, information architecture, wireframing, visual design, prototyping, and usability testing—using modern tools (primarily Figma) and industry-recognized patterns. Weekly labs produce tangible artifacts you can show in a portfolio. Assessment combines assignments, peer critique, and a final portfolio presentation. Respect user privacy and consent in any real-world research; follow instructor guidelines for participant recruitment.',
    highlights: [
      'Duration: 2 months (8 weeks) · Training mode: Lectures + hands-on design labs + assignments + portfolio project',
      'Tools: Figma (or equivalent as announced), plus templates for research and testing',
      'Assessment: Assignments & critiques · Mid-term wireframes & prototype · Final portfolio case study & presentation',
      'Outcome: End-to-end case study from problem to tested, polished UI',
    ],
    resourceGuide: [
      {
        heading: 'Foundations & heuristics',
        items: ['Nielsen Norman Group (articles)', 'Laws of UX', 'Apple Human Interface Guidelines (overview)'],
      },
      {
        heading: 'Accessibility',
        items: ['Web Content Accessibility Guidelines (WCAG) — intro', 'Inclusive design principles'],
      },
      {
        heading: 'Tools',
        items: ['Figma learning resources', 'Contrast checkers (e.g., WebAIM)'],
      },
    ],
    modules: [
      {
        title: 'Week 1: Introduction to UX & UI',
        summary: 'What UX and UI are, how they fit together, and how designers think.',
        topics: [
          'What is UX? What is UI?',
          'How UX and UI differ and collaborate',
          'Role of design in digital products',
          'Design thinking (empathize → define → ideate → prototype → test)',
          'Human-centered design basics',
          'Ethical, inclusive, and privacy-aware design',
        ],
        labs: [
          { title: 'Lab: Heuristic comparison', focus: 'Evaluate 2–3 real apps against a short heuristic checklist; note friction and wins.' },
          { title: 'Lab: Problem statement', focus: 'Pick a real product area; write problem, user, and success signals in one paragraph.' },
          { title: 'Lab: Figma workspace setup', focus: 'Create account, team/project, and first file; learn frames and basic shapes.' },
        ],
        skillsGained: ['Distinguish UX outcomes from UI craft', 'Frame a design problem in user-centered terms'],
      },
      {
        title: 'Week 2: User Research & Understanding',
        summary: 'Evidence over opinions: interviews, light analysis, and personas.',
        topics: [
          'Why we research before pixels',
          'Interviews and structured questions',
          'Surveys (when they help—and when they do not)',
          'Competitive and comparative analysis',
          'Personas and empathy maps',
          'Synthesizing findings into insights',
        ],
        labs: [
          { title: 'Lab: Interview script', focus: 'Draft 6–8 open-ended questions for a hypothetical study (no live recruitment required).' },
          { title: 'Lab: Build 2–3 personas', focus: 'Goals, frustrations, and behaviors grounded in plausible research notes.' },
          { title: 'Lab: Competitive teardown', focus: 'Compare 2 competitors on 3–5 tasks; capture screenshots and takeaways.' },
        ],
        skillsGained: ['Plan lightweight qualitative research', 'Turn observations into personas and insights'],
      },
      {
        title: 'Week 3: Information Architecture & Flows',
        summary: 'Structure content and tasks before visual polish.',
        topics: [
          'Information architecture (IA) basics',
          'Sitemaps and navigation models',
          'User flows and decision points',
          'Task analysis and happy vs edge paths',
          'Labeling and findability',
        ],
        labs: [
          { title: 'Lab: Sitemap', focus: 'Produce a sitemap for a small multi-section product (8–15 nodes).' },
          { title: 'Lab: Linear user flow', focus: 'Diagram one primary task from entry to success (and one failure path).' },
          { title: 'Lab: Card-sorting exercise', focus: 'Use sticky notes or digital cards to group features; reflect on mental models.' },
        ],
        skillsGained: ['Organize content and tasks coherently', 'Communicate flows to teammates clearly'],
      },
      {
        title: 'Week 4: Wireframing & Low-Fidelity Layout',
        summary: 'Layout and hierarchy before color and brand.',
        topics: [
          'Low-fidelity vs high-fidelity wireframes',
          'Layout, hierarchy, and scanning patterns',
          'Mobile-first framing',
          'Figma: frames, auto layout intro, components at sketch level',
          'Critique and iteration habits',
        ],
        labs: [
          { title: 'Lab: Mobile + desktop wireframes', focus: '3–5 key screens for your project topic; consistent structure across breakpoints.' },
          { title: 'Lab: Peer critique round', focus: 'Swap files; apply “ask, suggest, praise” feedback; revise one screen.' },
          { title: 'Lab: Revision pass', focus: 'Fix clarity issues only—no visual styling yet.' },
        ],
        skillsGained: ['Produce readable wireframes quickly', 'Give and receive structured design feedback'],
        assignment: 'Submit wireframe set per rubric (coverage of primary flow + annotations).',
      },
      {
        title: 'Week 5: Visual Design Fundamentals',
        summary: 'Typography, color, spacing, and grids for clear UI.',
        topics: [
          'Typography: scale, pairing, readability',
          'Color: contrast, semantic color, brand vs neutral',
          'Spacing, rhythm, and the box model in UI',
          'Grids and alignment (incl. 8-point spacing habit)',
          'Imagery and iconography basics',
        ],
        labs: [
          { title: 'Lab: Type scale & styles', focus: 'Define heading/body/caption styles in Figma; apply to wireframe screens.' },
          { title: 'Lab: Accessible palette', focus: 'Check text/background contrast; document hex values and usage.' },
          { title: 'Lab: Layout grid exercise', focus: 'Apply column grid and consistent gutters to one desktop layout.' },
        ],
        skillsGained: ['Apply typographic hierarchy and spacing systems', 'Choose colors that meet basic contrast goals'],
      },
      {
        title: 'Week 6: UI Patterns, Components & Systems',
        summary: 'Predictable patterns, reusable pieces, and accessibility in forms.',
        topics: [
          'Common UI patterns (navigation, lists, cards, modals)',
          'Atomic thinking: components and variants',
          'Design systems: what they solve (intro)',
          'Form design: labels, errors, validation states',
          'WCAG-oriented UI decisions (intro)',
        ],
        labs: [
          { title: 'Lab: Component mini-library', focus: 'Buttons, inputs, list row—variants for default/hover/disabled/error.' },
          { title: 'Lab: Accessible form block', focus: 'Labels, focus order story, error text placement—no custom JS required.' },
          { title: 'Lab: Pattern audit', focus: 'Find one confusing pattern in a real app; sketch an improvement.' },
        ],
        skillsGained: ['Reuse components for consistency', 'Design forms that communicate state clearly'],
      },
      {
        title: 'Week 7: Prototyping & Interaction Design',
        summary: 'Clickable prototypes, motion intent, and handoff thinking.',
        topics: [
          'High-fidelity mockups vs prototypes',
          'Interactive prototyping in Figma (or announced tool)',
          'Micro-interactions and motion purpose (not decoration-only)',
          'States: loading, empty, error, success',
          'Designer–developer handoff: specs, assets, naming',
        ],
        labs: [
          { title: 'Lab: Clickable prototype', focus: 'Link main flow; include at least one transition and one overlay/modal.' },
          { title: 'Lab: Annotation layer', focus: 'Notes for spacing, behavior, and edge cases for developers.' },
          { title: 'Lab: Motion intent sheet', focus: 'Describe 2–3 motions (duration, easing, trigger)—even if static mock.' },
        ],
        skillsGained: ['Prototype flows stakeholders can try', 'Document interaction intent for build'],
        assignment: 'Submit interactive prototype per rubric (core journey + key states).',
      },
      {
        title: 'Week 8: Usability Testing, Iteration & Portfolio',
        summary: 'Test with real people, refine, and tell the story.',
        topics: [
          'Usability testing: moderated vs lightweight',
          'Writing tasks and success criteria',
          'Synthesis: severity, patterns, what to fix first',
          'Iteration and scope tradeoffs',
          'Case study structure for portfolios',
          'Presentation and receiving feedback',
        ],
        labs: [
          { title: 'Lab: Run usability sessions', focus: '3 short tests with classmates or volunteers; record notes and quotes.' },
          { title: 'Lab: Iteration sprint', focus: 'Implement top 2–3 fixes in Figma; document before/after.' },
          { title: 'Lab: Portfolio case study & final presentation', focus: 'Problem → research → IA → UI → test results → next steps.' },
        ],
        skillsGained: [
          'Facilitate or participate in usability tests responsibly',
          'Ship a portfolio-ready UX/UI case study narrative',
        ],
        assignment:
          'Assessment includes assignments and critiques throughout, mid-term wireframes, interactive prototype, usability testing evidence, final portfolio case study, and presentation (per instructor rubric).',
      },
    ],
    prerequisites: ['Comfort with computers and browsers; no prior design degree required'],
    outcomes:
      'By the end of the 2-month training, students will be able to: explain the roles of UX and UI and how they support business and user goals; plan and document lightweight user research and personas; create sitemaps and user flows for small products; produce low-fidelity wireframes and iterate with critique; apply typography, color, spacing, and grids to screen layouts; build reusable UI components and accessible form patterns; create interactive prototypes and basic interaction specifications; run simple usability tests and prioritize improvements; assemble a portfolio case study that shows process and outcomes; and present design work clearly to peers and stakeholders.',
    certification: 'Anmel Inc Certificate of Completion',
  },
];
