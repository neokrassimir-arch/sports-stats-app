// leaderboard.js — upgraded: numeric-safe sorting, column sorting, headshots, pagination, clickable names
const PAGE_SIZE = 10;
let currentLeaders = [];
let currentCategory = null;
let currentSeason = null;
let currentPage = 1;
let sortDesc = true; // default sort direction (descending for hitting stats)

function numeric(val) {
  // Strip non-numeric chars (%, etc.) then parse float
  const n = Number(String(val).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function buildTableHeader(cat) {
  // clickable column header to toggle sort
  return `
    <tr class="table-head">
      <th>Rank</th>
      <th class="clickable" data-sortby="player">Player</th>
      <th class="clickable" data-sortby="value">${cat.toUpperCase()}</th>
    </tr>
  `;
}

function renderPagination(total) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  let html = '<div class="pagination">';
  if (currentPage > 1) html += `<button onclick="changePage(${currentPage-1})" class="btn">Prev</button>`;
  html += `<span class="page-info"> ${currentPage} / ${pages} </span>`;
  if (currentPage < pages) html += `<button onclick="changePage(${currentPage+1})" class="btn">Next</button>`;
  html += `</div>`;
  return html;
}

function changePage(p) {
  currentPage = p;
  renderLeadersToDOM();
}

function sortLeadersByValue(arr, cat) {
  // ERA is "lower is better", others higher is better
  if (cat === 'era') {
    arr.sort((a,b) => numeric(a.value) - numeric(b.value));
    sortDesc = false;
  } else {
    arr.sort((a,b) => numeric(b.value) - numeric(a.value));
    sortDesc = true;
  }
}

function attachColumnSortHandlers() {
  document.querySelectorAll('#leaderboard .clickable').forEach(el => {
    el.style.cursor = 'pointer';
    el.onclick = (e) => {
      const key = el.dataset.sortby;
      if (key === 'value') {
        // toggle direction if user clicks value column
        sortDesc = !sortDesc;
        currentLeaders.sort((a,b) => sortDesc ? numeric(b.value) - numeric(a.value) : numeric(a.value) - numeric(b.value));
      } else if (key === 'player') {
        // sort alphabetically by player name
        currentLeaders.sort((a,b) => a.person.fullName.localeCompare(b.person.fullName));
      }
      currentPage = 1;
      renderLeadersToDOM();
    };
  });
}

// Render leaders slice to DOM (current page)
function renderLeadersToDOM() {
  const target = document.getElementById('leaderboard');
  if (!currentLeaders.length) { target.innerHTML = `<p class="small-muted">No data.</p>`; return; }

  const start = (currentPage - 1) * PAGE_SIZE;
  const slice = currentLeaders.slice(start, start + PAGE_SIZE);

  let html = '<table class="table">';
  html += buildTableHeader(currentCategory);
  slice.forEach((p, idx) => {
    const playerId = p.person.id;
    const headshot = `https://img.mlbstatic.com/mlb-photos/image/upload/w_200,h_200/mlb/people/${playerId}/headshot.jpg`;
    const displayValue = p.value ?? '-';
    html += `
      <tr class="leader-row">
        <td class="rank">${start + idx + 1}</td>
        <td class="player-cell">
          <img src="${headshot}" onerror="this.onerror=null;this.src='icons/player-placeholder.png';" class="headshot" />
          <a href="player.html?playerId=${playerId}" class="player-link">${p.person.fullName}</a>
        </td>
        <td class="value-cell">${displayValue}</td>
      </tr>
    `;
  });
  html += '</table>';
  html += renderPagination(currentLeaders.length);
  target.innerHTML = html;

  attachColumnSortHandlers();
}

// Main loader
async function loadLeaders(){
  const cat = document.getElementById('categorySelect').value || 'ops';
  const season = document.getElementById('seasonInput').value || new Date().getFullYear();
  currentCategory = cat;
  currentSeason = season;
  currentPage = 1;

  const target = document.getElementById('leaderboard');
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

    leaders = leaders.map(x => ({ ...x, _numeric: numeric(x.value) }));

    if (cat === 'era') {
      leaders.sort((a,b) => a._numeric - b._numeric);
      sortDesc = false;
    } else {
      leaders.sort((a,b) => b._numeric - a._numeric);
      sortDesc = true;
    }

    currentLeaders = leaders;
    renderLeadersToDOM();

  } catch (e) {
    console.error('Leaderboard error:', e);
    target.innerHTML = `<p class="small-muted">Error loading leaders.</p>`;
  }
}

document.addEventListener('DOMContentLoaded', loadLeaders);
