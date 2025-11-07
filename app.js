async function searchPlayer() {
  const name = document.getElementById("playerName").value;
  const resultsDiv = document.getElementById("results");

  resultsDiv.innerHTML = "<p>Loading...</p>";

  const search = await fetch(`https://statsapi.mlb.com/api/v1/people/search?names=%22${name}%22`);
  const data = await search.json();

  if (data.totalSize === 0) {
    resultsDiv.innerHTML = "<p class='text-red-600'>Player not found.</p>";
    return;
  }

  const player = data.people[0];
  const playerId = player.id;

  const stats = await fetch(`https://statsapi.mlb.com/api/v1/people/${playerId}/stats?stats=season&group=hitting,fielding,pitching`);
  const statsData = await stats.json();

  const seasonStats = statsData.stats[0].splits[0].stat;

  resultsDiv.innerHTML = `
    <h2 class="text-xl font-semibold">${player.fullName}</h2>
    <table class="mt-4 table-auto border-collapse w-full text-center">
      <tr><th class="border p-2">AVG</th><td class="border p-2">${seasonStats.avg || "-"}</td></tr>
      <tr><th class="border p-2">HR</th><td class="border p-2">${seasonStats.homeRuns || "-"}</td></tr>
      <tr><th class="border p-2">RBI</th><td class="border p-2">${seasonStats.rbi || "-"}</td></tr>
      <tr><th class="border p-2">OPS</th><td class="border p-2">${seasonStats.ops || "-"}</td></tr>
    </table>
  `;
}
