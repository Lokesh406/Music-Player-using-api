let currentAudioSrc = null;
let currentPlayBtn = null;

// Fetch and display songs
async function fetchSongs(query) {
  try {
    const res = await fetch(
      `https://api.codetabs.com/v1/proxy?quest=https://api.deezer.com/search?q=${encodeURIComponent(query)}`
    );

    const data = await res.json();
    const songs = data.data || [];

    const list = document.getElementById("song-list");
    list.innerHTML = "";

    if (!songs.length) {
      list.innerHTML =
        '<p style="color:white;">No results found.</p>';
      return;
    }

    const favorites =
      JSON.parse(localStorage.getItem("favorites")) || [];

    songs.slice(0, 6).forEach((song) => {
      const isFav = favorites.some((fav) => fav.id === song.id);

      const li = document.createElement("li");

      li.innerHTML = `
        <div class="song-card">
          <img
            src="${song.album.cover_medium}"
            alt="${song.title_short}"
            class="cover"
          />

          <div class="info">
            <strong>${song.title_short}</strong><br>
            <small>${song.artist.name}</small>
          </div>

          <div class="song-actions">
            <button class="play-btn">
              ▶
            </button>

            <button class="fav-btn ${
              isFav ? "favorited" : ""
            }">
              ${isFav ? "❤️" : "🤍"}
            </button>
          </div>
        </div>
      `;

      const playBtn = li.querySelector(".play-btn");
      const favBtn = li.querySelector(".fav-btn");

      playBtn.addEventListener("click", () => {
        playSong(
          song.preview,
          song.title_short,
          song.artist.name,
          playBtn
        );
      });

      favBtn.addEventListener("click", () => {
        toggleFavorite(favBtn, song);
      });

      list.appendChild(li);
    });
  } catch (error) {
    console.error(error);

    document.getElementById("song-list").innerHTML =
      "<p style='color:red;'>Failed to load songs.</p>";
  }
}

// Load genre
function loadSongs(genre) {
  fetchSongs(genre);
}

// Search songs
function searchSongs() {
  const query =
    document.getElementById("searchInput").value.trim();

  if (query) {
    fetchSongs(query);
  }
}

// Play / Pause song
function playSong(src, title, artist, btn) {
  if (!src) {
    alert("Preview unavailable.");
    return;
  }

  const audio = document.getElementById("audioPlayer");
  const nowPlaying =
    document.getElementById("now-playing");

  const playerBox =
    document.querySelector(".music-player");

  if (
    currentPlayBtn &&
    currentPlayBtn !== btn
  ) {
    currentPlayBtn.classList.remove("playing");
    currentPlayBtn.textContent = "▶";
  }

  if (currentAudioSrc === src) {
    if (audio.paused) {
      audio.play();
      btn.classList.add("playing");
      btn.textContent = "⏸";
    } else {
      audio.pause();
      btn.classList.remove("playing");
      btn.textContent = "▶";
    }
  } else {
    audio.src = src;
    audio.play();

    btn.classList.add("playing");
    btn.textContent = "⏸";

    nowPlaying.textContent =
      `Now Playing: ${title} - ${artist}`;

    playerBox.classList.add("active");

    currentAudioSrc = src;
  }

  currentPlayBtn = btn;
}

// Toggle favorite
function toggleFavorite(btn, song) {
  let favorites =
    JSON.parse(localStorage.getItem("favorites")) || [];

  const index = favorites.findIndex(
    (fav) => fav.id === song.id
  );

  if (index === -1) {
    favorites.push({
      id: song.id,
      title_short: song.title_short,
      artist: song.artist,
      album: song.album,
      preview: song.preview
    });

    btn.classList.add("favorited");
    btn.textContent = "❤️";
  } else {
    favorites.splice(index, 1);

    btn.classList.remove("favorited");
    btn.textContent = "🤍";
  }

  localStorage.setItem(
    "favorites",
    JSON.stringify(favorites)
  );
}

// Show favorites
function showFavorites() {
  const favorites =
    JSON.parse(localStorage.getItem("favorites")) || [];

  const list =
    document.getElementById("song-list");

  list.innerHTML = "";

  if (!favorites.length) {
    list.innerHTML =
      '<p style="color:white;">No favorites yet.</p>';
    return;
  }

  favorites.forEach((song, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <div class="song-card">
        <img
          src="${song.album.cover_medium}"
          alt="${song.title_short}"
          class="cover"
        />

        <div class="info">
          <strong>${song.title_short}</strong><br>
          <small>${song.artist.name}</small>
        </div>

        <div class="song-actions">
          <button class="play-btn">
            ▶
          </button>

          <button class="remove-btn">
            ❌
          </button>
        </div>
      </div>
    `;

    li.querySelector(".play-btn")
      .addEventListener("click", () => {
        playSong(
          song.preview,
          song.title_short,
          song.artist.name,
          li.querySelector(".play-btn")
        );
      });

    li.querySelector(".remove-btn")
      .addEventListener("click", () => {
        removeFromFavorites(index);
      });

    list.appendChild(li);
  });
}

// Remove favorite
function removeFromFavorites(index) {
  let favorites =
    JSON.parse(localStorage.getItem("favorites")) || [];

  favorites.splice(index, 1);

  localStorage.setItem(
    "favorites",
    JSON.stringify(favorites)
  );

  showFavorites();
}

// Export favorites
function exportFavorites() {
  const favorites =
    JSON.parse(localStorage.getItem("favorites")) || [];

  if (!favorites.length) {
    alert("No favorites to export!");
    return;
  }

  const blob = new Blob(
    [JSON.stringify(favorites, null, 2)],
    { type: "application/json" }
  );

  const url =
    URL.createObjectURL(blob);

  const a =
    document.createElement("a");

  a.href = url;
  a.download = "favorites.json";

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
}

// Import favorites
function importFavorites() {
  const fileInput =
    document.getElementById("importFile");

  const file =
    fileInput.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const imported =
        JSON.parse(e.target.result);

      if (!Array.isArray(imported))
        throw new Error();

      let favorites =
        JSON.parse(
          localStorage.getItem("favorites")
        ) || [];

      imported.forEach((song) => {
        if (
          song.id &&
          !favorites.some(
            (fav) => fav.id === song.id
          )
        ) {
          favorites.push(song);
        }
      });

      localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
      );

      alert("Favorites imported successfully!");
      showFavorites();
    } catch {
      alert("Invalid JSON file!");
    }
  };

  reader.readAsText(file);
}

// Search on Enter
document
  .getElementById("searchInput")
  ?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      searchSongs();
    }
  });

// Spacebar Play/Pause
document.addEventListener("keydown", (e) => {
  const audio =
    document.getElementById("audioPlayer");

  if (
    e.code === "Space" &&
    audio.src
  ) {
    e.preventDefault();

    if (audio.paused) {
      audio.play();

      if (currentPlayBtn) {
        currentPlayBtn.classList.add("playing");
        currentPlayBtn.textContent = "⏸";
      }
    } else {
      audio.pause();

      if (currentPlayBtn) {
        currentPlayBtn.classList.remove("playing");
        currentPlayBtn.textContent = "▶";
      }
    }
  }
});

// Audio ended
document
  .getElementById("audioPlayer")
  ?.addEventListener("ended", () => {
    if (currentPlayBtn) {
      currentPlayBtn.classList.remove("playing");
      currentPlayBtn.textContent = "▶";
    }

    currentAudioSrc = null;
  });
