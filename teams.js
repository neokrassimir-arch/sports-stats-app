// teams.js — load teams + players + stats via serverless API
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

// Load players + stats for selected team
async function loadTeamPlayers() {
  const teamSelect = document.getElementById('teamSelect');
  const teamId = teamSelect.value;
  const container = document.getElementById('teamPlayers');
  if (!teamId) {
    container.innerHTML = '<p class="small-muted">Select a team first.</p>';
    return;
  }

  container.innerHTML = '<p class="small-muted">Loading players and stats…</p>';

  try {
    // 1️⃣ Get roster
    const rosterData = await fetchJSON(`/api/team/${teamId}`);
    const players = rosterData.roster || [];

    if (!players.length) {
      container.innerHTML = '<p class="small-muted">No players found for this team.</p>';
      return;
    }

    let html = '';
    // 2️⃣ Fetch stats for each player in parallel (Hitting only)
    const statsPromises = players.map(p => fetchPlayerStats(p.person.id));
    const statsResults = await Promise.all(statsPromises);

    players.forEach((player, idx) => {
      const stat = statsResults[idx] || {};
      const headshot = `https://img.mlbstatic.com/mlb-photos/image/upload/w_100,h_100/mlb/people/${player.person.id}/headshot.jpg`;
      html += `
        <div class="player-card">
          <img src="${headshot}" onerror="this.onerror=null;this.src='icons/player-placeholder.png';" />
          <div class="player-info">
            <a href="player.html?playerId=${player.person.id}">${player.person.fullName}</a>
            <div class="player-stats">
              <span>AVG: ${stat.avg || '-'}</span>
              <span>OPS: ${stat.ops || '-'}</span>
              <span>HR: ${stat.homeRuns || 0}</span>
              <span>RBI: ${stat.rbi || 0}</span>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

  } catch (err) {
    console.error(err);
    container.innerHTML = '<p class="small-muted">Failed to load players/stats.</p>';
  }
}

// Helper: fetch single player's hitting stats
async function fetchPlayerStats(playerId) {
  try {
    const data = await fetchJSON(`https://statsapi.mlb.com/api/v1/people/${playerId}/stats?stats=season&group=hitting`);
    const splits = data.stats?.[0]?.splits?.[0]?.stat || {};
    return splits;
  } catch {
    return {};
  }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  loadTeamsDropdown();
  const loadBtn = document.getElementById('loadTeamBtn');
  if (loadBtn) loadBtn.addEventListener('click', loadTeamPlayers);
});
