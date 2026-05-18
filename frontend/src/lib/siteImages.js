/**
 * Central image URLs for the Anmel Inc site.
 * Unsplash URLs use ixlib + fit=crop so images resolve reliably in the browser.
 * Photo IDs are verified (GET 200) against images.unsplash.com.
 */

const U = (id, w = 1200, h = 800, extra = '') => {
  const tail = extra ? `&${extra}` : '';
  return `https://images.unsplash.com/photo-${id}?ixlib=rb-4.0.3&auto=format&fit=crop&w=${w}&h=${h}&q=80${tail}`;
};

/* --- Verified photo IDs (do not swap without testing the URL) --- */
const IDS = {
  workspace: '1504384308090-c894fdcc538d',
  meeting: '1521737711867-e3b97375f902',
  laptopDesk: '1460925895917-afdab827c52f',
  techAbstract: '1518770660439-4636190af475',
  codeSecurity: '1555949963-aa79dcee981c',
  assessment: '1563986768609-322da13575f3',
  portraitA: '1573496359142-b8d87734a5a2',
  charts: '1454165804606-c3d57bc86b40',
  healthcare: '1576091160399-112ba8d25d1d',
  ecommerce: '1551434678-e076c223a692',
  matrix: '1526374965328-7f61d4dc18c5',
};

export const testimonialAvatars = {
  david: U(IDS.portraitA, 400, 400, 'facepad=3'),
  amara: U(IDS.assessment, 400, 400, 'facepad=3'),
  michael: U(IDS.charts, 400, 400, 'facepad=3'),
};

export const caseStudyImages = {
  financial: U(IDS.assessment, 1000, 750),
  ecommerce: U(IDS.ecommerce, 1000, 750),
  healthcare: U(IDS.healthcare, 1000, 750),
};

export const blogImages = {
  security: U(IDS.codeSecurity, 1000, 600),
  compliance: U(IDS.charts, 1000, 600),
  development: U(IDS.techAbstract, 1000, 600),
};

export const heroImage = U(IDS.workspace, 1600, 1200);

export const aboutTeamImage = U(IDS.meeting, 1200, 800);

/** Extra imagery for About page sections */
export const aboutGalleryImages = {
  collaboration: U(IDS.workspace, 1000, 700),
  operations: U(IDS.matrix, 1000, 700),
  consultation: U(IDS.laptopDesk, 1000, 700),
};

export const contactImage = U(IDS.meeting, 1000, 750);

export const servicesHeroImage = U(IDS.techAbstract, 1600, 800);

/** Right-column preview in the Services nav dropdown (keyed by service slug). */
export const serviceNavPreviewImages = {
  'security-assessment': U(IDS.assessment, 900, 1100),
  'secure-development': U(IDS.codeSecurity, 900, 1100),
  compliance: U(IDS.charts, 900, 1100),
  monitoring: U(IDS.matrix, 900, 1100),
  'cloud-security': U(IDS.techAbstract, 900, 1100),
  training: U(IDS.meeting, 900, 1100),
};

export function getServiceNavPreviewImage(slug) {
  if (!slug || typeof slug !== 'string') return servicesHeroImage;
  return serviceNavPreviewImages[slug] || servicesHeroImage;
}

export const educationHeroImage = U(IDS.meeting, 1800, 1000);

/** Course cards / detail heroes (slug → image). Introductory catalog. */
export const courseHeroImages = {
  'intro-cyber-security-foundations': U(IDS.assessment, 1400, 900),
  'intro-digital-safety-privacy': U(IDS.healthcare, 1400, 900),
  'intro-networking-for-security': U(IDS.matrix, 1400, 900),
  'intro-web-html-css': U(IDS.laptopDesk, 1400, 900),
  'intro-javascript-essentials': U(IDS.codeSecurity, 1400, 900),
  'intro-building-web-projects': U(IDS.workspace, 1400, 900),
  'intro-ux-ui-design': U(IDS.ecommerce, 1400, 900),
};

export function getCourseHeroImage(slug) {
  if (!slug || typeof slug !== 'string') return educationHeroImage;
  return courseHeroImages[slug] || educationHeroImage;
}

export const capabilityImages = {
  pentest: U(IDS.assessment, 800, 600),
  audits: U(IDS.charts, 800, 600),
  compliance: U(IDS.healthcare, 800, 600),
  webdev: U(IDS.codeSecurity, 800, 600),
  cloud: U(IDS.matrix, 800, 600),
};

export const resourceStripImages = {
  blog: U(IDS.codeSecurity, 900, 600),
  papers: U(IDS.meeting, 900, 600),
};

export default {
  testimonialAvatars,
  caseStudyImages,
  blogImages,
  heroImage,
  aboutTeamImage,
  aboutGalleryImages,
  contactImage,
  servicesHeroImage,
  serviceNavPreviewImages,
  getServiceNavPreviewImage,
  educationHeroImage,
  courseHeroImages,
  getCourseHeroImage,
  capabilityImages,
  resourceStripImages,
};
