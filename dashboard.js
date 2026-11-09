/* ══════════════════════════════════════════
   dashboard.js — Dashboard view renderer
══════════════════════════════════════════ */

let radarChart   = null;
let doughnutChart = null;

const TIPS = [
  "Consistency beats intensity. Code for 30 minutes every day rather than 5 hours on weekends.",
  "Build projects, not just tutorials. Employers want to see what you've made.",
  "Contribute to open source — even bug reports and documentation count!",
  "Learning to read documentation is itself a superpower. Practice it daily.",
  "Network actively: attend hackathons, tech meetups, and join developer communities.",
  "Solve at least one algorithm problem per day on LeetCode or HackerRank.",
  "Learn Git deeply. It's the one tool used at every company, without exception.",
  "Write about what you learn. Teaching others solidifies your own understanding.",
  "Don't just learn syntax — understand WHY the technology exists and what problem it solves.",
  "Side projects you are passionate about make the best portfolio pieces.",
];

function renderDashboard() {
  const skills   = dbGet(DB_KEYS.skills);
  const courses  = dbGet(DB_KEYS.courses);
  const certs    = dbGet(DB_KEYS.certs);
  const projects = dbGet(DB_KEYS.projects);
  const goals    = dbGet(DB_KEYS.goals);
  const activity = dbGet(DB_KEYS.activity);

  /* ── Stats ────────────────────────────── */
  const totalSkills    = skills.length;
  const completedSkills = skills.filter(s => s.status === 'completed').length;
  const inProgressSkills = skills.filter(s => s.status === 'in-progress').length;
  const completedCourses = courses.filter(c => c.status === 'completed').length;
  const totalCerts     = certs.length;
  const totalProjects  = projects.length;
  const completedProjs = projects.filter(p => p.status === 'completed').length;

  /* ── Job Readiness Score ──────────────── */
  const readiness = computeReadiness(skills, courses, certs, projects, goals);

  /* ── Category breakdown ───────────────── */
  const catMap = {};
  skills.forEach(s => { catMap[s.category] = (catMap[s.category] || 0) + s.level; });

  /* ── Tip of the day ───────────────────── */
  const tip = TIPS[new Date().getDay() % TIPS.length];

  const html = `
  <div class="page-view">
    <!-- Stat Cards -->
    <div class="stat-cards">
      <div class="stat-card variant-purple">
        <div class="stat-top">
          <div class="stat-icon purple"><i class="fas fa-brain"></i></div>
          <span class="stat-trend up">+${inProgressSkills} active</span>
        </div>
        <div class="stat-number" data-count="${totalSkills}">0</div>
        <div class="stat-label">Total Skills Tracked</div>
      </div>
      <div class="stat-card variant-success">
        <div class="stat-top">
          <div class="stat-icon success"><i class="fas fa-graduation-cap"></i></div>
          <span class="stat-trend up">${completedCourses} done</span>
        </div>
        <div class="stat-number" data-count="${courses.length}">0</div>
        <div class="stat-label">Courses Enrolled</div>
      </div>
      <div class="stat-card variant-warning">
        <div class="stat-top">
          <div class="stat-icon warning"><i class="fas fa-certificate"></i></div>
          <span class="stat-trend neutral">verified</span>
        </div>
        <div class="stat-number" data-count="${totalCerts}">0</div>
        <div class="stat-label">Certifications Earned</div>
      </div>
      <div class="stat-card variant-info">
        <div class="stat-top">
          <div class="stat-icon info"><i class="fas fa-code-branch"></i></div>
          <span class="stat-trend up">${completedProjs} done</span>
        </div>
        <div class="stat-number" data-count="${totalProjects}">0</div>
        <div class="stat-label">Projects Built</div>
      </div>
    </div>

    <div class="dashboard-grid">

      <!-- Skill Radar -->
      <div class="card chart-card dashboard-col-span-2">
        <div>
          <div class="chart-card-title">Skill Strength by Category</div>
          <div class="chart-card-sub">Average proficiency score per domain</div>
        </div>
        <div class="chart-wrap">
          <canvas id="radarCanvas" class="chart-canvas"></canvas>
        </div>
      </div>

      <!-- Job Readiness -->
      <div class="card chart-card">
        <div>
          <div class="chart-card-title">Job Readiness Score</div>
          <div class="chart-card-sub">Based on your skills, courses & projects</div>
        </div>
        <div class="readiness-wrap">
          <canvas id="doughnutCanvas" width="180" height="180" class="chart-canvas pulse-glow"></canvas>
          <div class="gauge-label">${readiness}%</div>
          <div class="gauge-sub">${getReadinessLabel(readiness)}</div>
        </div>
      </div>

      <!-- Category breakdown -->
      <div class="card dashboard-col-span-2">
        <div class="chart-card-title" style="margin-bottom:16px">Skill Proficiency Breakdown</div>
        ${skills.length === 0
          ? `<div class="text-muted" style="font-size:13px">No skills added yet.</div>`
          : skills.map(s => `
          <div class="score-row">
            <div class="score-label">${s.name}</div>
            <div class="score-bar-wrap">
              <div class="score-bar-fill" style="width:0%;background:${hexGrad(getCategoryColor(s.category))};" data-width="${(s.level/5)*100}%"></div>
            </div>
            <div class="score-value">${getLevelLabel(s.level)}</div>
          </div>`).join('')}
      </div>

      <!-- Activity Feed -->
      <div class="card">
        <div class="chart-card-title" style="margin-bottom:16px">Recent Activity</div>
        <div class="activity-feed">
          ${activity.length === 0
            ? `<div class="text-muted" style="font-size:13px">No activity yet.</div>`
            : activity.slice(0,5).map(a => `
            <div class="activity-item">
              <div class="activity-dot" style="background:${a.color}"></div>
              <div class="activity-text">${a.text}</div>
              <div class="activity-time">${a.time}</div>
            </div>`).join('')}
        </div>
      </div>

      <!-- Active Goals -->
      <div class="card">
        <div class="flex-between" style="margin-bottom:16px">
          <div class="chart-card-title">Active Goals</div>
          <a href="#" class="btn btn-ghost btn-sm" data-page="goals">View All</a>
        </div>
        ${goals.length === 0
          ? `<div class="text-muted" style="font-size:13px">No goals set yet.</div>`
          : goals.slice(0,3).map(g => {
              const pct = g.progress || 0;
              return `
              <div style="margin-bottom:14px">
                <div class="flex-between mb-4">
                  <span style="font-size:13px;font-weight:600;color:var(--text-primary)">${g.title}</span>
                  <span style="font-size:12px;font-weight:700;color:var(--text-primary)">${pct}%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" data-width="${pct}%" style="width:0%"></div>
                </div>
              </div>`;
            }).join('')}
      </div>

      <!-- Tip Card -->
      <div class="card tip-card dashboard-col-full">
        <div class="tip-card-header">
          <span class="tip-icon">💡</span>
          <span class="tip-card-title">Tip of the Day</span>
        </div>
        <div class="tip-text">${tip}</div>
      </div>

    </div>
  </div>`;

  document.getElementById('mainContent').innerHTML = html;

  /* Animate counts */
  animateCounts();

  /* Animate progress bars */
  setTimeout(() => {
    document.querySelectorAll('[data-width]').forEach(el => {
      el.style.width = el.dataset.width;
    });
  }, 200);

  /* Charts */
  setTimeout(() => {
    renderRadarChart(skills);
    renderDoughnutChart(readiness);
  }, 100);

  /* Nav links for inline */
  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); App.navigate(el.dataset.page); });
  });
}

function hexGrad(color) {
  return `linear-gradient(90deg, ${color}99, ${color})`;
}

function computeReadiness(skills, courses, certs, projects, goals) {
  let score = 0;
  /* Skills: up to 35 pts */
  const avgLevel = skills.length ? skills.reduce((s,k) => s + k.level, 0) / skills.length : 0;
  score += Math.min(35, Math.round((avgLevel / 5) * 35));
  /* Courses: up to 25 pts */
  const avgCompletion = courses.length ? courses.reduce((s,c) => s + c.completion, 0) / courses.length : 0;
  score += Math.min(25, Math.round((avgCompletion / 100) * 25));
  /* Certs: up to 20 pts */
  score += Math.min(20, certs.length * 7);
  /* Projects: up to 20 pts */
  score += Math.min(20, projects.filter(p => p.status === 'completed').length * 5);
  return Math.min(100, score);
}

function getReadinessLabel(pct) {
  if (pct >= 80) return '🚀 Highly job-ready!';
  if (pct >= 60) return '✅ Getting there!';
  if (pct >= 40) return '📈 Keep pushing!';
  return '🌱 Just getting started';
}

function animateCounts() {
  document.querySelectorAll('.stat-number[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    let current = 0;
    const step  = Math.ceil(target / 20);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current;
      if (current >= target) clearInterval(timer);
    }, 40);
  });
}

function renderRadarChart(skills) {
  const ctx = document.getElementById('radarCanvas');
  if (!ctx) return;
  if (radarChart) { radarChart.destroy(); radarChart = null; }

  /* Aggregate by category */
  const catMap = {};
  skills.forEach(s => {
    if (!catMap[s.category]) catMap[s.category] = { sum: 0, count: 0 };
    catMap[s.category].sum   += s.level;
    catMap[s.category].count += 1;
  });

  const labels = Object.keys(catMap);
  const data   = labels.map(l => parseFloat((catMap[l].sum / catMap[l].count).toFixed(1)));

  if (labels.length === 0) {
    ctx.parentElement.innerHTML = '<div class="text-muted" style="font-size:13px;padding:20px">Add skills to see the chart.</div>';
    return;
  }

  radarChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels,
      datasets: [{
        label: 'Proficiency',
        data,
        backgroundColor: 'rgba(124,58,237,0.15)',
        borderColor: '#7c3aed',
        borderWidth: 2,
        pointBackgroundColor: '#06b6d4',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        r: {
          min: 0, max: 5,
          ticks: { stepSize: 1, color: 'rgba(255,255,255,0.3)', backdropColor: 'transparent', font: { size: 10 } },
          grid: { color: 'rgba(255,255,255,0.07)' },
          angleLines: { color: 'rgba(255,255,255,0.07)' },
          pointLabels: { color: '#94a3b8', font: { size: 12, weight: '600' } },
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(13,18,37,0.95)',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          titleColor: '#f1f5f9',
          bodyColor: '#94a3b8',
          callbacks: {
            label: ctx => ` ${ctx.raw} / 5 — ${getLevelLabel(Math.round(ctx.raw))}`,
          }
        },
      },
    }
  });
}

function renderDoughnutChart(readiness) {
  const ctx = document.getElementById('doughnutCanvas');
  if (!ctx) return;
  if (doughnutChart) { doughnutChart.destroy(); doughnutChart = null; }

  doughnutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [readiness, 100 - readiness],
        backgroundColor: ['url(#gradDoughnut)', 'rgba(255,255,255,0.05)'],
        borderWidth: 0,
        hoverOffset: 0,
      }]
    },
    options: {
      cutout: '75%',
      responsive: false,
      animation: { animateRotate: true, duration: 1200 },
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
    },
    plugins: [{
      id: 'gradFill',
      beforeDraw(chart) {
        const { ctx: c, chartArea: { top, left, right, bottom } } = chart;
        const gradient = c.createLinearGradient(left, top, right, bottom);
        gradient.addColorStop(0,   '#7c3aed');
        gradient.addColorStop(1,   '#06b6d4');
        chart.data.datasets[0].backgroundColor[0] = gradient;
      }
    }]
  });
}
