/* ══════════════════════════════════════════
   projects.js — Projects Portfolio UI
══════════════════════════════════════════ */

function renderProjects() {
  const projects = dbGet(DB_KEYS.projects);

  const html = `
  <div class="page-view">
    <div class="section-header">
      <div>
        <h1 class="section-title">Projects Portfolio</h1>
        <div class="section-subtitle">Showcase the projects you've built and what you've learned</div>
      </div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <select class="filter-select" id="projStatusFilter">
          <option value="">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="in-progress">In Progress</option>
          <option value="planned">Planned</option>
        </select>
        <button class="btn btn-primary" id="addProjectBtn">
          <i class="fas fa-plus"></i> Add Project
        </button>
      </div>
    </div>

    <!-- Summary -->
    <div class="stat-cards" style="margin-bottom:24px">
      <div class="stat-card variant-purple">
        <div class="stat-top"><div class="stat-icon purple"><i class="fas fa-code-branch"></i></div></div>
        <div class="stat-number">${projects.length}</div>
        <div class="stat-label">Total Projects</div>
      </div>
      <div class="stat-card variant-success">
        <div class="stat-top"><div class="stat-icon success"><i class="fas fa-check-double"></i></div></div>
        <div class="stat-number">${projects.filter(p => p.status === 'completed').length}</div>
        <div class="stat-label">Completed</div>
      </div>
      <div class="stat-card variant-warning">
        <div class="stat-top"><div class="stat-icon warning"><i class="fas fa-hammer"></i></div></div>
        <div class="stat-number">${projects.filter(p => p.status === 'in-progress').length}</div>
        <div class="stat-label">In Progress</div>
      </div>
      <div class="stat-card variant-info">
        <div class="stat-top"><div class="stat-icon info"><i class="fas fa-lightbulb"></i></div></div>
        <div class="stat-number">${projects.filter(p => p.status === 'planned').length}</div>
        <div class="stat-label">Planned</div>
      </div>
    </div>

    <div class="projects-grid" id="projectsGrid">
      ${renderProjectCards(projects)}
    </div>
  </div>`;

  document.getElementById('mainContent').innerHTML = html;
  document.getElementById('addProjectBtn').addEventListener('click', () => openProjectModal());
  document.getElementById('projStatusFilter').addEventListener('change', filterProjects);
}

function renderProjectCards(projects) {
  if (projects.length === 0) {
    return `<div class="empty-state">
      <div class="empty-icon">💻</div>
      <div class="empty-title">No projects yet</div>
      <div class="empty-desc">Projects are the best way to demonstrate your skills. Add your first one!</div>
      <button class="btn btn-primary" onclick="openProjectModal()"><i class="fas fa-plus"></i> Add Project</button>
    </div>`;
  }
  return projects.map(p => renderProjectCard(p)).join('');
}

function renderProjectCard(p) {
  const sc = getStatusConfig(p.status);
  const statusColors = {
    'completed':   'var(--success)',
    'in-progress': 'var(--warning)',
    'planned':     'var(--info)',
  };
  const accentColor = statusColors[p.status] || 'var(--accent-from)';

  const techTags = (p.techStack || []).map(t =>
    `<span class="tag">${escHtml(t)}</span>`
  ).join('');

  return `
  <div class="project-card" data-id="${p.id}" style="border-top:3px solid ${accentColor}">
    <div class="project-card-top">
      <div class="project-name">${escHtml(p.name)}</div>
      <div style="display:flex;gap:4px">
        <button class="skill-action-btn" title="Edit" onclick="openProjectModal('${p.id}')"><i class="fas fa-pen"></i></button>
        <button class="skill-action-btn danger" title="Delete" onclick="deleteProject('${p.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>
    <div class="project-desc">${escHtml(p.desc || '')}</div>
    <div class="project-tech-stack">${techTags}</div>
    <div class="project-footer">
      <span class="badge ${sc.class}"><i class="fas ${sc.icon}"></i> ${sc.label}</span>
      <div style="display:flex;align-items:center;gap:10px">
        ${p.githubUrl ? `<a href="${p.githubUrl}" target="_blank" rel="noopener" class="project-link">
          <i class="fab fa-github"></i> GitHub
        </a>` : ''}
        <span style="font-size:11px;color:var(--text-muted)">${formatDate(p.createdAt)}</span>
      </div>
    </div>
  </div>`;
}

function filterProjects() {
  const status   = document.getElementById('projStatusFilter').value;
  let   projects = dbGet(DB_KEYS.projects);
  if (status) projects = projects.filter(p => p.status === status);
  document.getElementById('projectsGrid').innerHTML = renderProjectCards(projects);
}

/* ── Project Modal ───────────────────────── */
function openProjectModal(id = null) {
  const existing = id ? dbFindById(DB_KEYS.projects, id) : null;

  const bodyHtml = `
  <form class="form-grid" id="projectForm">
    <div class="form-group">
      <label class="form-label">Project Name *</label>
      <input type="text" id="pj-name" class="form-input" placeholder="e.g. Weather Dashboard App" value="${existing ? escHtml(existing.name) : ''}" required />
    </div>
    <div class="form-group">
      <label class="form-label">Description</label>
      <textarea id="pj-desc" class="form-textarea" placeholder="Brief description of the project, what it does and what you learned...">${existing ? escHtml(existing.desc) : ''}</textarea>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Status</label>
        <select id="pj-status" class="form-select">
          <option value="planned"     ${existing && existing.status === 'planned'     ? 'selected' : ''}>Planned</option>
          <option value="in-progress" ${existing && existing.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
          <option value="completed"   ${existing && existing.status === 'completed'   ? 'selected' : ''}>Completed</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">GitHub URL</label>
        <input type="url" id="pj-github" class="form-input" placeholder="https://github.com/..." value="${existing ? existing.githubUrl : ''}" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Tech Stack <span class="form-hint">(comma-separated)</span></label>
      <input type="text" id="pj-tech" class="form-input" placeholder="e.g. React, Node.js, MongoDB, CSS" value="${existing ? (existing.techStack || []).join(', ') : ''}" />
    </div>
  </form>`;

  App.openModal(existing ? 'Edit Project' : 'Add Project', bodyHtml, () => saveProject(id));
}

function saveProject(id) {
  const name      = document.getElementById('pj-name').value.trim();
  const desc      = document.getElementById('pj-desc').value.trim();
  const status    = document.getElementById('pj-status').value;
  const githubUrl = document.getElementById('pj-github').value.trim();
  const techRaw   = document.getElementById('pj-tech').value.trim();
  const techStack = techRaw ? techRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

  if (!name) { App.toast('Please enter a project name.', 'warning'); return false; }

  if (id) {
    dbUpdate(DB_KEYS.projects, id, { name, desc, status, githubUrl, techStack });
    logActivity(`Updated project <strong>${escHtml(name)}</strong>`, '#06b6d4');
    App.toast('Project updated!', 'success');
  } else {
    const project = { id: genId('pr'), name, desc, status, githubUrl, techStack, createdAt: new Date().toISOString().slice(0,10) };
    dbAdd(DB_KEYS.projects, project);
    logActivity(`Created project <strong>${escHtml(name)}</strong>`, '#06b6d4');
    App.toast('Project added!', 'success');
  }

  App.closeModal();
  renderProjects();
}

function deleteProject(id) {
  const p = dbFindById(DB_KEYS.projects, id);
  if (!p) return;
  if (!confirm(`Delete project "${p.name}"?`)) return;
  dbDelete(DB_KEYS.projects, id);
  App.toast('Project removed.', 'info');
  renderProjects();
}
