// compare.js
async function fetchPlayerByName(name){
  const r = await fetch(`https://statsapi.mlb.com/api/v1/people/search?names="%22${encodeURIComponent(name)}%22`);
  const j = await r.json();
  return j.people?.[0] || null;
}

async function fetchHittingStats(id){
  const r = await fetch(`https://statsapi.mlb.com/api/v1/people/${id}/stats?stats=season&group=hitting`);
  const j = await r.json();
  return j.stats[0]?.splits[0]?.stat || {};
}

async function comparePlayers(){
  const p1name = document.getElementById('p1').value.trim();
  const p2name = document.getElementById('p2').value.trim();
  if (!p1name || !p2name) { alert('Enter both names'); return; }
  const r1 = await fetchPlayerByName(p1name);
  const r2 = await fetchPlayerByName(p2name);
  if (!r1 || !r2) { alert('One or more players not found'); return; }
  const s1 = await fetchHittingStats(r1.id);
  const s2 = await fetchHittingStats(r2.id);

  const out = document.getElementById('compareResult');
  out.innerHTML = `
    <div class="grid-2">
      <div class="card">
        <div style="font-weight:700">${r1.fullName}</div>
        <div class="small-muted">${r1.primaryPosition?.code || ''}</div>
        <table class="table mt-2">
          <tr><th>AVG</th><td>${s1.avg||'-'}</td></tr>
          <tr><th>OPS</th><td>${s1.ops||'-'}</td></tr>
          <tr><th>HR</th><td>${s1.homeRuns||'-'}</td></tr>
          <tr><th>RBI</th><td>${s1.rbi||'-'}</td></tr>
        </table>
      </div>
      <div class="card">
        <div style="font-weight:700">${r2.fullName}</div>
        <div class="small-muted">${r2.primaryPosition?.code || ''}</div>
        <table class="table mt-2">
          <tr><th>AVG</th><td>${s2.avg||'-'}</td></tr>
          <tr><th>OPS</th><td>${s2.ops||'-'}</td></tr>
          <tr><th>HR</th><td>${s2.homeRuns||'-'}</td></tr>
          <tr><th>RBI</th><td>${s2.rbi||'-'}</td></tr>
        </table>
      </div>
    </div>
  `;
  // Radar chart
  const labels = ['AVG','OPS','HR','RBI'];
  const aVals = [ parseFloat(s1.avg || 0), parseFloat(s1.ops || 0), parseFloat(s1.homeRuns || 0), parseFloat(s1.rbi || 0) ];
  const bVals = [ parseFloat(s2.avg || 0), parseFloat(s2.ops || 0), parseFloat(s2.homeRuns || 0), parseFloat(s2.rbi || 0) ];
  const ctx = document.getElementById('radarChart').getContext('2d');
  if (window._radar) window._radar.destroy();
  window._radar = new Chart(ctx, {
    type:'radar',
    data: {
      labels,
      datasets:[
        { label: r1.fullName, data: aVals, borderColor:'#e21b23', backgroundColor:'rgba(226,27,35,0.15)' },
        { label: r2.fullName, data: bVals, borderColor:'#0aa', backgroundColor:'rgba(10,170,170,0.12)' }
      ]
    },
    options:{ elements:{ line:{ tension:0.3 } } }
  });
}
