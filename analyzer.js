/* ══════════════════════════════════════════
   analyzer.js — Skill Gap Analyzer
══════════════════════════════════════════ */

let selectedRole = '';

function renderAnalyzer() {
  const html = `
  <div class="page-view">
    <div class="section-header">
      <div>
        <h1 class="section-title">Skill Gap Analyzer</h1>
        <div class="section-subtitle">Find out what skills you need for your dream role</div>
      </div>
    </div>

    <!-- Hero -->
    <div class="analyzer-hero">
      <h2>Analyze Your Skill Gap</h2>
      <p>Select your target job role below. We'll compare it against your tracked skills and show exactly what you're missing — and where to learn it.</p>
      <div class="role-select-row" id="roleSelectRow">
        ${Object.entries(ROLE_SKILLS).map(([key, r]) => `
          <button class="role-btn ${selectedRole === key ? 'active' : ''}" data-role="${key}" onclick="runAnalysis('${key}')">
            ${getRoleIcon(key)} ${r.label}
          </button>
        `).join('')}
      </div>
    </div>

    <!-- Results -->
    <div class="analyzer-results ${selectedRole ? 'visible' : ''}" id="analyzerResults">
      ${selectedRole ? buildAnalysisHTML(selectedRole) : ''}
    </div>
  </div>`;

  document.getElementById('mainContent').innerHTML = html;
}

function runAnalysis(role) {
  selectedRole = role;

  /* Update active button */
  document.querySelectorAll('.role-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.role === role);
  });

  /* Build + show results */
  const resultsEl = document.getElementById('analyzerResults');
  resultsEl.classList.add('visible');
  resultsEl.innerHTML = buildAnalysisHTML(role);

  /* Animate bars */
  setTimeout(() => {
    document.querySelectorAll('[data-width]').forEach(el => { el.style.width = el.dataset.width; });
  }, 200);
}

function buildAnalysisHTML(role) {
  const roleDef    = ROLE_SKILLS[role];
  if (!roleDef) return '';

  const mySkills   = dbGet(DB_KEYS.skills).map(s => s.name.toLowerCase());
  const required   = roleDef.required;

  const have    = required.filter(r => mySkills.includes(r.toLowerCase()));
  const missing = required.filter(r => !mySkills.includes(r.toLowerCase()));

  const matchPct = Math.round((have.length / required.length) * 100);

  /* Which resources to show */
  const resourceItems = missing.slice(0, 6).flatMap(skill => {
    const res = getResources(skill);
    return res.map(r => ({ skill, ...r }));
  });

  return `
  <!-- Match score -->
  <div class="card" style="margin-bottom:20px;background:linear-gradient(135deg,rgba(124,58,237,0.1),rgba(6,182,212,0.07));border-color:rgba(124,58,237,0.2)">
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px">
      <div>
        <div style="font-size:14px;color:var(--text-muted);margin-bottom:4px">Your match score for</div>
        <div style="font-size:22px;font-weight:800;color:var(--text-primary)">${getRoleIcon(role)} ${roleDef.label}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:48px;font-weight:900;line-height:1" class="text-gradient">${matchPct}%</div>
        <div style="font-size:13px;color:var(--text-secondary)">${getMatchLabel(matchPct)}</div>
      </div>
    </div>
    <div style="margin-top:16px">
      <div class="progress-bar" style="height:10px">
        <div class="progress-fill" style="width:0%;height:10px" data-width="${matchPct}%"></div>
      </div>
    </div>
    <div style="display:flex;gap:16px;margin-top:14px;font-size:13px">
      <span style="color:var(--success)"><i class="fas fa-check-circle"></i> <strong>${have.length}</strong> skills matched</span>
      <span style="color:var(--danger)"><i class="fas fa-times-circle"></i> <strong>${missing.length}</strong> skills missing</span>
      <span style="color:var(--text-muted)"><i class="fas fa-list"></i> <strong>${required.length}</strong> total required</span>
    </div>
  </div>

  <!-- Skill grid -->
  <div class="skill-gap-grid">
    <!-- Skills You Have -->
    <div class="card">
      <div class="skill-gap-col-title" style="color:var(--success)">
        <i class="fas fa-check-circle"></i> Skills You Have (${have.length})
      </div>
      ${have.length === 0
        ? `<div style="font-size:13px;color:var(--text-muted)">None of the required skills found yet. Start learning!</div>`
        : have.map(skill => `
          <div class="gap-skill-item have">
            <span class="gap-skill-icon"><i class="fas fa-check-circle"></i></span>
            <span>${escHtml(skill)}</span>
          </div>`).join('')}
    </div>

    <!-- Missing Skills -->
    <div class="card">
      <div class="skill-gap-col-title" style="color:var(--danger)">
        <i class="fas fa-times-circle"></i> Skills to Learn (${missing.length})
      </div>
      ${missing.length === 0
        ? `<div style="font-size:13px;color:var(--success)">🎉 You have all required skills! You're job-ready!</div>`
        : missing.map(skill => `
          <div class="gap-skill-item missing">
            <span class="gap-skill-icon"><i class="fas fa-times-circle"></i></span>
            <span>${escHtml(skill)}</span>
          </div>`).join('')}
    </div>
  </div>

  <!-- Resources Section -->
  ${resourceItems.length > 0 ? `
  <div class="resources-section">
    <div class="card-title" style="font-size:17px;font-weight:800;color:var(--text-primary);margin-bottom:16px">
      📚 Recommended Learning Resources
    </div>
    ${resourceItems.map(r => `
      <div class="resource-card">
        <div class="resource-icon" style="background:${r.color}22;color:${r.color};font-size:20px">
          ${r.icon}
        </div>
        <div class="resource-info">
          <div class="resource-title">${escHtml(r.title)}</div>
          <div class="resource-platform">
            <span class="tag" style="font-size:10px">${escHtml(r.skill)}</span>
            &nbsp;•&nbsp; ${escHtml(r.platform)}
          </div>
        </div>
        <a href="${r.url}" target="_blank" rel="noopener" class="resource-link">
          Enroll <i class="fas fa-external-link-alt" style="font-size:10px"></i>
        </a>
      </div>`).join('')}
  </div>` : ''}

  <!-- Action -->
  <div style="margin-top:24px;text-align:center">
    <button class="btn btn-primary" onclick="App.navigate('skills')">
      <i class="fas fa-brain"></i> Go to Skills Tracker
    </button>
    <button class="btn btn-ghost" style="margin-left:10px" onclick="App.navigate('goals')">
      <i class="fas fa-bullseye"></i> Set Learning Goals
    </button>
  </div>`;
}

function getRoleIcon(role) {
  const icons = {
    frontend: '🎨', backend: '⚙️', fullstack: '🔧',
    'data-scientist': '📊', 'ml-engineer': '🤖',
    devops: '☁️', mobile: '📱', cybersecurity: '🔐',
  };
  return icons[role] || '💼';
}

function getMatchLabel(pct) {
  if (pct >= 80) return '🚀 Highly job-ready!';
  if (pct >= 60) return '✅ Getting close — keep it up!';
  if (pct >= 40) return '📈 Good start — keep learning!';
  if (pct >= 20) return '🌱 Early stage — lots to learn!';
  return '🔎 Just starting — great opportunity ahead!';
}
