// favorites.js
function renderFavorites(){
  const list = JSON.parse(localStorage.getItem('bb_favs') || '[]');
  const area = document.getElementById('favList');
  if (!list.length) { area.innerHTML = `<p class="small-muted">No favorites yet. Save players from the search screen.</p>`; return; }
  let html = '';
  list.forEach(f=>{
    html += `<div class="card" style="margin-bottom:8px;">
      <div class="player-row">
        <div><div style="font-weight:700">${f.name}</div><div class="small-muted">ID ${f.id}</div></div>
        <div>
          <button class="btn-dark" onclick="viewFavorite(${f.id})">View</button>
          <button class="btn-dark" onclick="removeFav(${f.id})">Remove</button>
        </div>
      </div>
    </div>`;
  });
  area.innerHTML = html;
}

async function viewFavorite(id){
  // navigate to index and prefill? We'll open a new window with player page
  const w = window.open('index.html','_blank');
  // store temp id to localStorage so index can pick it up, then search
  localStorage.setItem('bb_view', id);
  setTimeout(()=>w.location.reload(), 500);
}

function removeFav(id){
  let list = JSON.parse(localStorage.getItem('bb_favs') || '[]');
  list = list.filter(x=>x.id != id);
  localStorage.setItem('bb_favs', JSON.stringify(list));
  renderFavorites();
}

document.addEventListener('DOMContentLoaded', ()=>{
  renderFavorites();
});
