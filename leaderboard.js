// leaderboard.js
async function loadLeaders(){
  const cat = document.getElementById('categorySelect').value || 'ops';
  const season = document.getElementById('seasonInput').value || new Date().getFullYear();
  const target = document.getElementById('leaderboard');
  target.innerHTML = `<p class="small-muted">Loading leaders...</p>`;
  try {
    // MLB Stats has different endpoints; use the leaders endpoint where possible
    const endpoint = `https://statsapi.mlb.com/api/v1/stats/leaders?leaderCategories=${cat}&season=${season}&sportId=1`;
    const resp = await fetch(endpoint);
    const data = await resp.json();
    const leaders = data.leagueLeaders?.[0]?.leaders || [];
    if (!leaders.length){ target.innerHTML = `<p class="small-muted">No data.</p>`; return; }
    let html = `<table class="table"><tr><th>Rank</th><th>Player</th><th>${cat.toUpperCase()}</th></tr>`;
    leaders.forEach((p,i)=>{
      html += `<tr><td>${i+1}</td><td>${p.person.fullName}</td><td>${p.value}</td></tr>`;
    });
    html += `</table>`;
    target.innerHTML = html;
  } catch(e){
    console.error(e);
    target.innerHTML = `<p class="small-muted">Error loading leaders.</p>`;
  }
}

// set default season
document.getElementById('seasonInput').value = new Date().getFullYear();
loadLeaders();
