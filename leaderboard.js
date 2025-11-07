// leaderboard.js
async function loadLeaders() {
  const cat = document.getElementById("categorySelect").value || "ops";
  const season = document.getElementById("seasonInput").value || new Date().getFullYear();
  const target = document.getElementById("leaderboard");
  target.innerHTML = `<p class="small-muted">Loading leaders...</p>`;

  try {
    const endpoint = `https://statsapi.mlb.com/api/v1/stats/leaders?leaderCategories=${cat}&season=${season}&sportId=1`;
    const resp = await fetch(endpoint);
    const data = await resp.json();

    let leaders = data.leagueLeaders?.[0]?.leaders || [];

    if (!leaders.length) {
      target.innerHTML = `<p class="small-muted">No data.</p>`;
      return;
    }

    // ✅ CONVERT VALUE TO NUMBER AND FORCE DESCENDING SORT
    function numeric(val) {
      return Number(String(val).replace(/[^0-9.]/g, ""));
    }

    leaders.sort((a, b) => numeric(b.value) - numeric(a.value));

    console.log("Sorted (DESC):", leaders.map(p => p.value)); // Debugging

    let html = `
      <table class="table">
      <tr>
        <th>Rank</th>
        <th>Player</th>
        <th>${cat.toUpperCase()}</th>
      </tr>
    `;

    leaders.forEach((p, i) => {
      html += `
        <tr>
          <td>${i + 1}</td>
          <td>${p.person.fullName}</td>
          <td>${p.value}</td>
        </tr>`;
    });

    html += `</table>`;
    target.innerHTML = html;

  } catch (e) {
    console.error("Leaderboard error:", e);
    target.innerHTML = `<p class="small-muted">Error loading leaders.</p>`;
  }
}

// Run on first load
document.addEventListener("DOMContentLoaded", loadLeaders);
