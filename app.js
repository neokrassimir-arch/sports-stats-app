// app.js
async function searchPlayer() {
  const q = document.getElementById('playerName').value.trim();
  const results = document.getElementById('results');
  const chartContainer = document.getElementById('chartContainer');
  chartContainer.innerHTML = '';
  if (!q) { results.innerHTML = `<p class="small-muted">Type a player name.</p>`; return; }
  results.innerHTML = `<p class="small-muted">Searching...</p>`;

  try {
    const r = await fetch(`https://statsapi.mlb.com/api/v1/people/search?names="%22${encodeURIComponent(q)}%22`);
    const data = await r.json();
    if (!data.people || data.totalSize === 0) { results.innerHTML = `<p class="small-muted">No player found.</p>`; return; }
    const player = data.people[0];
    const id = player.id;
    const pname = player.fullName;
    // Save latest player id to a data attribute for graph / favorites
    document.getElementById('searchBtn').dataset.playerId = id;
    document.getElementById('saveBtn').dataset.playerId = id;
    document.getElementById('saveBtn').dataset.playerName = pname;

    // fetch season hitting, pitching, fielding
    const statsRes = await fetch(`https://statsapi.mlb.com/api/v1/people/${id}/stats?stats=season&group=hitting,pitching,fielding`);
    const statsJson = await statsRes.json();
    const splits = statsJson.stats[0]?.splits || [];
    // pick common hitting split if exists
    const hitting = splits.find(s=>s.group.displayName==='hitting')?.stat || {};
    const pitching = splits.find(s=>s.group.displayName==='pitching')?.stat || {};
    const fielding = splits.find(s=>s.group.displayName==='fielding')?.stat || {};

    results.innerHTML = `
      <div class="player-row">
        <div>
          <div style="font-weight:700">${pname}</div>
          <div class="small-muted">${player.primaryPosition?.code || ''} · ${player.birthDate || ''}</div>
        </div>
        <div class="small-muted">ID: ${id}</div>
      </div>
      <div class="mt-4">
        <table class="table">
          <tr><th>AVG</th><td>${hitting.avg || '-'}</td><th>OBP</th><td>${hitting.obp || '-'}</td></tr>
          <tr><th>SLG</th><td>${hitting.slg || '-'}</td><th>OPS</th><td>${hitting.ops || '-'}</td></tr>
          <tr><th>HR</th><td>${hitting.homeRuns || '-'}</td><th>RBI</th><td>${hitting.rbi || '-'}</td></tr>
          <tr><th>ERA</th><td>${pitching.era || '-'}</td><th>W-L</th><td>${pitching.wins || '-'}-${pitching.losses || '-'}</td></tr>
        </table>
      </div>
    `;
  } catch (e) {
    console.error(e);
    document.getElementById('results').innerHTML = `<p class="small-muted">Error fetching player data.</p>`;
  }
}

function saveFavorite(){
  const btn = document.getElementById('saveBtn');
  const id = btn.dataset.playerId;
  const name = btn.dataset.playerName;
  if (!id) { alert('Search a player first.'); return; }
  const favs = JSON.parse(localStorage.getItem('bb_favs')||'[]');
  if (favs.find(f=>f.id==id)) { alert('Already in favorites'); return; }
  favs.push({id,name});
  localStorage.setItem('bb_favs', JSON.stringify(favs));
  alert('Saved to favorites');
}

function showGraph(){
  const id = document.getElementById('searchBtn').dataset.playerId;
  if (!id) { alert('Search player first'); return; }
  // charts.js handles the rendering with a function renderPlayerChart(id)
  if (typeof renderPlayerChart === 'function') renderPlayerChart(id);
  else alert('Charts not loaded');
}
document.addEventListener('DOMContentLoaded', async ()=>{
  const id = localStorage.getItem('bb_view');
  if (id) {
    // remove it so it won't repeat
    localStorage.removeItem('bb_view');
    // fetch player name and show
    try {
      const r = await fetch(`https://statsapi.mlb.com/api/v1/people/${id}`);
      const j = await r.json();
      const name = j.people?.[0]?.fullName || '';
      document.getElementById('playerName').value = name;
      searchPlayer();
    } catch(e){}
  }
});
