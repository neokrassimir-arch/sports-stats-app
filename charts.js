// charts.js — load players + stats and display charts
async function fetchJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error('Network error');
  return r.json();
}

// Populate team dropdown
async function loadTeamsDropdown() {
  const select = document.getElementById('teamSelect');
  try {
    const data = await fetchJSON('https://statsapi.mlb.com/api/v1/teams?sportIds=1');
    data.teams.forEach(team => {
      const opt = document.createElement('option');
      opt.value = team.id;
      opt.textContent = team.name;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error(err);
    select.innerHTML = '<option value="">Failed to load teams</option>';
  }
}

// Fetch players + stats for charts
async function loadTeamCharts() {
  const teamSelect = document.getElementById('teamSelect');
  const teamId = teamSelect.value;
  if (!teamId) return alert('Select a team first');

  try {
    const rosterData = await fetchJSON(`/api/team/${teamId}`);
    const players = rosterData.roster || [];
    if (!players.length) return alert('No players found for this team.');

    // Fetch stats for all players in parallel
    const statsPromises = players.map(p => fetchPlayerStats(p.person.id));
    const statsResults = await Promise.all(statsPromises);

    const labels = players.map(p => p.person.fullName);
    const avgData = statsResults.map(s => parseFloat(s.avg) || 0);
    const opsData = statsResults.map(s => parseFloat(s.ops) || 0);
    const hrData = statsResults.map(s => s.homeRuns || 0);
    const rbiData = statsResults.map(s => s.rbi || 0);

    renderChart('avgChart', 'Batting Average (AVG)', labels, avgData, 'rgba(75, 192, 192, 0.7)');
    renderChart('opsChart', 'OPS', labels, opsData, 'rgba(255, 99, 132, 0.7)');
    renderChart('hrChart', 'Home Runs (HR)', labels, hrData, 'rgba(54, 162, 235, 0.7)');
    renderChart('rbiChart', 'RBIs', labels, rbiData, 'rgba(255, 206, 86, 0.7)');

  } catch (err) {
    console.error(err);
    alert('Failed to load charts.');
  }
}

// Helper to fetch single player's hitting stats via serverless API
async function fetchPlayerStats(playerId) {
  try {
    const data = await fetchJSON(`/api/player/${playerId}`);
    const splits = data.stats?.[0]?.splits?.[0]?.stat || {};
    return splits;
  } catch {
    return {};
  }
}

// Render a bar chart using Chart.js
function renderChart(canvasId, label, labels, data, bgColor) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  if (ctx.chart) ctx.chart.destroy(); // destroy previous chart if exists

  ctx.chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: label,
        data: data,
        backgroundColor: bgColor
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  loadTeamsDropdown();
  document.getElementById('loadChartsBtn').addEventListener('click', loadTeamCharts);
});
