import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';

const DB_FILE_PATH = resolve(process.cwd(), 'uploads', '.local_db.json');

function ensureDirectory() {
  const dir = dirname(DB_FILE_PATH);
  if (!existsSync(dir)) {
    try { mkdirSync(dir, { recursive: true }); } catch { /* ignore */ }
  }
}

const initialSeed = {
  universities: [
    {
      id: 'uni-1',
      _id: 'uni-1',
      name: 'University of Oxford',
      country: 'United Kingdom',
      city: 'Oxford',
      worldRanking: 1,
      acceptanceRate: '17.5%',
      featured: true,
      popularCourses: ['Computer Science', 'Cyber Security', 'Business Management', 'Data Science'],
      logoUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=400&auto=format&fit=crop&q=80',
      description: 'World-renowned institution offering top-tier undergraduate and postgraduate degrees with extensive scholarship options.',
    },
    {
      id: 'uni-2',
      _id: 'uni-2',
      name: 'University of Toronto',
      country: 'Canada',
      city: 'Toronto',
      worldRanking: 21,
      acceptanceRate: '43%',
      featured: true,
      popularCourses: ['Software Engineering', 'Cybersecurity', 'Biomedical Sciences', 'Finance'],
      logoUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=400&auto=format&fit=crop&q=80',
      description: 'Canada’s leading global research university with generous funding and post-graduation work opportunities.',
    },
    {
      id: 'uni-3',
      _id: 'uni-3',
      name: 'Monash University',
      country: 'Australia',
      city: 'Melbourne',
      worldRanking: 42,
      acceptanceRate: '40%',
      featured: true,
      popularCourses: ['Information Technology', 'Cyber Security', 'International Business'],
      logoUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&auto=format&fit=crop&q=80',
      description: 'Australia’s largest university providing innovative STEM and business education with high career placement.',
    },
    {
      id: 'uni-4',
      _id: 'uni-4',
      name: 'Technical University of Munich',
      country: 'Germany',
      city: 'Munich',
      worldRanking: 30,
      acceptanceRate: '28%',
      featured: true,
      popularCourses: ['Informatics', 'Engineering', 'AI & Machine Learning'],
      logoUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=400&auto=format&fit=crop&q=80',
      description: 'Top European technology university offering tuition-free & low-cost degree programs for international students.',
    },
  ],
  scholarships: [
    {
      id: 'sch-1',
      _id: 'sch-1',
      title: 'Global Leaders STEM & Technology Fellowship',
      provider: 'Anmel Education Foundation',
      amount: '$25,000 / Year (Full Tuition)',
      country: 'Global / UK / Canada',
      deadline: '2026-10-30',
      degreeLevel: 'Postgraduate & Undergraduate',
      featured: true,
      published: true,
      description: 'Fully funded scholarship supporting outstanding international applicants pursuing degrees in Computer Science, Cyber Security, and Engineering.',
      eligibility: ['Minimum 3.2 GPA', 'Strong leadership record', 'Enrolled or applying to STEM program'],
    },
    {
      id: 'sch-2',
      _id: 'sch-2',
      title: 'Women in Tech & Web Engineering Grant',
      provider: 'Anmel Tech Inclusion Program',
      amount: '$15,000',
      country: 'Australia & UK',
      deadline: '2026-11-15',
      degreeLevel: 'Undergraduate',
      featured: true,
      published: true,
      description: 'Dedicated scholarship aimed at increasing female representation in software development, cloud systems, and cybersecurity.',
      eligibility: ['Female applicants in tech fields', 'Academic excellence'],
    },
    {
      id: 'sch-3',
      _id: 'sch-3',
      title: 'African International Scholars Award',
      provider: 'Global Education Council',
      amount: 'Full Tuition + Living Stipend',
      country: 'UK, USA & Canada',
      deadline: '2026-12-01',
      degreeLevel: 'Master & PhD',
      featured: true,
      published: true,
      description: 'Merit-based award covering 100% tuition, monthly living allowance, and return airfare for high-achieving African students.',
      eligibility: ['Citizens of African nations', 'First-class or upper second-class honors degree'],
    },
  ],
  testimonials: [
    {
      id: 't-1',
      _id: 't-1',
      name: 'Emmanuel K. Kollie',
      role: 'Master Student in Cyber Security',
      company: 'University of York, UK',
      quote: 'Anmel Education Consultants guided me from application to securing a 100% scholarship. Their team made my UK study dream a reality!',
      accent: 'sky',
    },
    {
      id: 't-2',
      _id: 't-2',
      name: 'Sarah J. Mensah',
      role: 'CTO & Co-Founder',
      company: 'Apex Global Logistics',
      quote: 'Anmel’s Web Development team built our web application from scratch while their Cyber Security team passed our SOC 2 compliance audit cleanly.',
      accent: 'purple',
    },
    {
      id: 't-3',
      _id: 't-3',
      name: 'Marcus V. Davies',
      role: 'Head of IT Infrastructure',
      company: 'Liberia Financial Group',
      quote: 'The penetration testing and security assessment delivered by Anmel Security Consultants uncovered critical flaws before our product launch.',
      accent: 'orange',
    },
  ],
  contactSubmissions: [],
  studentRegistrations: [],
  scholarshipApplications: [],
  agents: [],
  securityScanRecords: [],
  blogPosts: [
    {
      id: 'blog-1',
      _id: 'blog-1',
      title: 'Top 10 International Scholarships for 2026/2027 Admissions',
      slug: 'top-international-scholarships-2026',
      category: 'Education',
      author: 'Anmel Education Advisory',
      excerpt: 'Discover fully funded undergraduate and master scholarship opportunities across the UK, Canada, USA, and Europe.',
      content: '<p>Applying for international scholarships requires preparation, compelling statements of purpose, and early application strategies...</p>',
      published: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'blog-2',
      _id: 'blog-2',
      title: 'Building Resilient Full-Stack Applications with Modern Security Controls',
      slug: 'resilient-fullstack-web-security',
      category: 'Development',
      author: 'Anmel Web & Security Lab',
      excerpt: 'How integrating threat modeling early in web development reduces remediation costs and enhances user trust.',
      content: '<p>Security should never be an afterthought. Modern web applications require end-to-end encryption, robust CORS strategies, and sanitized input vectors...</p>',
      published: true,
      createdAt: new Date().toISOString(),
    },
  ],
  caseStudies: [
    {
      id: 'cs-1',
      _id: 'cs-1',
      title: 'Securing & Scaling Enterprise FinTech Web Portal',
      slug: 'securing-scaling-fintech-portal',
      category: 'Web Dev & Cybersecurity',
      client: 'Global FinTech Corp',
      summary: 'Delivered a high-performance web dashboard with zero critical vulnerability findings during ISO 27001 audit.',
      published: true,
    },
  ],
};

class LocalDbStore {
  constructor() {
    this.data = this.load();
  }

  load() {
    ensureDirectory();
    if (existsSync(DB_FILE_PATH)) {
      try {
        const raw = readFileSync(DB_FILE_PATH, 'utf8');
        const parsed = JSON.parse(raw);
        return { ...initialSeed, ...parsed };
      } catch {
        return { ...initialSeed };
      }
    }
    this.saveData(initialSeed);
    return { ...initialSeed };
  }

  saveData(data) {
    ensureDirectory();
    try {
      writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      console.warn('[LocalDbStore] Failed to save local db:', e.message);
    }
  }

  getCollection(name) {
    if (!this.data[name]) {
      this.data[name] = [];
    }
    return this.data[name];
  }

  find(collectionName, filter = {}) {
    const list = this.getCollection(collectionName);
    return list.filter((item) => {
      for (const [k, v] of Object.entries(filter)) {
        if (v && typeof v === 'object' && !Array.isArray(v)) {
          if ('$ne' in v && item[k] === v.$ne) return false;
          if ('$regex' in v) {
            const re = new RegExp(v.$regex, 'i');
            if (!re.test(String(item[k] || ''))) return false;
          }
        } else if (item[k] !== v) {
          return false;
        }
      }
      return true;
    });
  }

  findById(collectionName, id) {
    const list = this.getCollection(collectionName);
    return list.find((item) => String(item.id || item._id) === String(id)) || null;
  }

  create(collectionName, data) {
    const list = this.getCollection(collectionName);
    const id = data.id || data._id || `${collectionName.slice(0, 3)}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const doc = { id, _id: id, createdAt: now, updatedAt: now, ...data };
    list.unshift(doc);
    this.saveData(this.data);
    return doc;
  }

  update(collectionName, id, patch) {
    const list = this.getCollection(collectionName);
    const index = list.findIndex((item) => String(item.id || item._id) === String(id));
    if (index === -1) return null;
    const updated = { ...list[index], ...patch, updatedAt: new Date().toISOString() };
    list[index] = updated;
    this.saveData(this.data);
    return updated;
  }

  delete(collectionName, id) {
    const list = this.getCollection(collectionName);
    const index = list.findIndex((item) => String(item.id || item._id) === String(id));
    if (index === -1) return null;
    const removed = list.splice(index, 1)[0];
    this.saveData(this.data);
    return removed;
  }
}

export const localStore = new LocalDbStore();
