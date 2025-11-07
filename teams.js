// teams.js — load teams + players via serverless API
async function fetchJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error('Network error');
  return r.json();
}

// Populate team dropdown dynamically
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

// Load players for selected team using serverless API
async function loadTeamPlayers() {
  const teamSelect = document.getElementById('teamSelect');
  const teamId = teamSelect.value;
  const container = document.getElementById('teamPlayers');
  if (!teamId) {
    container.innerHTML = '<p class="small-muted">Select a team first.</p>';
    return;
  }

  container.innerHTML = '<p class="small-muted">Loading players…</p>';

  try {
    // Use serverless API route
    const data = await fetchJSON(`/api/team/${teamId}`);
    const players = data.roster || [];

    if (!players.length) {
      container.innerHTML = '<p class="small-muted">No players found for this team.</p>';
      return;
    }

    let html = '<ul class="team-player-list">';
    players.forEach(player => {
      const p = player.person;
      const headshot = `https://img.mlbstatic.com/mlb-photos/image/upload/w_100,h_100/mlb/people/${p.id}/headshot.jpg`;
      html += `
        <li class="player-item flex items-center gap-2 mb-2">
          <img src="${headshot}" onerror="this.onerror=null;this.src='icons/player-placeholder.png';" class="headshot" />
          <a href="player.html?playerId=${p.id}" class="player-link">${p.fullName}</a>
        </li>
      `;
    });
    html += '</ul>';
    container.innerHTML = html;

  } catch (err) {
    console.error(err);
    container.innerHTML = '<p class="small-muted">Failed to load players.</p>';
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  loadTeamsDropdown();
  const loadBtn = document.getElementById('loadTeamBtn');
  if (loadBtn) loadBtn.addEventListener('click', loadTeamPlayers);
});
