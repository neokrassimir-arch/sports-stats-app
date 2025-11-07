// teams.js — load players when a team is selected
async function fetchJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error('Network error');
  return r.json();
}

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
    const data = await fetchJSON(`https://statsapi.mlb.com/api/v1/teams/${teamId}/roster`);
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
        <li class="player-item">
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

document.addEventListener('DOMContentLoaded', () => {
  const loadBtn = document.getElementById('loadTeamBtn');
  if (loadBtn) loadBtn.addEventListener('click', loadTeamPlayers);
});
