// player.js - load player by ?playerId= or show message
async function fetchJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error('Network error');
  return r.json();
}

async function loadPlayerFromQuery() {
  const params = new URLSearchParams(location.search);
  const id = params.get('playerId');
  if (!id) {
    document.getElementById('profileContent').innerHTML = '<p class="text-red-400">No player selected.</p>';
    return;
  }
  await renderPlayerProfile(id);
}

async function renderPlayerProfile(playerId) {
  const out = document.getElementById('profileContent');
  out.innerHTML = '<p class="text-gray-400">Loading player profile…</p>';
  try {
    const person = await fetchJSON(`https://statsapi.mlb.com/api/v1/people/${playerId}`);
    const p = person.people?.[0];
    if (!p) { out.innerHTML = '<p>No player found.</p>'; return; }

    const stats = await fetchJSON(`https://statsapi.mlb.com/api/v1/people/${playerId}/stats?stats=season&group=hitting,pitching`);
    const season = stats.stats?.[0]?.splits?.[0]?.stat ?? {};

    const html = `
      <div class="profile grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="col-span-1">
          <img src="https://img.mlbstatic.com/mlb-photos/image/upload/w_400,h_400/mlb/people/${playerId}/headshot.jpg" onerror="this.onerror=null;this.src='icons/player-placeholder.png';" class="large-headshot" />
        </div>
        <div class="col-span-2">
          <h2 class="text-3xl font-bold text-red-500">${p.fullName}</h2>
          <div class="text-sm text-gray-300">${p.currentTeam?.name || ''} • ${p.primaryPosition?.abbreviation || ''} • #${p.primaryNumber || ''}</div>

          <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="card bg-gray-800 p-3">
              <h3 class="font-semibold">Season Stats</h3>
              <table class="text-sm mt-2">
                <tr><th>AVG</th><td>${season.avg || '-'}</td></tr>
                <tr><th>OPS</th><td>${season.ops || '-'}</td></tr>
                <tr><th>HR</th><td>${season.homeRuns || 0}</td></tr>
                <tr><th>RBI</th><td>${season.rbi || 0}</td></tr>
              </table>
            </div>
            <div class="card bg-gray-800 p-3">
              <h3 class="font-semibold">Bio</h3>
              <div class="text-sm text-gray-300">
                Born: ${p.birthDate || '—'} aged ${p.currentAge || '—'} • B/T: ${p.bats || '-'} / ${p.throws || '-'} • Height: ${p.height || '-'} • Weight: ${p.weight || '-'}
              </div>
            </div>
          </div>

          <div id="chartWrap" class="mt-6">
            <canvas id="playerOpsChart"></canvas>
          </div>
        </div>
      </div>
    `;
    out.innerHTML = html;

    if (window.renderOPSChart) window.renderOPSChart(playerId, p.fullName);

  } catch (err) {
    out.innerHTML = '<p class="text-red-500">Could not load profile.</p>';
    console.error(err);
  }
}

document.addEventListener('DOMContentLoaded', loadPlayerFromQuery);
