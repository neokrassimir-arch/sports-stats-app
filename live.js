// live.js
async function loadLiveScores(){
  const dateInput = document.getElementById('dateInput');
  const date = dateInput.value || new Date().toISOString().slice(0,10);
  const gamesDiv = document.getElementById('games');
  gamesDiv.innerHTML = `<p class="small-muted">Loading scores for ${date}...</p>`;
  try {
    const resp = await fetch(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${date}`);
    const data = await resp.json();
    const games = data.dates[0]?.games || [];
    if (games.length === 0) { gamesDiv.innerHTML = `<p class="small-muted">No games scheduled for ${date}.</p>`; return; }
    let html = '';
    games.forEach(g=>{
      const away = g.teams.away.team.name;
      const home = g.teams.home.team.name;
      const awayScore = g.teams.away.score ?? '-';
      const homeScore = g.teams.home.score ?? '-';
      const status = g.status.detailedState;
      html += `<div class="card" style="margin-bottom:10px;">
        <div class="player-row">
          <div>
            <div style="font-weight:700">${away} @ ${home}</div>
            <div class="small-muted">${g.venue.name} • ${g.gameDate.slice(11,16)} (ET)</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:1.25rem">${awayScore} — ${homeScore}</div>
            <div class="small-muted">${status}</div>
          </div>
        </div>
      </div>`;
    });
    gamesDiv.innerHTML = html;
  } catch(e){
    console.error(e);
    gamesDiv.innerHTML = `<p class="small-muted">Failed to load live scores.</p>`;
  }
}

// default date to today
document.getElementById('dateInput').value = new Date().toISOString().slice(0,10);
loadLiveScores();
setInterval(loadLiveScores, 30000);
