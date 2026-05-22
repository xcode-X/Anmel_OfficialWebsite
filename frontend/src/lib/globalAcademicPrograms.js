/**
 * Standard academic programs / fields of study used worldwide.
 * Shipped with the app — no admin setup required for scholarship applications.
 */

function programs(names, level = '') {
  return names.map((name) => ({ name, level }));
}

/** @type {{ label: string, programs: { name: string, level: string }[] }[]} */
export const GLOBAL_PROGRAM_GROUPS = [
  {
    label: 'Business, Finance & Economics',
    programs: [
      ...programs(['Accounting', 'Actuarial Science', 'Banking & Finance', 'Business Administration', 'Business Analytics', 'Economics', 'Entrepreneurship', 'Finance', 'Financial Technology (FinTech)', 'Hospitality Management', 'Human Resource Management', 'International Business', 'Logistics & Supply Chain Management', 'Management', 'Marketing', 'Project Management', 'Public Administration', 'Real Estate', 'Risk Management', 'Tourism Management'], 'Undergraduate'),
      ...programs(['MBA (Master of Business Administration)', 'Master of Accounting', 'Master of Economics', 'Master of Finance', 'Master of Human Resource Management', 'Master of International Business', 'Master of Marketing', 'Master of Public Administration', 'Master of Supply Chain Management', 'Executive MBA'], "Master's"),
      ...programs(['PhD in Business Administration', 'PhD in Economics', 'PhD in Finance'], 'PhD'),
    ],
  },
  {
    label: 'Computing, IT & Data',
    programs: [
      ...programs(['Artificial Intelligence', 'Computer Engineering', 'Computer Science', 'Cybersecurity', 'Data Science', 'Information Systems', 'Information Technology', 'Network Engineering', 'Software Engineering', 'Web Development', 'Cloud Computing', 'Game Development', 'Information Security'], 'Undergraduate'),
      ...programs(['Master of Computer Science', 'Master of Cybersecurity', 'Master of Data Science', 'Master of Information Technology', 'Master of Software Engineering', 'Master of Artificial Intelligence'], "Master's"),
      ...programs(['PhD in Computer Science', 'PhD in Information Systems'], 'PhD'),
    ],
  },
  {
    label: 'Engineering & Technology',
    programs: [
      ...programs(['Aerospace Engineering', 'Agricultural Engineering', 'Architectural Engineering', 'Biomedical Engineering', 'Chemical Engineering', 'Civil Engineering', 'Electrical Engineering', 'Electronics Engineering', 'Environmental Engineering', 'Industrial Engineering', 'Mechanical Engineering', 'Mechatronics Engineering', 'Mining Engineering', 'Petroleum Engineering', 'Renewable Energy Engineering', 'Robotics Engineering', 'Structural Engineering', 'Telecommunications Engineering'], 'Undergraduate'),
      ...programs(['Master of Engineering (MEng)', 'Master of Civil Engineering', 'Master of Electrical Engineering', 'Master of Mechanical Engineering', 'Master of Structural Engineering'], "Master's"),
      ...programs(['PhD in Engineering'], 'PhD'),
    ],
  },
  {
    label: 'Health & Medical Sciences',
    programs: [
      ...programs(['Dentistry', 'Health Sciences', 'Medical Laboratory Science', 'Medicine (MBBS / MD pathway)', 'Midwifery', 'Nursing', 'Nutrition & Dietetics', 'Occupational Therapy', 'Pharmacy', 'Physiotherapy', 'Public Health', 'Radiography', 'Speech Therapy', 'Veterinary Medicine'], 'Undergraduate'),
      ...programs(['Master of Public Health (MPH)', 'Master of Nursing', 'Master of Pharmacy', 'Master of Physiotherapy', 'Master of Health Administration'], "Master's"),
      ...programs(['PhD in Public Health', 'PhD in Nursing', 'PhD in Medical Sciences'], 'PhD'),
    ],
  },
  {
    label: 'Natural & Physical Sciences',
    programs: [
      ...programs(['Agriculture', 'Agronomy', 'Animal Science', 'Biochemistry', 'Biology', 'Biotechnology', 'Botany', 'Chemistry', 'Environmental Science', 'Food Science', 'Forestry', 'Geography', 'Geology', 'Marine Science', 'Mathematics', 'Microbiology', 'Physics', 'Statistics', 'Zoology'], 'Undergraduate'),
      ...programs(['Master of Science (MSc) — Biology', 'Master of Science (MSc) — Chemistry', 'Master of Science (MSc) — Physics', 'Master of Environmental Science'], "Master's"),
      ...programs(['PhD in Biological Sciences', 'PhD in Chemistry', 'PhD in Physics'], 'PhD'),
    ],
  },
  {
    label: 'Arts, Design & Media',
    programs: [
      ...programs(['Architecture', 'Creative Writing', 'Fashion Design', 'Film & Television', 'Fine Arts', 'Graphic Design', 'Industrial Design', 'Interior Design', 'Journalism', 'Landscape Architecture', 'Media Studies', 'Music', 'Performing Arts', 'Photography', 'Theatre Arts', 'Visual Communication'], 'Undergraduate'),
      ...programs(['Master of Architecture', 'Master of Fine Arts (MFA)', 'Master of Design', 'Master of Journalism'], "Master's"),
      ...programs(['PhD in Arts & Humanities'], 'PhD'),
    ],
  },
  {
    label: 'Social Sciences & Humanities',
    programs: [
      ...programs(['Anthropology', 'Archaeology', 'Criminology', 'Development Studies', 'Education', 'English Language & Literature', 'Gender Studies', 'History', 'International Relations', 'Languages & Linguistics', 'Law (LLB)', 'Philosophy', 'Political Science', 'Psychology', 'Social Work', 'Sociology', 'Theology & Religious Studies'], 'Undergraduate'),
      ...programs(['Master of Arts (MA)', 'Master of Education', 'Master of Laws (LLM)', 'Master of International Relations', 'Master of Psychology', 'Master of Social Work'], "Master's"),
      ...programs(['PhD in Education', 'PhD in Psychology', 'PhD in Sociology'], 'PhD'),
    ],
  },
  {
    label: 'Foundation & Pre-University',
    programs: programs([
      'Foundation in Business',
      'Foundation in Engineering',
      'Foundation in Science',
      'International Foundation Year',
      'Pre-Medical / Pre-Health Foundation',
      'University Foundation Programme',
    ], 'Foundation'),
  },
  {
    label: 'Diploma, Certificate & Vocational',
    programs: programs([
      'Diploma in Business',
      'Diploma in Computing',
      'Diploma in Engineering',
      'Diploma in Health Sciences',
      'Diploma in Hospitality',
      'Graduate Certificate',
      'Graduate Diploma',
      'Postgraduate Diploma',
      'Professional Certificate',
      'Technical & Vocational Education (TVET)',
    ], 'Diploma'),
  },
];

/** Flat list for datalist / search. */
export function getGlobalAcademicProgramsFlat() {
  const rows = [];
  for (const group of GLOBAL_PROGRAM_GROUPS) {
    for (const p of group.programs) {
      rows.push({ ...p, group: group.label });
    }
  }
  return rows;
}

export function getGlobalProgramOptionCount() {
  return getGlobalAcademicProgramsFlat().length;
}
