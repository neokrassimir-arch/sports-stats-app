async function searchPlayer() {
  const name = document.getElementById("playerName").value;
  const resultsDiv = document.getElementById("results");

  const search = await fetch(`https://statsapi.mlb.com/api/v1/people/search?names=%22${name}%22`);
  const data = await search.json();

  if (data.totalSize === 0) {
    resultsDiv.innerHTML = "<p>No player found.</p>";
    return;
  }

  const playerId = data.people[0].id;

  const stats = await fetch(`https://statsapi.mlb.com/api/v1/people/${playerId}/stats?stats=season&group=hitting,fielding,pitching`);
  const statsData = await stats.json();

  resultsDiv.innerHTML = `
    <h2>${data.people[0].fullName}</h2>
    <pre>${JSON.stringify(statsData, null, 2)}</pre>
  `;
}
