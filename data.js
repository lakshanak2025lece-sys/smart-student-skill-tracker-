/* ══════════════════════════════════════════
   data.js — localStorage CRUD + seed data
══════════════════════════════════════════ */

const DB_KEYS = {
  skills:   'sst_skills',
  courses:  'sst_courses',
  certs:    'sst_certs',
  projects: 'sst_projects',
  goals:    'sst_goals',
  activity: 'sst_activity',
  profile:  'sst_profile',
};

/* ── Seed Data ───────────────────────────── */
const SEED_SKILLS = [
  { id: 'sk1', name: 'HTML & CSS', category: 'Frontend', level: 4, status: 'completed', createdAt: '2024-01-10' },
  { id: 'sk2', name: 'JavaScript', category: 'Frontend', level: 3, status: 'in-progress', createdAt: '2024-02-05' },
  { id: 'sk3', name: 'React.js',   category: 'Frontend', level: 2, status: 'in-progress', createdAt: '2024-03-12' },
  { id: 'sk4', name: 'Python',     category: 'Backend',  level: 4, status: 'completed',   createdAt: '2024-01-20' },
  { id: 'sk5', name: 'Node.js',    category: 'Backend',  level: 2, status: 'to-learn',    createdAt: '2024-04-01' },
  { id: 'sk6', name: 'SQL',        category: 'Database', level: 3, status: 'in-progress', createdAt: '2024-02-15' },
  { id: 'sk7', name: 'Git & GitHub', category: 'Tools', level: 3, status: 'completed',   createdAt: '2024-01-25' },
  { id: 'sk8', name: 'Machine Learning', category: 'AI/ML', level: 2, status: 'in-progress', createdAt: '2024-05-01' },
];

const SEED_COURSES = [
  { id: 'co1', name: 'The Web Developer Bootcamp',      platform: 'Udemy',    duration: '63 hrs', completion: 100, status: 'completed',   startDate: '2024-01-01', endDate: '2024-03-10' },
  { id: 'co2', name: 'JavaScript Algorithms & Data Structures', platform: 'freeCodeCamp', duration: '300 hrs', completion: 65, status: 'in-progress', startDate: '2024-04-01', endDate: '' },
  { id: 'co3', name: 'Python for Data Science & ML',   platform: 'Coursera', duration: '40 hrs', completion: 100, status: 'completed',   startDate: '2024-02-10', endDate: '2024-04-20' },
  { id: 'co4', name: 'React — The Complete Guide',      platform: 'Udemy',    duration: '48 hrs', completion: 30, status: 'in-progress', startDate: '2024-06-01', endDate: '' },
];

const SEED_CERTS = [
  { id: 'ce1', name: 'Responsive Web Design', issuer: 'freeCodeCamp', date: '2024-03-15', credLink: 'https://freecodecamp.org', category: 'Frontend' },
  { id: 'ce2', name: 'Python 3 Programming Specialization', issuer: 'University of Michigan (Coursera)', date: '2024-04-25', credLink: 'https://coursera.org', category: 'Backend' },
  { id: 'ce3', name: 'Google Analytics Certification', issuer: 'Google', date: '2024-05-10', credLink: 'https://google.com', category: 'Analytics' },
];

const SEED_PROJECTS = [
  { id: 'pr1', name: 'Personal Portfolio Website',   desc: 'A responsive portfolio website built with HTML, CSS, and JavaScript showcasing my projects and skills.', techStack: ['HTML','CSS','JavaScript'], githubUrl: 'https://github.com', status: 'completed',   createdAt: '2024-02-01' },
  { id: 'pr2', name: 'Weather Dashboard App',        desc: 'Real-time weather app using OpenWeatherMap API with city search and 5-day forecast.', techStack: ['JavaScript','API','CSS'], githubUrl: 'https://github.com', status: 'completed',   createdAt: '2024-03-20' },
  { id: 'pr3', name: 'Student Grade Management System', desc: 'Python-based CLI tool to manage student grades, compute GPA, and generate reports.', techStack: ['Python','SQLite'], githubUrl: 'https://github.com', status: 'in-progress', createdAt: '2024-05-10' },
  { id: 'pr4', name: 'E-Commerce Frontend Clone',   desc: 'UI clone of a popular e-commerce site using React and Tailwind CSS.', techStack: ['React','CSS'], githubUrl: '', status: 'planned',     createdAt: '2024-06-01' },
];

const SEED_GOALS = [
  { id: 'go1', title: 'Master React.js',       skill: 'React.js',   deadline: '2024-12-31', progress: 30, notes: 'Complete the Udemy course and build 3 projects' },
  { id: 'go2', title: 'Learn Node.js & Express', skill: 'Node.js', deadline: '2025-02-28', progress: 10, notes: 'Start with the basics and build a REST API' },
  { id: 'go3', title: 'Get SQL Certified',      skill: 'SQL',       deadline: '2024-11-30', progress: 60, notes: 'Complete HackerRank SQL track' },
  { id: 'go4', title: 'Build ML Portfolio Project', skill: 'Machine Learning', deadline: '2025-01-15', progress: 20, notes: 'Train a model on Kaggle dataset' },
];

const SEED_ACTIVITY = [
  { id: 'ac1', text: 'Added skill <strong>React.js</strong>', color: '#7c3aed', time: '2 hours ago' },
  { id: 'ac2', text: 'Completed course <strong>Web Developer Bootcamp</strong>', color: '#10b981', time: '1 day ago' },
  { id: 'ac3', text: 'Created project <strong>Weather Dashboard App</strong>', color: '#06b6d4', time: '3 days ago' },
  { id: 'ac4', text: 'Earned certification <strong>Responsive Web Design</strong>', color: '#f59e0b', time: '1 week ago' },
  { id: 'ac5', text: 'Set new goal <strong>Master React.js</strong>', color: '#7c3aed', time: '2 weeks ago' },
];

const SEED_PROFILE = {
  name: 'Alex Johnson',
  role: 'CS Undergraduate',
  institution: 'State University',
  target: 'fullstack',
};

/* ── Init / Seed ─────────────────────────── */
function dbInit() {
  if (!localStorage.getItem(DB_KEYS.skills))   dbSet(DB_KEYS.skills,   SEED_SKILLS);
  if (!localStorage.getItem(DB_KEYS.courses))  dbSet(DB_KEYS.courses,  SEED_COURSES);
  if (!localStorage.getItem(DB_KEYS.certs))    dbSet(DB_KEYS.certs,    SEED_CERTS);
  if (!localStorage.getItem(DB_KEYS.projects)) dbSet(DB_KEYS.projects, SEED_PROJECTS);
  if (!localStorage.getItem(DB_KEYS.goals))    dbSet(DB_KEYS.goals,    SEED_GOALS);
  if (!localStorage.getItem(DB_KEYS.activity)) dbSet(DB_KEYS.activity, SEED_ACTIVITY);
  if (!localStorage.getItem(DB_KEYS.profile))  dbSet(DB_KEYS.profile,  SEED_PROFILE);
}

/* ── Generic CRUD ────────────────────────── */
function dbGet(key)         { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } }
function dbSet(key, value)  { localStorage.setItem(key, JSON.stringify(value)); }

function dbGetObj(key)      { try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; } }
function dbSetObj(key, obj) { localStorage.setItem(key, JSON.stringify(obj)); }

function dbAdd(key, item) {
  const list = dbGet(key);
  list.unshift(item);
  dbSet(key, list);
}

function dbUpdate(key, id, updates) {
  const list = dbGet(key);
  const idx  = list.findIndex(i => i.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updates };
    dbSet(key, list);
    return list[idx];
  }
  return null;
}

function dbDelete(key, id) {
  const list = dbGet(key).filter(i => i.id !== id);
  dbSet(key, list);
}

function dbFindById(key, id) {
  return dbGet(key).find(i => i.id === id) || null;
}

/* ── ID Generator ───────────────────────── */
function genId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/* ── Activity Logger ────────────────────── */
function logActivity(text, color = '#7c3aed') {
  const activity = dbGet(DB_KEYS.activity);
  activity.unshift({ id: genId('ac'), text, color, time: 'Just now' });
  if (activity.length > 20) activity.pop();
  dbSet(DB_KEYS.activity, activity);
}

/* ── Skill Category Colors ──────────────── */
const CATEGORY_COLORS = {
  'Frontend':   '#7c3aed',
  'Backend':    '#06b6d4',
  'Database':   '#10b981',
  'DevOps':     '#f59e0b',
  'AI/ML':      '#ef4444',
  'Mobile':     '#8b5cf6',
  'Tools':      '#64748b',
  'Security':   '#dc2626',
  'Other':      '#475569',
};

function getCategoryColor(cat) {
  return CATEGORY_COLORS[cat] || '#475569';
}

/* ── Level labels ───────────────────────── */
const LEVEL_LABELS = ['', 'Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];

function getLevelLabel(lvl) {
  return LEVEL_LABELS[lvl] || 'Unknown';
}

/* ── Status config ──────────────────────── */
const STATUS_CONFIG = {
  'completed':   { label: 'Completed',   class: 'badge-success', icon: 'fa-check-circle' },
  'in-progress': { label: 'In Progress', class: 'badge-warning', icon: 'fa-spinner' },
  'to-learn':    { label: 'To Learn',    class: 'badge-muted',   icon: 'fa-bookmark' },
  'planned':     { label: 'Planned',     class: 'badge-info',    icon: 'fa-calendar' },
};

function getStatusConfig(status) {
  return STATUS_CONFIG[status] || { label: status, class: 'badge-muted', icon: 'fa-circle' };
}

/* ── Job role required skills ───────────── */
const ROLE_SKILLS = {
  frontend: {
    label: 'Frontend Developer',
    required: ['HTML & CSS','JavaScript','React.js','TypeScript','Git & GitHub','Responsive Design','REST APIs','Testing','Performance Optimization','Webpack/Vite'],
  },
  backend: {
    label: 'Backend Developer',
    required: ['Python','Node.js','SQL','MongoDB','REST APIs','Authentication','Docker','Git & GitHub','Linux/CLI','System Design'],
  },
  fullstack: {
    label: 'Full Stack Developer',
    required: ['HTML & CSS','JavaScript','React.js','Node.js','SQL','MongoDB','Git & GitHub','REST APIs','Docker','Authentication'],
  },
  'data-scientist': {
    label: 'Data Scientist',
    required: ['Python','SQL','Machine Learning','Statistics','Pandas & NumPy','Data Visualization','Scikit-learn','Jupyter','Feature Engineering','Deep Learning'],
  },
  'ml-engineer': {
    label: 'ML Engineer',
    required: ['Python','Machine Learning','Deep Learning','TensorFlow/PyTorch','Docker','SQL','Git & GitHub','Linux/CLI','MLOps','Model Deployment'],
  },
  devops: {
    label: 'DevOps Engineer',
    required: ['Docker','Kubernetes','Linux/CLI','Git & GitHub','CI/CD','AWS/GCP/Azure','Terraform','Python','Networking','Security Basics'],
  },
  mobile: {
    label: 'Mobile Developer',
    required: ['JavaScript','React Native','Git & GitHub','REST APIs','UI/UX Design','Testing','App Store Deployment','State Management','TypeScript','Performance Optimization'],
  },
  cybersecurity: {
    label: 'Cybersecurity Analyst',
    required: ['Networking','Linux/CLI','Python','Security Basics','Ethical Hacking','Firewalls & IDS','SQL','Git & GitHub','Cryptography','Penetration Testing'],
  },
};

/* ── Learning Resources ─────────────────── */
const RESOURCES = {
  'React.js':          [{ title: 'React — The Complete Guide',   platform: 'Udemy',        url: 'https://udemy.com',      icon: '⚛️', color: '#06b6d4' }],
  'Node.js':           [{ title: 'NodeJS — The Complete Guide',  platform: 'Udemy',        url: 'https://udemy.com',      icon: '🟢', color: '#10b981' }],
  'TypeScript':        [{ title: 'TypeScript Handbook',          platform: 'Official Docs', url: 'https://typescriptlang.org', icon: '🔷', color: '#3b82f6' }],
  'MongoDB':           [{ title: 'MongoDB University',           platform: 'MongoDB',      url: 'https://university.mongodb.com', icon: '🍃', color: '#10b981' }],
  'Docker':            [{ title: 'Docker & Kubernetes: The Guide', platform: 'Udemy',      url: 'https://udemy.com',      icon: '🐳', color: '#06b6d4' }],
  'Machine Learning':  [{ title: 'Machine Learning Specialization', platform: 'Coursera', url: 'https://coursera.org',   icon: '🤖', color: '#7c3aed' }],
  'Deep Learning':     [{ title: 'Deep Learning Specialization',   platform: 'Coursera', url: 'https://coursera.org',   icon: '🧠', color: '#ef4444' }],
  'TensorFlow/PyTorch':[{ title: 'TensorFlow Developer Certificate', platform: 'Google',  url: 'https://tensorflow.org', icon: '🔶', color: '#f59e0b' }],
  'Kubernetes':        [{ title: 'Kubernetes for Beginners',      platform: 'KodeKloud',   url: 'https://kodekloud.com',  icon: '☸️', color: '#06b6d4' }],
  'AWS/GCP/Azure':     [{ title: 'AWS Cloud Practitioner',        platform: 'AWS',         url: 'https://aws.amazon.com', icon: '☁️', color: '#f59e0b' }],
  'React Native':      [{ title: 'React Native — Practical Guide', platform: 'Udemy',     url: 'https://udemy.com',      icon: '📱', color: '#06b6d4' }],
  'Ethical Hacking':   [{ title: 'Ethical Hacking Bootcamp',      platform: 'Udemy',       url: 'https://udemy.com',      icon: '🔐', color: '#ef4444' }],
  'Penetration Testing':[{ title: 'CEH Certification Prep',      platform: 'EC-Council',   url: 'https://eccouncil.org',  icon: '🛡️', color: '#dc2626' }],
  'default':           [{ title: 'Search on Coursera',            platform: 'Coursera',    url: 'https://coursera.org',   icon: '📚', color: '#7c3aed' }],
};

function getResources(skillName) {
  return RESOURCES[skillName] || RESOURCES['default'];
}
