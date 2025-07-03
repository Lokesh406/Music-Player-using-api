let currentAudio = null;
let currentPlayBtn = null;

// Fetch and display songs by genre or search query
async function fetchSongs(query) {
  try {
    const res = await fetch(`https://api.codetabs.com/v1/proxy?quest=https://api.deezer.com/search?q=${query}`);
    const data = await res.json();
    const songs = data.data;
    const list = document.getElementById("song-list");
    list.innerHTML = '';

    if (!songs || songs.length === 0) {
      list.innerHTML = '<p style="color: white;">No results found.</p>';
      return;
    }

    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    songs.slice(0, 6).forEach(song => {
      const isFav = favorites.some(fav => fav.id === song.id);

      const li = document.createElement("li");
      li.innerHTML = `
        <div class="song-card">
          <img src="${song.album.cover_medium}" alt="${song.title}" class="cover" />
          <div class="info">
            <strong>${song.title_short}</strong><br/>
            <small>${song.artist.name}</small>
          </div>
          <div class="song-actions">
            <button class="play-btn" onclick="playSong('${song.preview}', '${song.title_short}', '${song.artist.name}', this)">▶</button>
            <button class="fav-btn ${isFav ? 'favorited' : ''}" onclick='toggleFavorite(this, ${JSON.stringify(song)})'>
              ${isFav ? '❤️' : '🤍'}
            </button>
          </div>
        </div>
      `;
      list.appendChild(li);
    });

  } catch (err) {
    console.error("Error:", err);
    document.getElementById("song-list").innerHTML = "<p style='color:red;'>Failed to load songs. Try again later.</p>";
  }
}

// Load predefined genres
function loadSongs(genre) {
  fetchSongs(genre);
}

// Search functionality
function searchSongs() {
  const query = document.getElementById("searchInput").value.trim();
  if (query) fetchSongs(query);
}

// Play or pause song
function playSong(src, title, artist, btn) {
  const audio = document.getElementById("audioPlayer");
  const nowPlaying = document.getElementById("now-playing");
  const playerBox = document.querySelector(".music-player");

  if (currentAudio && currentAudio !== src) {
    audio.pause();
    if (currentPlayBtn) currentPlayBtn.classList.remove('playing');
  }

  // Toggle play/pause
  if (audio.src === src) {
    if (audio.paused) {
      audio.play();
      btn.classList.add("playing");
      playerBox.classList.add("active");
    } else {
      audio.pause();
      btn.classList.remove("playing");
    }
  } else {
    audio.src = src;
    audio.play();
    nowPlaying.innerText = `Now Playing: ${title} - ${artist}`;
    btn.classList.add("playing");
    playerBox.classList.add("active");
  }

  currentAudio = src;
  currentPlayBtn = btn;
}

// Toggle favorite
function toggleFavorite(btn, song) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  const index = favorites.findIndex(fav => fav.id === song.id);

  if (index === -1) {
    favorites.push(song);
    btn.classList.add("favorited");
    btn.innerText = "❤️";
  } else {
    favorites.splice(index, 1);
    btn.classList.remove("favorited");
    btn.innerText = "🤍";
  }

  localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Show all favorite songs
function showFavorites() {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  const list = document.getElementById("song-list");
  list.innerHTML = '';

  if (!favorites.length) {
    list.innerHTML = '<p style="color: white;">No favorites yet.</p>';
    return;
  }

  favorites.forEach((song, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="song-card">
        <img src="${song.album.cover_medium}" alt="${song.title}" class="cover" />
        <div class="info">
          <strong>${song.title_short}</strong><br/>
          <small>${song.artist.name}</small>
        </div>
        <div class="song-actions">
          <button class="play-btn" onclick="playSong('${song.preview}', '${song.title_short}', '${song.artist.name}', this)">▶</button>
          <button onclick="removeFromFavorites(${index})">❌</button>
        </div>
      </div>
    `;
    list.appendChild(li);
  });
}

// Remove song from favorites
function removeFromFavorites(index) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  const removed = favorites.splice(index, 1);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  alert(`Removed "${removed[0].title_short}" from Favorites`);
  showFavorites();
}

// Export favorites as JSON
function exportFavorites() {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  if (!favorites.length) return alert("No favorites to export!");

  const blob = new Blob([JSON.stringify(favorites, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "favorites.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Import favorites from file
function importFavorites() {
  const fileInput = document.getElementById("importFile");
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("Invalid format");

      let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

      imported.forEach(song => {
        if (!favorites.some(fav => fav.id === song.id)) {
          favorites.push(song);
        }
      });

      localStorage.setItem('favorites', JSON.stringify(favorites));
      alert("Favorites imported successfully!");
      showFavorites();
    } catch (err) {
      alert("Invalid JSON file!");
    }
  };

  reader.readAsText(file);
}

// Spacebar toggles play/pause
document.addEventListener("keydown", function (e) {
  const audio = document.getElementById("audioPlayer");
  if (e.code === "Space" && audio.src) {
    e.preventDefault();
    const playing = !audio.paused;
    if (playing) {
      audio.pause();
      if (currentPlayBtn) currentPlayBtn.classList.remove("playing");
    } else {
      audio.play();
      if (currentPlayBtn) currentPlayBtn.classList.add("playing");
    }
  }
});
