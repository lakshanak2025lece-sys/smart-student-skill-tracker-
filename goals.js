/* ══════════════════════════════════════════
   goals.js — Learning Goals UI
══════════════════════════════════════════ */

function renderGoals() {
  const goals  = dbGet(DB_KEYS.goals);
  const skills = dbGet(DB_KEYS.skills);

  const activeGoals    = goals.filter(g => g.progress < 100);
  const completedGoals = goals.filter(g => g.progress >= 100);

  const html = `
  <div class="page-view">
    <div class="section-header">
      <div>
        <h1 class="section-title">Learning Goals</h1>
        <div class="section-subtitle">Set milestones, track progress, and stay motivated on your learning journey</div>
      </div>
      <button class="btn btn-primary" id="addGoalBtn">
        <i class="fas fa-plus"></i> Add Goal
      </button>
    </div>

    <!-- Summary -->
    <div class="stat-cards" style="margin-bottom:24px">
      <div class="stat-card variant-purple">
        <div class="stat-top"><div class="stat-icon purple"><i class="fas fa-bullseye"></i></div></div>
        <div class="stat-number">${goals.length}</div>
        <div class="stat-label">Total Goals</div>
      </div>
      <div class="stat-card variant-warning">
        <div class="stat-top"><div class="stat-icon warning"><i class="fas fa-fire"></i></div></div>
        <div class="stat-number">${activeGoals.length}</div>
        <div class="stat-label">Active</div>
      </div>
      <div class="stat-card variant-success">
        <div class="stat-top"><div class="stat-icon success"><i class="fas fa-trophy"></i></div></div>
        <div class="stat-number">${completedGoals.length}</div>
        <div class="stat-label">Achieved</div>
      </div>
      <div class="stat-card variant-info">
        <div class="stat-top"><div class="stat-icon info"><i class="fas fa-percent"></i></div></div>
        <div class="stat-number">${goals.length ? Math.round(goals.reduce((s,g) => s + g.progress, 0) / goals.length) : 0}%</div>
        <div class="stat-label">Avg Progress</div>
      </div>
    </div>

    ${activeGoals.length > 0 ? `
    <div style="font-size:14px;font-weight:700;color:var(--text-secondary);margin-bottom:14px;text-transform:uppercase;letter-spacing:1px">
      🔥 Active Goals
    </div>
    <div class="goals-grid" id="activeGoalsGrid">
      ${activeGoals.map(g => renderGoalCard(g)).join('')}
    </div>` : ''}

    ${completedGoals.length > 0 ? `
    <div style="font-size:14px;font-weight:700;color:var(--text-secondary);margin:24px 0 14px;text-transform:uppercase;letter-spacing:1px">
      🏆 Achieved Goals
    </div>
    <div class="goals-grid" id="completedGoalsGrid">
      ${completedGoals.map(g => renderGoalCard(g, true)).join('')}
    </div>` : ''}

    ${goals.length === 0 ? `
    <div class="empty-state">
      <div class="empty-icon">🎯</div>
      <div class="empty-title">No goals set</div>
      <div class="empty-desc">Setting clear learning goals helps you stay focused and motivated. Add your first goal!</div>
      <button class="btn btn-primary" onclick="document.getElementById('addGoalBtn').click()"><i class="fas fa-plus"></i> Set First Goal</button>
    </div>` : ''}
  </div>`;

  document.getElementById('mainContent').innerHTML = html;
  document.getElementById('addGoalBtn').addEventListener('click', () => openGoalModal());

  /* Animate rings */
  setTimeout(() => animateGoalRings(), 200);
}

function renderGoalCard(g, completed = false) {
  const pct         = Math.min(100, g.progress || 0);
  const deadline    = g.deadline ? new Date(g.deadline) : null;
  const today       = new Date();
  const daysLeft    = deadline ? Math.ceil((deadline - today) / (1000 * 60 * 60 * 24)) : null;
  const isOverdue   = deadline && daysLeft < 0;
  const isDueSoon   = deadline && daysLeft >= 0 && daysLeft <= 14;

  let deadlineClass = 'ok';
  let deadlineText  = '';
  if (deadline) {
    if (isOverdue)       { deadlineClass = 'overdue';  deadlineText = `${Math.abs(daysLeft)}d overdue`; }
    else if (isDueSoon)  { deadlineClass = 'due-soon'; deadlineText = `${daysLeft}d left`; }
    else                 { deadlineClass = 'ok';        deadlineText = `${daysLeft}d left`; }
  }

  /* SVG ring */
  const radius = 27;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const ringColor = completed ? '#10b981' : pct >= 75 ? '#10b981' : pct >= 40 ? '#7c3aed' : '#f59e0b';

  return `
  <div class="goal-card ${completed ? 'opacity-70' : ''}" data-id="${g.id}" ${completed ? 'style="opacity:0.75"' : ''}>
    <div class="goal-card-top">
      <div>
        <div class="goal-title">${escHtml(g.title)}</div>
        ${g.skill ? `<div class="goal-skill"><i class="fas fa-brain" style="font-size:10px"></i> ${escHtml(g.skill)}</div>` : ''}
      </div>
      <div style="display:flex;gap:4px">
        <button class="skill-action-btn" title="Edit" onclick="openGoalModal('${g.id}')"><i class="fas fa-pen"></i></button>
        <button class="skill-action-btn danger" title="Delete" onclick="deleteGoal('${g.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>

    <div class="goal-ring-wrap">
      <div class="ring-container">
        <svg class="ring-svg" width="68" height="68" viewBox="0 0 68 68">
          <circle class="ring-track" cx="34" cy="34" r="${radius}"/>
          <circle class="ring-fill"
            cx="34" cy="34" r="${radius}"
            stroke="${ringColor}"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${circumference}"
            data-offset="${offset}"
            style="stroke-dashoffset:${circumference}"
          />
        </svg>
        <div class="ring-label">${pct}%</div>
      </div>
      <div class="ring-info">
        <div class="ring-pct">${pct === 100 ? '🏆 Done!' : `${pct}% complete`}</div>
        ${deadline ? `<div class="goal-deadline ${deadlineClass}">
          <i class="fas fa-calendar-alt"></i> ${formatDate(g.deadline)}
          ${deadlineText ? `<span>(${deadlineText})</span>` : ''}
        </div>` : '<div class="ring-desc text-muted">No deadline set</div>'}
      </div>
    </div>

    <div>
      <div class="progress-wrap">
        <div class="progress-label">
          <span>Progress</span>
          <span style="font-weight:700">${pct}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:0%;background:${ringColor}" data-width="${pct}%"></div>
        </div>
      </div>
    </div>

    ${g.notes ? `<div style="font-size:12px;color:var(--text-muted);font-style:italic;border-left:2px solid var(--border);padding-left:10px">${escHtml(g.notes)}</div>` : ''}

    <!-- Progress update -->
    <div style="display:flex;align-items:center;gap:10px;margin-top:4px">
      <input type="range" class="form-range" min="0" max="100" step="5"
        value="${pct}"
        oninput="updateGoalProgress('${g.id}', this.value, this)"
        style="flex:1"
      />
      <span class="badge badge-muted" id="goalPct_${g.id}">${pct}%</span>
    </div>
  </div>`;
}

function animateGoalRings() {
  document.querySelectorAll('.ring-fill[data-offset]').forEach(el => {
    const offset = parseFloat(el.dataset.offset);
    el.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)';
    el.style.strokeDashoffset = offset;
  });
  document.querySelectorAll('.progress-fill[data-width]').forEach(el => {
    el.style.width = el.dataset.width;
  });
}

function updateGoalProgress(id, value, el) {
  const pct = parseInt(value);
  dbUpdate(DB_KEYS.goals, id, { progress: pct });

  /* Live update label */
  const label = document.getElementById(`goalPct_${id}`);
  if (label) label.textContent = pct + '%';

  /* Debounce re-render */
  clearTimeout(el._timer);
  el._timer = setTimeout(() => { renderGoals(); }, 600);
}

/* ── Goal Modal ──────────────────────────── */
function openGoalModal(id = null) {
  const existing = id ? dbFindById(DB_KEYS.goals, id) : null;
  const skills   = dbGet(DB_KEYS.skills);

  const bodyHtml = `
  <form class="form-grid" id="goalForm">
    <div class="form-group">
      <label class="form-label">Goal Title *</label>
      <input type="text" id="gf-title" class="form-input" placeholder="e.g. Master React.js, Get AWS Certified" value="${existing ? escHtml(existing.title) : ''}" required />
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Related Skill</label>
        <select id="gf-skill" class="form-select">
          <option value="">None</option>
          ${skills.map(s => `<option value="${escHtml(s.name)}" ${existing && existing.skill === s.name ? 'selected' : ''}>${escHtml(s.name)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Deadline</label>
        <input type="date" id="gf-deadline" class="form-input" value="${existing ? existing.deadline : ''}" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Initial Progress: <span id="gf-pctLabel">${existing ? existing.progress : 0}%</span></label>
      <input type="range" id="gf-progress" class="form-range" min="0" max="100" step="5" value="${existing ? existing.progress : 0}" />
    </div>
    <div class="form-group">
      <label class="form-label">Notes / Plan</label>
      <textarea id="gf-notes" class="form-textarea" placeholder="How do you plan to achieve this goal?">${existing ? escHtml(existing.notes) : ''}</textarea>
    </div>
  </form>`;

  App.openModal(existing ? 'Edit Goal' : 'Set New Goal', bodyHtml, () => saveGoal(id));

  setTimeout(() => {
    const range = document.getElementById('gf-progress');
    if (range) {
      range.addEventListener('input', () => {
        document.getElementById('gf-pctLabel').textContent = range.value + '%';
      });
    }
  }, 50);
}

function saveGoal(id) {
  const title    = document.getElementById('gf-title').value.trim();
  const skill    = document.getElementById('gf-skill').value;
  const deadline = document.getElementById('gf-deadline').value;
  const progress = parseInt(document.getElementById('gf-progress').value);
  const notes    = document.getElementById('gf-notes').value.trim();

  if (!title) { App.toast('Please enter a goal title.', 'warning'); return false; }

  if (id) {
    dbUpdate(DB_KEYS.goals, id, { title, skill, deadline, progress, notes });
    logActivity(`Updated goal <strong>${escHtml(title)}</strong>`, '#7c3aed');
    App.toast('Goal updated!', 'success');
  } else {
    const goal = { id: genId('go'), title, skill, deadline, progress, notes };
    dbAdd(DB_KEYS.goals, goal);
    logActivity(`Set new goal <strong>${escHtml(title)}</strong>`, '#7c3aed');
    App.toast('Goal set! 🎯', 'success');
  }

  App.closeModal();
  renderGoals();
}

function deleteGoal(id) {
  const g = dbFindById(DB_KEYS.goals, id);
  if (!g) return;
  if (!confirm(`Delete goal "${g.title}"?`)) return;
  dbDelete(DB_KEYS.goals, id);
  App.toast('Goal removed.', 'info');
  renderGoals();
}
