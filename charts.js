// charts.js
async function getSeasonHitting(id, season) {
  const res = await fetch(`https://statsapi.mlb.com/api/v1/people/${id}/stats?stats=season&season=${season}&group=hitting`);
  const j = await res.json();
  return j.stats[0]?.splits[0]?.stat || null;
}

async function renderPlayerChart(id){
  const container = document.getElementById('chartContainer');
  container.innerHTML = `<canvas id="playerChart" height="200"></canvas>`;
  const seasons = [];
  const opsVals = [];
  // last 6 seasons (including current year)
  const current = new Date().getFullYear();
  for (let s=current-5; s<=current; s++){
    try {
      const stat = await getSeasonHitting(id, s);
      seasons.push(String(s));
      opsVals.push(stat ? (stat.ops ? parseFloat(stat.ops) : null) : null);
    } catch(e){
      seasons.push(String(s));
      opsVals.push(null);
    }
  }
  const ctx = document.getElementById('playerChart').getContext('2d');
  // destroy existing charts to avoid duplicates
  if (window._playerChart) window._playerChart.destroy();
  window._playerChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: seasons,
      datasets: [{
        label: 'OPS',
        data: opsVals,
        fill: false,
        borderWidth: 2,
        pointRadius: 4,
        tension: 0.25,
        borderColor: '#e21b23',
        backgroundColor: '#e21b23'
      }]
    },
    options: {
      responsive:true,
      scales: {
        y: { beginAtZero: false }
      }
    }
  });
}
