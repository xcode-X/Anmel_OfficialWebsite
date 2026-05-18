import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, Layout, Database, Search, Smartphone, Shield, CheckCircle2 } from 'lucide-react';

const webServices = [
  {
    title: 'Custom Web Applications',
    description: 'We build scalable, high-performance web applications tailored specifically to your business processes. Our secure-by-design approach ensures your data is protected from day one.',
    icon: Code,
    features: ['React & Node.js ecosystem', 'Microservices architecture', 'Real-time capabilities', 'Enterprise-grade security']
  },
  {
    title: 'E-Commerce Solutions',
    description: 'Robust, conversion-optimized storefronts that handle high traffic and complex inventory with seamless payment gateway integrations.',
    icon: Smartphone,
    features: ['Custom storefronts', 'Secure payment processing', 'Inventory sync', 'Performance optimization']
  },
  {
    title: 'UI/UX Design',
    description: 'Beautiful, intuitive interfaces that engage users and drive conversions. We combine modern aesthetics with proven user experience principles.',
    icon: Layout,
    features: ['Wireframing & Prototyping', 'User testing', 'Responsive design', 'Accessibility (WCAG) compliance']
  },
  {
    title: 'API Development & Integration',
    description: 'Connect your systems seamlessly. We design RESTful and GraphQL APIs that act as the secure glue between your internal tools and external services.',
    icon: Database,
    features: ['REST & GraphQL', 'Third-party integrations', 'Rate limiting & security', 'Extensive documentation']
  },
  {
    title: 'SEO & Performance',
    description: 'We optimize your platform for both search engines and human users, ensuring lightning-fast load times and high visibility.',
    icon: Search,
    features: ['Core Web Vitals optimization', 'Technical SEO audits', 'Server-side rendering', 'Global CDN deployment']
  },
  {
    title: 'Web Security Hardening',
    description: 'Protect your web assets from modern cyber threats. We apply DevSecOps practices to harden your applications against OWASP Top 10 vulnerabilities.',
    icon: Shield,
    features: ['Vulnerability assessments', 'WAF configuration', 'Penetration testing', 'Automated security scanning']
  }
];

export default function WebDevelopment() {
  return (
    <div className="pt-28 bg-white min-h-screen">
      <section className="py-[var(--spacing-section)] bg-stone-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#E0F2FE] opacity-40 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#EDE9FE] opacity-40 blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-flex items-center gap-2 rounded-full border border-[#0EA5E9]/20 bg-[#0EA5E9]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#0284C7] mb-6">
            <Code className="h-4 w-4" /> Web Development
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 max-w-4xl mx-auto leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Digital Experiences That Drive Results
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="mt-6 text-lg sm:text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed"
          >
            From complex enterprise web applications to high-converting marketing platforms, we engineer secure, scalable, and stunning digital solutions tailored to your unique requirements.
          </motion.p>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] text-white font-semibold shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:-translate-y-0.5 transition-all">
              Start Your Project
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
              Comprehensive Web Services
            </h2>
            <p className="mt-4 text-stone-600 text-lg">
              We cover the entire web development lifecycle, combining cutting-edge technologies with battle-tested engineering practices.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {webServices.map((service, idx) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: idx * 0.1 }}
                  className="rounded-2xl border border-stone-200/80 bg-white p-8 shadow-[var(--shadow-card)] hover:border-sky-300 hover:shadow-xl hover:shadow-sky-500/10 transition-all group"
                >
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-sky-100 to-sky-50 flex items-center justify-center text-sky-600 mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="h-7 w-7" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 mb-3" style={{ fontFamily: 'var(--font-display)' }}>{service.title}</h3>
                  <p className="text-stone-600 leading-relaxed mb-6 text-sm">{service.description}</p>
                  
                  <ul className="space-y-2 mt-auto border-t border-stone-100 pt-4">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-stone-700">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-sky-500 mt-0.5" strokeWidth={2.5} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 bg-stone-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(14,165,233,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(124,58,237,0.15),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-display)' }}>
            Ready to build your next big idea?
          </h2>
          <p className="mt-4 text-stone-400 max-w-xl mx-auto text-lg">
            Let's discuss your requirements and map out a technical strategy that aligns perfectly with your business goals.
          </p>
          <Link
            to="/contact"
            className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-stone-900 font-bold hover:bg-stone-100 transition-colors"
          >
            Schedule a Discovery Call
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
