async function loadLeaders() {
  const api = await fetch("https://statsapi.mlb.com/api/v1/stats/leaders?leaderCategories=ops&season=2024&sportId=1");
  const data = await api.json();

  const leaders = data.leagueLeaders[0].leaders;

  const table = document.getElementById("leaderboard");

  table.innerHTML = `
    <tr class="bg-gray-200 font-bold">
      <th class="p-2">Rank</th>
      <th class="p-2">Player</th>
      <th class="p-2">OPS</th>
    </tr>
  `;

  leaders.forEach((p, i) => {
    table.innerHTML += `
      <tr>
        <td class="border p-2">${i + 1}</td>
        <td class="border p-2">${p.person.fullName}</td>
        <td class="border p-2">${p.value}</td>
      </tr>
    `;
  });
}

loadLeaders();
