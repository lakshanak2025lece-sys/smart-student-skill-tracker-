/* ══════════════════════════════════════════
   courses.js — Courses & Certifications UI
══════════════════════════════════════════ */

let activeCoursesTab = 'courses';

function renderCourses() {
  const courses = dbGet(DB_KEYS.courses);
  const certs   = dbGet(DB_KEYS.certs);

  const html = `
  <div class="page-view">
    <div class="section-header">
      <div>
        <h1 class="section-title">Courses &amp; Certifications</h1>
        <div class="section-subtitle">Log your learning journey — courses, platforms, and earned certifications</div>
      </div>
      <div id="courseAddBtn">
        <button class="btn btn-primary" id="addCourseBtn">
          <i class="fas fa-plus"></i> Add Course
        </button>
      </div>
    </div>

    <!-- Summary -->
    <div class="stat-cards" style="margin-bottom:24px">
      <div class="stat-card variant-purple">
        <div class="stat-top"><div class="stat-icon purple"><i class="fas fa-book-open"></i></div></div>
        <div class="stat-number">${courses.length}</div>
        <div class="stat-label">Total Courses</div>
      </div>
      <div class="stat-card variant-success">
        <div class="stat-top"><div class="stat-icon success"><i class="fas fa-check-circle"></i></div></div>
        <div class="stat-number">${courses.filter(c => c.status === 'completed').length}</div>
        <div class="stat-label">Completed</div>
      </div>
      <div class="stat-card variant-warning">
        <div class="stat-top"><div class="stat-icon warning"><i class="fas fa-certificate"></i></div></div>
        <div class="stat-number">${certs.length}</div>
        <div class="stat-label">Certifications</div>
      </div>
      <div class="stat-card variant-info">
        <div class="stat-top"><div class="stat-icon info"><i class="fas fa-percent"></i></div></div>
        <div class="stat-number">${courses.length ? Math.round(courses.reduce((s,c) => s + c.completion, 0) / courses.length) : 0}%</div>
        <div class="stat-label">Avg Completion</div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button class="tab-btn ${activeCoursesTab === 'courses' ? 'active' : ''}" id="tabCourses" onclick="switchCoursesTab('courses')">
        <i class="fas fa-book-open"></i> Courses (${courses.length})
      </button>
      <button class="tab-btn ${activeCoursesTab === 'certs' ? 'active' : ''}" id="tabCerts" onclick="switchCoursesTab('certs')">
        <i class="fas fa-certificate"></i> Certifications (${certs.length})
      </button>
    </div>

    <div id="courseTabContent"></div>
  </div>`;

  document.getElementById('mainContent').innerHTML = html;
  document.getElementById('addCourseBtn').addEventListener('click', () => {
    if (activeCoursesTab === 'courses') openCourseModal();
    else openCertModal();
  });
  renderCourseTabContent();
}

function switchCoursesTab(tab) {
  activeCoursesTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`).classList.add('active');

  const addBtn = document.getElementById('addCourseBtn');
  if (addBtn) addBtn.innerHTML = `<i class="fas fa-plus"></i> Add ${tab === 'courses' ? 'Course' : 'Certification'}`;

  renderCourseTabContent();
}

function renderCourseTabContent() {
  const container = document.getElementById('courseTabContent');
  if (!container) return;

  if (activeCoursesTab === 'courses') {
    const courses = dbGet(DB_KEYS.courses);
    container.innerHTML = `
      <div class="courses-grid">
        ${courses.length === 0
          ? emptyState('📚', 'No courses yet', 'Start logging your online courses to track your learning journey.', "openCourseModal()")
          : courses.map(c => renderCourseCard(c)).join('')}
      </div>`;
    setTimeout(() => animateProgressBars(), 150);
  } else {
    const certs = dbGet(DB_KEYS.certs);
    container.innerHTML = `
      <div class="courses-grid">
        ${certs.length === 0
          ? emptyState('🏆', 'No certifications yet', 'Add your earned certifications to showcase your verified skills.', "openCertModal()")
          : certs.map(c => renderCertCard(c)).join('')}
      </div>`;
  }
}

function renderCourseCard(c) {
  const sc  = getStatusConfig(c.status);
  const pct = c.completion || 0;
  const fillClass = pct === 100 ? 'success' : pct >= 50 ? '' : 'warning';

  return `
  <div class="course-card" data-id="${c.id}">
    <div class="course-card-top">
      <div>
        <div class="course-name">${escHtml(c.name)}</div>
        <div class="course-platform"><i class="fas fa-graduation-cap" style="color:var(--accent-from);font-size:11px"></i> ${escHtml(c.platform)}</div>
      </div>
      <div class="course-actions">
        <button class="skill-action-btn" title="Edit" onclick="openCourseModal('${c.id}')"><i class="fas fa-pen"></i></button>
        <button class="skill-action-btn danger" title="Delete" onclick="deleteCourse('${c.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
      <span class="badge ${sc.class}"><i class="fas ${sc.icon}"></i> ${sc.label}</span>
      ${c.duration ? `<span class="badge badge-muted"><i class="fas fa-clock"></i> ${escHtml(c.duration)}</span>` : ''}
    </div>
    <div class="progress-wrap">
      <div class="progress-label">
        <span>Progress</span>
        <span style="font-weight:700">${pct}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill ${fillClass}" style="width:0%" data-width="${pct}%"></div>
      </div>
    </div>
    ${c.startDate ? `<div style="font-size:11px;color:var(--text-muted);margin-top:10px">
      <i class="fas fa-calendar-alt"></i> ${formatDate(c.startDate)} ${c.endDate ? '→ ' + formatDate(c.endDate) : '→ Present'}
    </div>` : ''}
  </div>`;
}

function renderCertCard(c) {
  const catColor = getCategoryColor(c.category);

  return `
  <div class="cert-card" data-id="${c.id}">
    <div class="cert-icon-wrap" style="background:linear-gradient(135deg,${catColor}99,${catColor})">
      <i class="fas fa-award"></i>
    </div>
    <div class="cert-info">
      <div class="cert-name">${escHtml(c.name)}</div>
      <div class="cert-issuer"><i class="fas fa-building" style="font-size:10px"></i> ${escHtml(c.issuer)}</div>
      <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <span class="badge badge-success"><i class="fas fa-check-circle"></i> Earned</span>
        <span class="badge badge-muted"><i class="fas fa-calendar"></i> ${formatDate(c.date)}</span>
        ${c.category ? `<span class="tag">${escHtml(c.category)}</span>` : ''}
      </div>
      ${c.credLink ? `<a href="${c.credLink}" target="_blank" rel="noopener" class="project-link" style="margin-top:8px;display:inline-flex">
        <i class="fas fa-external-link-alt"></i> View Credential
      </a>` : ''}
    </div>
    <div class="cert-actions">
      <button class="skill-action-btn" title="Edit" onclick="openCertModal('${c.id}')"><i class="fas fa-pen"></i></button>
      <button class="skill-action-btn danger" title="Delete" onclick="deleteCert('${c.id}')"><i class="fas fa-trash"></i></button>
    </div>
  </div>`;
}

/* ── Course Modal ────────────────────────── */
function openCourseModal(id = null) {
  const existing = id ? dbFindById(DB_KEYS.courses, id) : null;

  const bodyHtml = `
  <form class="form-grid" id="courseForm">
    <div class="form-group">
      <label class="form-label">Course Name *</label>
      <input type="text" id="cf-name" class="form-input" placeholder="e.g. The Web Developer Bootcamp" value="${existing ? escHtml(existing.name) : ''}" required />
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Platform *</label>
        <input type="text" id="cf-platform" class="form-input" placeholder="e.g. Udemy, Coursera" value="${existing ? escHtml(existing.platform) : ''}" />
      </div>
      <div class="form-group">
        <label class="form-label">Duration</label>
        <input type="text" id="cf-duration" class="form-input" placeholder="e.g. 40 hrs" value="${existing ? escHtml(existing.duration) : ''}" />
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Status</label>
        <select id="cf-status" class="form-select">
          <option value="in-progress" ${existing && existing.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
          <option value="completed"   ${existing && existing.status === 'completed'   ? 'selected' : ''}>Completed</option>
          <option value="planned"     ${existing && existing.status === 'planned'     ? 'selected' : ''}>Planned</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Completion %: <span id="cf-pctLabel">${existing ? existing.completion : 0}%</span></label>
        <input type="range" id="cf-completion" class="form-range" min="0" max="100" step="5" value="${existing ? existing.completion : 0}" />
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Start Date</label>
        <input type="date" id="cf-start" class="form-input" value="${existing ? existing.startDate : ''}" />
      </div>
      <div class="form-group">
        <label class="form-label">End Date</label>
        <input type="date" id="cf-end" class="form-input" value="${existing ? existing.endDate : ''}" />
      </div>
    </div>
  </form>`;

  App.openModal(existing ? 'Edit Course' : 'Add Course', bodyHtml, () => saveCourse(id));

  setTimeout(() => {
    const range = document.getElementById('cf-completion');
    if (range) {
      range.addEventListener('input', () => {
        document.getElementById('cf-pctLabel').textContent = range.value + '%';
      });
    }
  }, 50);
}

function saveCourse(id) {
  const name       = document.getElementById('cf-name').value.trim();
  const platform   = document.getElementById('cf-platform').value.trim();
  const duration   = document.getElementById('cf-duration').value.trim();
  const status     = document.getElementById('cf-status').value;
  const completion = parseInt(document.getElementById('cf-completion').value);
  const startDate  = document.getElementById('cf-start').value;
  const endDate    = document.getElementById('cf-end').value;

  if (!name) { App.toast('Please enter a course name.', 'warning'); return false; }

  if (id) {
    dbUpdate(DB_KEYS.courses, id, { name, platform, duration, status, completion, startDate, endDate });
    logActivity(`Updated course <strong>${escHtml(name)}</strong>`, '#06b6d4');
    App.toast('Course updated!', 'success');
  } else {
    const course = { id: genId('co'), name, platform, duration, status, completion, startDate, endDate };
    dbAdd(DB_KEYS.courses, course);
    logActivity(`Added course <strong>${escHtml(name)}</strong>`, '#10b981');
    App.toast('Course added!', 'success');
  }

  App.closeModal();
  renderCourses();
}

function deleteCourse(id) {
  const c = dbFindById(DB_KEYS.courses, id);
  if (!c) return;
  if (!confirm(`Delete course "${c.name}"?`)) return;
  dbDelete(DB_KEYS.courses, id);
  App.toast('Course removed.', 'info');
  renderCourses();
}

/* ── Cert Modal ──────────────────────────── */
function openCertModal(id = null) {
  const existing  = id ? dbFindById(DB_KEYS.certs, id) : null;
  const categories = ['Frontend','Backend','Database','DevOps','AI/ML','Mobile','Tools','Security','Analytics','Cloud','Other'];

  const bodyHtml = `
  <form class="form-grid" id="certForm">
    <div class="form-group">
      <label class="form-label">Certification Name *</label>
      <input type="text" id="cef-name" class="form-input" placeholder="e.g. AWS Solutions Architect" value="${existing ? escHtml(existing.name) : ''}" required />
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Issuing Organization *</label>
        <input type="text" id="cef-issuer" class="form-input" placeholder="e.g. Google, AWS, Coursera" value="${existing ? escHtml(existing.issuer) : ''}" />
      </div>
      <div class="form-group">
        <label class="form-label">Category</label>
        <select id="cef-category" class="form-select">
          ${categories.map(c => `<option value="${c}" ${existing && existing.category === c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Date Earned</label>
        <input type="date" id="cef-date" class="form-input" value="${existing ? existing.date : ''}" />
      </div>
      <div class="form-group">
        <label class="form-label">Credential Link</label>
        <input type="url" id="cef-link" class="form-input" placeholder="https://..." value="${existing ? existing.credLink : ''}" />
      </div>
    </div>
  </form>`;

  App.openModal(existing ? 'Edit Certification' : 'Add Certification', bodyHtml, () => saveCert(id));
}

function saveCert(id) {
  const name     = document.getElementById('cef-name').value.trim();
  const issuer   = document.getElementById('cef-issuer').value.trim();
  const category = document.getElementById('cef-category').value;
  const date     = document.getElementById('cef-date').value;
  const credLink = document.getElementById('cef-link').value.trim();

  if (!name) { App.toast('Please enter a certification name.', 'warning'); return false; }

  if (id) {
    dbUpdate(DB_KEYS.certs, id, { name, issuer, category, date, credLink });
    logActivity(`Updated certification <strong>${escHtml(name)}</strong>`, '#06b6d4');
    App.toast('Certification updated!', 'success');
  } else {
    const cert = { id: genId('ce'), name, issuer, category, date, credLink };
    dbAdd(DB_KEYS.certs, cert);
    logActivity(`Earned certification <strong>${escHtml(name)}</strong>`, '#f59e0b');
    App.toast('Certification added! 🏆', 'success');
  }

  App.closeModal();
  renderCourses();
  switchCoursesTab('certs');
}

function deleteCert(id) {
  const c = dbFindById(DB_KEYS.certs, id);
  if (!c) return;
  if (!confirm(`Delete certification "${c.name}"?`)) return;
  dbDelete(DB_KEYS.certs, id);
  App.toast('Certification removed.', 'info');
  renderCourses();
  switchCoursesTab('certs');
}

/* ── Helpers ─────────────────────────────── */
function emptyState(icon, title, desc, onClick) {
  return `<div class="empty-state" style="grid-column:1/-1">
    <div class="empty-icon">${icon}</div>
    <div class="empty-title">${title}</div>
    <div class="empty-desc">${desc}</div>
    <button class="btn btn-primary" onclick="${onClick}"><i class="fas fa-plus"></i> Add Now</button>
  </div>`;
}
