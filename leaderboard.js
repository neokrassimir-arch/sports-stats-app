// leaderboard.js
async function loadLeaders(){
  const cat = document.getElementById('categorySelect').value || 'ops';
  const season = document.getElementById('seasonInput').value || new Date().getFullYear();
  const target = document.getElementById('leaderboard');
  target.innerHTML = `<p class="small-muted">Loading leaders...</p>`;
  try {
    const endpoint = `https://statsapi.mlb.com/api/v1/stats/leaders?leaderCategories=${cat}&season=${season}&sportId=1`;
    const resp = await fetch(endpoint);
    const data = await resp.json();
    let leaders = data.leagueLeaders?.[0]?.leaders || [];

    if (!leaders.length){
      target.innerHTML = `<p class="small-muted">No data.</p>`;
      return;
    }

    // ✅ FIX: Convert to number and sort from HIGHEST → LOWEST
    leaders.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));

    let html = `<table class="table"><tr><th>Rank</th><th>Player</th><th>${cat.toUpperCase()}</th></tr>`;
    leaders.forEach((p, i) => {
      html += `<tr><td>${i + 1}</td><td>${p.person.fullName}</td><td>${p.value}</td></tr>`;
    });
    html += `</table>`;

    target.innerHTML = html;

  } catch(e){
    console.error(e);
    target.innerHTML = `<p class="small-muted">Error loading leaders.</p>`;
  }
}
