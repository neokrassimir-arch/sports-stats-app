// teams.js
async function loadTeamsList(){
  const sel = document.getElementById('teamSelect');
  try {
    const resp = await fetch('https://statsapi.mlb.com/api/v1/teams?sportId=1');
    const data = await resp.json();
    const teams = data.teams || [];
    sel.innerHTML = teams.map(t=>`<option value="${t.id}">${t.name}</option>`).join('');
  } catch(e){
    sel.innerHTML = `<option value="">Error loading teams</option>`;
  }
}

async function loadTeam(){
  const id = document.getElementById('teamSelect').value;
  const area = document.getElementById('teamArea');
  if (!id) { area.innerHTML = `<p class="small-muted">Choose a team.</p>`; return; }
  area.innerHTML = `<p class="small-muted">Loading roster...</p>`;
  try {
    const resp = await fetch(`https://statsapi.mlb.com/api/v1/teams/${id}?expand=team.roster`);
    const data = await resp.json();
    const team = data.teams?.[0];
    const roster = team.roster?.roster || [];
    let html = `<h3 style="margin-bottom:8px">${team.name} — Roster</h3>`;
    html += `<table class="table"><tr><th>#</th><th>Player</th><th>Position</th></tr>`;
    roster.forEach(p=>{
      html += `<tr><td>${p.jerseyNumber||''}</td><td>${p.person.fullName}</td><td>${p.position?.abbreviation||''}</td></tr>`;
    });
    html += '</table>';
    area.innerHTML = html;
  } catch(e){
    console.error(e);
    area.innerHTML = `<p class="small-muted">Failed to load team roster.</p>`;
  }
}

loadTeamsList();
