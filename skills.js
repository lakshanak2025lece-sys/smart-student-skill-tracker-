/* ══════════════════════════════════════════
   skills.js — Skills CRUD + UI
══════════════════════════════════════════ */

function renderSkills() {
  const skills = dbGet(DB_KEYS.skills);

  const html = `
  <div class="page-view">
    <div class="section-header">
      <div>
        <h1 class="section-title">My Skills</h1>
        <div class="section-subtitle">Track your technical skills and proficiency levels</div>
      </div>
      <div class="skills-controls">
        <select class="filter-select" id="skillCatFilter">
          <option value="">All Categories</option>
          ${[...new Set(skills.map(s => s.category))].map(c => `<option value="${c}">${c}</option>`).join('')}
          <option value="Frontend">Frontend</option>
          <option value="Backend">Backend</option>
          <option value="Database">Database</option>
          <option value="DevOps">DevOps</option>
          <option value="AI/ML">AI/ML</option>
          <option value="Mobile">Mobile</option>
          <option value="Tools">Tools</option>
          <option value="Security">Security</option>
        </select>
        <select class="filter-select" id="skillStatusFilter">
          <option value="">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="in-progress">In Progress</option>
          <option value="to-learn">To Learn</option>
        </select>
        <button class="btn btn-primary" id="addSkillBtn">
          <i class="fas fa-plus"></i> Add Skill
        </button>
      </div>
    </div>

    <!-- Summary row -->
    <div class="stat-cards" style="margin-bottom:24px">
      <div class="stat-card variant-purple">
        <div class="stat-top">
          <div class="stat-icon purple"><i class="fas fa-check-double"></i></div>
        </div>
        <div class="stat-number">${skills.filter(s => s.status === 'completed').length}</div>
        <div class="stat-label">Completed</div>
      </div>
      <div class="stat-card variant-warning">
        <div class="stat-top">
          <div class="stat-icon warning"><i class="fas fa-spinner"></i></div>
        </div>
        <div class="stat-number">${skills.filter(s => s.status === 'in-progress').length}</div>
        <div class="stat-label">In Progress</div>
      </div>
      <div class="stat-card variant-info">
        <div class="stat-top">
          <div class="stat-icon info"><i class="fas fa-bookmark"></i></div>
        </div>
        <div class="stat-number">${skills.filter(s => s.status === 'to-learn').length}</div>
        <div class="stat-label">To Learn</div>
      </div>
      <div class="stat-card variant-success">
        <div class="stat-top">
          <div class="stat-icon success"><i class="fas fa-layer-group"></i></div>
        </div>
        <div class="stat-number">${[...new Set(skills.map(s => s.category))].length}</div>
        <div class="stat-label">Categories</div>
      </div>
    </div>

    <div class="skills-grid" id="skillsGrid">
      ${renderSkillCards(skills)}
    </div>
  </div>`;

  document.getElementById('mainContent').innerHTML = html;

  document.getElementById('addSkillBtn').addEventListener('click', () => openSkillModal());
  document.getElementById('skillCatFilter').addEventListener('change', filterSkills);
  document.getElementById('skillStatusFilter').addEventListener('change', filterSkills);
  bindSkillCardEvents();
}

function renderSkillCards(skills) {
  if (skills.length === 0) {
    return `<div class="empty-state">
      <div class="empty-icon">🧠</div>
      <div class="empty-title">No skills yet</div>
      <div class="empty-desc">Start by adding your first technical skill to begin tracking your progress.</div>
      <button class="btn btn-primary" onclick="openSkillModal()"><i class="fas fa-plus"></i> Add Your First Skill</button>
    </div>`;
  }
  return skills.map(s => renderSkillCard(s)).join('');
}

function renderSkillCard(s) {
  const sc       = getStatusConfig(s.status);
  const catColor = getCategoryColor(s.category);
  const stars    = renderStars(s.level);
  const pct      = (s.level / 5) * 100;

  return `
  <div class="skill-card" data-id="${s.id}">
    <div class="skill-card-top">
      <div>
        <div class="skill-name">${escHtml(s.name)}</div>
        <div class="skill-category">${escHtml(s.category)}</div>
      </div>
      <div class="skill-actions">
        <button class="skill-action-btn" title="Edit" onclick="openSkillModal('${s.id}')">
          <i class="fas fa-pen"></i>
        </button>
        <button class="skill-action-btn danger" title="Delete" onclick="deleteSkill('${s.id}')">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
    <div class="skill-level-stars">${stars}</div>
    <div class="progress-wrap">
      <div class="progress-label">
        <span>${getLevelLabel(s.level)}</span>
        <span>${s.level}/5</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width:0%;background:linear-gradient(90deg,${catColor}99,${catColor})" data-width="${pct}%"></div>
      </div>
    </div>
    <div class="skill-status-row">
      <span class="badge ${sc.class}">
        <i class="fas ${sc.icon}"></i> ${sc.label}
      </span>
      <span style="font-size:11px;color:var(--text-muted)">${formatDate(s.createdAt)}</span>
    </div>
  </div>`;
}

function renderStars(level) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<i class="fas fa-star star ${i <= level ? 'filled' : ''}"></i>`;
  }
  return html;
}

function filterSkills() {
  const cat    = document.getElementById('skillCatFilter').value;
  const status = document.getElementById('skillStatusFilter').value;
  let   skills = dbGet(DB_KEYS.skills);

  if (cat)    skills = skills.filter(s => s.category === cat);
  if (status) skills = skills.filter(s => s.status   === status);

  document.getElementById('skillsGrid').innerHTML = renderSkillCards(skills);
  setTimeout(() => animateProgressBars(), 150);
  bindSkillCardEvents();
}

function bindSkillCardEvents() {
  setTimeout(() => animateProgressBars(), 150);
}

function animateProgressBars() {
  document.querySelectorAll('.progress-fill[data-width]').forEach(el => {
    el.style.width = el.dataset.width;
  });
}

/* ── Skill Modal ─────────────────────────── */
function openSkillModal(id = null) {
  const existing = id ? dbFindById(DB_KEYS.skills, id) : null;
  const title    = existing ? 'Edit Skill' : 'Add New Skill';

  const categories = ['Frontend','Backend','Database','DevOps','AI/ML','Mobile','Tools','Security','Other'];

  const bodyHtml = `
  <form class="form-grid" id="skillForm">
    <div class="form-group">
      <label class="form-label">Skill Name *</label>
      <input type="text" id="sf-name" class="form-input" placeholder="e.g. React.js, Python, Docker" value="${existing ? escHtml(existing.name) : ''}" required />
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Category *</label>
        <select id="sf-category" class="form-select">
          ${categories.map(c => `<option value="${c}" ${existing && existing.category === c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Status</label>
        <select id="sf-status" class="form-select">
          <option value="to-learn"    ${existing && existing.status === 'to-learn'    ? 'selected' : ''}>To Learn</option>
          <option value="in-progress" ${existing && existing.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
          <option value="completed"   ${existing && existing.status === 'completed'   ? 'selected' : ''}>Completed</option>
        </select>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Proficiency Level: <span id="sf-levelLabel">${existing ? getLevelLabel(existing.level) : 'Intermediate'}</span></label>
      <input type="range" id="sf-level" class="form-range" min="1" max="5" value="${existing ? existing.level : 3}" />
      <div class="form-hint" style="display:flex;justify-content:space-between">
        <span>Beginner</span><span>Elementary</span><span>Intermediate</span><span>Advanced</span><span>Expert</span>
      </div>
    </div>
  </form>`;

  App.openModal(title, bodyHtml, () => saveSkill(id));

  /* Live label update */
  setTimeout(() => {
    const range = document.getElementById('sf-level');
    if (range) {
      range.addEventListener('input', () => {
        document.getElementById('sf-levelLabel').textContent = getLevelLabel(parseInt(range.value));
      });
    }
  }, 50);
}

function saveSkill(id) {
  const name     = document.getElementById('sf-name').value.trim();
  const category = document.getElementById('sf-category').value;
  const status   = document.getElementById('sf-status').value;
  const level    = parseInt(document.getElementById('sf-level').value);

  if (!name) { App.toast('Please enter a skill name.', 'warning'); return false; }

  if (id) {
    dbUpdate(DB_KEYS.skills, id, { name, category, status, level });
    logActivity(`Updated skill <strong>${escHtml(name)}</strong>`, '#06b6d4');
    App.toast('Skill updated!', 'success');
  } else {
    const skill = { id: genId('sk'), name, category, status, level, createdAt: new Date().toISOString().slice(0,10) };
    dbAdd(DB_KEYS.skills, skill);
    logActivity(`Added skill <strong>${escHtml(name)}</strong>`, '#7c3aed');
    App.toast('Skill added!', 'success');
  }

  App.closeModal();
  renderSkills();
}

function deleteSkill(id) {
  const skill = dbFindById(DB_KEYS.skills, id);
  if (!skill) return;
  if (!confirm(`Delete skill "${skill.name}"? This cannot be undone.`)) return;
  dbDelete(DB_KEYS.skills, id);
  logActivity(`Removed skill <strong>${escHtml(skill.name)}</strong>`, '#ef4444');
  App.toast('Skill deleted.', 'info');
  renderSkills();
}
