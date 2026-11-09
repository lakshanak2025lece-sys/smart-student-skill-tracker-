/* ══════════════════════════════════════════
   app.js — App init, router, state, utils
══════════════════════════════════════════ */

/* ── App Singleton ───────────────────────── */
const App = (() => {

  /* ── State ───────────────────────────── */
  let currentPage   = 'dashboard';
  let modalCallback = null;

  /* ── Page Map ────────────────────────── */
  const PAGES = {
    dashboard: { title: 'Dashboard',             render: renderDashboard },
    skills:    { title: 'My Skills',             render: renderSkills    },
    courses:   { title: 'Courses & Certifications', render: renderCourses },
    projects:  { title: 'Projects Portfolio',   render: renderProjects  },
    goals:     { title: 'Learning Goals',        render: renderGoals     },
    analyzer:  { title: 'Skill Gap Analyzer',    render: renderAnalyzer  },
  };

  /* ── Init ────────────────────────────── */
  function init() {
    dbInit();
    setupSidebar();
    setupModal();
    setupProfile();
    setupSearch();
    updateBadges();
    navigate('dashboard');
  }

  /* ── Router ──────────────────────────── */
  function navigate(page) {
    if (!PAGES[page]) page = 'dashboard';
    currentPage = page;

    /* Update nav */
    document.querySelectorAll('.nav-link').forEach(a => {
      a.classList.toggle('active', a.dataset.page === page);
    });

    /* Update topbar title */
    document.getElementById('topbarTitle').textContent = PAGES[page].title;

    /* Show loader briefly for perceived performance */
    const content = document.getElementById('mainContent');
    content.innerHTML = '<div class="page-loader active"><div class="loader-spinner"></div></div>';

    setTimeout(() => {
      PAGES[page].render();
      updateBadges();
      closeSidebar();
    }, 150);
  }

  /* ── Sidebar ─────────────────────────── */
  function setupSidebar() {
    const hamburger = document.getElementById('hamburger');
    const close     = document.getElementById('sidebarClose');
    const overlay   = document.getElementById('sidebarOverlay');
    const sidebar   = document.getElementById('sidebar');

    hamburger?.addEventListener('click', openSidebar);
    close?.addEventListener('click',     closeSidebar);
    overlay?.addEventListener('click',   closeSidebar);

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        navigate(link.dataset.page);
      });
    });
  }

  function openSidebar() {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebarOverlay').classList.add('visible');
  }

  function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('visible');
  }

  /* ── Modal ───────────────────────────── */
  function setupModal() {
    document.getElementById('modalClose').addEventListener('click',   closeModal);
    document.getElementById('modalCancel').addEventListener('click',  closeModal);
    document.getElementById('modalConfirm').addEventListener('click', () => {
      if (typeof modalCallback === 'function') {
        const result = modalCallback();
        if (result !== false) closeModal();
      } else {
        closeModal();
      }
    });
    document.getElementById('modalBackdrop').addEventListener('click', e => {
      if (e.target === document.getElementById('modalBackdrop')) closeModal();
    });
  }

  function openModal(title, bodyHtml, confirmCallback, confirmLabel = 'Save') {
    document.getElementById('modalTitle').textContent   = title;
    document.getElementById('modalBody').innerHTML      = bodyHtml;
    document.getElementById('modalConfirm').textContent = confirmLabel;
    document.getElementById('modalBackdrop').classList.add('open');
    modalCallback = confirmCallback;

    /* Focus first input */
    setTimeout(() => {
      const first = document.getElementById('modalBody').querySelector('input, select, textarea');
      if (first) first.focus();
    }, 100);
  }

  function closeModal() {
    document.getElementById('modalBackdrop').classList.remove('open');
    modalCallback = null;
  }

  /* ── Toast ───────────────────────────── */
  function toast(message, type = 'success') {
    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
    const icon  = icons[type] || icons.info;

    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `
      <span class="toast-icon"><i class="fas ${icon}"></i></span>
      <span>${message}</span>
      <span class="toast-dismiss" onclick="this.parentElement.remove()">✕</span>`;

    document.getElementById('toastContainer').appendChild(el);

    setTimeout(() => {
      el.classList.add('hiding');
      setTimeout(() => el.remove(), 350);
    }, 3500);
  }

  /* ── Badges (nav count indicators) ─── */
  function updateBadges() {
    const counts = {
      skills:   dbGet(DB_KEYS.skills).filter(s  => s.status === 'in-progress').length,
      courses:  dbGet(DB_KEYS.courses).filter(c  => c.status === 'in-progress').length,
      goals:    dbGet(DB_KEYS.goals).filter(g    => g.progress < 100).length,
      projects: dbGet(DB_KEYS.projects).filter(p => p.status === 'in-progress').length,
    };

    Object.entries(counts).forEach(([page, count]) => {
      const badge = document.getElementById(`badge-${page}`);
      if (badge) {
        if (count > 0) {
          badge.textContent = count;
          badge.classList.add('show');
        } else {
          badge.classList.remove('show');
        }
      }
    });
  }

  /* ── Profile ─────────────────────────── */
  function setupProfile() {
    const profile  = dbGetObj(DB_KEYS.profile);

    updateProfileUI(profile);

    document.getElementById('profileEditBtn').addEventListener('click', openProfileModal);
    document.getElementById('profileModalClose').addEventListener('click',  closeProfileModal);
    document.getElementById('profileModalCancel').addEventListener('click', closeProfileModal);
    document.getElementById('profileModalSave').addEventListener('click',   saveProfile);
    document.getElementById('profileModalBackdrop').addEventListener('click', e => {
      if (e.target === document.getElementById('profileModalBackdrop')) closeProfileModal();
    });
  }

  function updateProfileUI(profile) {
    const name = profile.name || 'Student';
    document.getElementById('profileName').textContent = name;
    document.getElementById('profileRole').textContent = profile.role || 'CS Undergraduate';
    document.getElementById('profileAvatar').textContent = name.charAt(0).toUpperCase();
  }

  function openProfileModal() {
    const profile = dbGetObj(DB_KEYS.profile);
    document.getElementById('pf-name').value        = profile.name        || '';
    document.getElementById('pf-role').value        = profile.role        || '';
    document.getElementById('pf-institution').value = profile.institution || '';
    document.getElementById('pf-target').value      = profile.target      || '';
    document.getElementById('profileModalBackdrop').classList.add('open');
  }

  function closeProfileModal() {
    document.getElementById('profileModalBackdrop').classList.remove('open');
  }

  function saveProfile() {
    const profile = {
      name:        document.getElementById('pf-name').value.trim(),
      role:        document.getElementById('pf-role').value.trim(),
      institution: document.getElementById('pf-institution').value.trim(),
      target:      document.getElementById('pf-target').value,
    };
    dbSetObj(DB_KEYS.profile, profile);
    updateProfileUI(profile);
    closeProfileModal();
    toast('Profile updated!', 'success');
  }

  /* ── Global Search ──────────────────── */
  function setupSearch() {
    const input = document.getElementById('globalSearch');
    if (!input) return;

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const q = input.value.trim().toLowerCase();
        if (!q) return;
        performSearch(q);
      }
    });
  }

  function performSearch(q) {
    /* Search across skills, courses, projects */
    const skillHit   = dbGet(DB_KEYS.skills).find(s   => s.name.toLowerCase().includes(q));
    const courseHit  = dbGet(DB_KEYS.courses).find(c  => c.name.toLowerCase().includes(q));
    const projectHit = dbGet(DB_KEYS.projects).find(p => p.name.toLowerCase().includes(q));

    if (skillHit)   { navigate('skills');   toast(`Found skill: ${skillHit.name}`, 'info');   return; }
    if (courseHit)  { navigate('courses');  toast(`Found course: ${courseHit.name}`, 'info');  return; }
    if (projectHit) { navigate('projects'); toast(`Found project: ${projectHit.name}`, 'info'); return; }

    toast(`No results for "${q}"`, 'warning');
  }

  /* ── Public API ──────────────────────── */
  return { init, navigate, openModal, closeModal, toast, updateBadges };
})();

/* ── Shared Utilities ────────────────────── */
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#039;');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return dateStr; }
}

function animateProgressBars() {
  document.querySelectorAll('.progress-fill[data-width]').forEach(el => {
    el.style.width = el.dataset.width;
  });
}

/* ── Bootstrap ───────────────────────────── */
document.addEventListener('DOMContentLoaded', () => App.init());
