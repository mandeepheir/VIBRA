
/* =========================================
   VIBRA — MUSIC APPLICATION
   Complete JavaScript
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    // =====================================
    // 1. DOM ELEMENTS
    // =====================================

    const audioPlayer = document.getElementById("audioPlayer");

    const playerTitle = document.getElementById("playerTitle");
    const playerArtist = document.getElementById("playerArtist");
    const playerCover = document.getElementById("playerCover");

    const playPauseBtn = document.getElementById("playPauseBtn");
    const previousBtn = document.getElementById("previousBtn");
    const nextBtn = document.getElementById("nextBtn");
    const shuffleBtn = document.getElementById("shuffleBtn");
    const repeatBtn = document.getElementById("repeatBtn");

    const progressBar = document.getElementById("progressBar");
    const currentTime = document.getElementById("currentTime");
    const duration = document.getElementById("duration");
    const volumeControl = document.getElementById("volumeControl");

    const likeCurrentBtn = document.getElementById("likeCurrentBtn");

    const audioUpload = document.getElementById("audioUpload");
    const searchInput = document.getElementById("searchInput");

    const recentlyPlayed = document.getElementById("recentlyPlayed");
    const homeSongList = document.getElementById("homeSongList");
    const librarySongs = document.getElementById("librarySongs");
    const likedSongs = document.getElementById("likedSongs");
    const searchResults = document.getElementById("searchResults");

    const playlistGrid = document.getElementById("playlistGrid");
    const playlistDetails = document.getElementById("playlistDetails");

    const playlistModal = document.getElementById("playlistModal");
    const createPlaylistBtn = document.getElementById("createPlaylistBtn");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const savePlaylistBtn = document.getElementById("savePlaylistBtn");
    const playlistNameInput = document.getElementById("playlistNameInput");

    const toast = document.getElementById("toast");

    // =====================================
    // 2. APPLICATION STATE
    // =====================================

    const STORAGE_KEYS = {
        liked: "vibra_liked_songs",
        playlists: "vibra_playlists",
        recent: "vibra_recent_songs"
    };

    const demoSongs = [
        {
            id: "song-1",
            title: "SoundHelix Song 1",
            artist: "SoundHelix",
            album: "Demo Collection",
            src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            cover: "🎧",
            isLocal: false
        },
        {
            id: "song-2",
            title: "SoundHelix Song 2",
            artist: "SoundHelix",
            album: "Demo Collection",
            src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
            cover: "🌌",
            isLocal: false
        },
        {
            id: "song-3",
            title: "SoundHelix Song 3",
            artist: "SoundHelix",
            album: "Demo Collection",
            src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
            cover: "🎵",
            isLocal: false
        }
    ];

    let songs = [...demoSongs];

    let currentSongIndex = -1;

    let isPlaying = false;
    let isShuffle = false;
    let repeatMode = 0;

    let selectedPlaylistId = null;

    let navigationHistory = ["home"];
    let historyIndex = 0;

    let likedSongIds = loadStorage(STORAGE_KEYS.liked, []);
    let playlists = loadStorage(STORAGE_KEYS.playlists, []);
    let recentSongIds = loadStorage(STORAGE_KEYS.recent, []);

    let toastTimeout;

    // =====================================
    // 3. STORAGE HELPERS
    // =====================================

    function loadStorage(key, fallback) {
        try {
            const saved = localStorage.getItem(key);

            if (saved) {
                const parsed = JSON.parse(saved);

                return Array.isArray(parsed) ? parsed : fallback;
            }
        } catch (error) {
            console.error("Storage loading error:", error);
        }

        return fallback;
    }

    function saveStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error("Storage saving error:", error);
            showToast("Could not save data in this browser.");
        }
    }

    // =====================================
    // 4. UTILITY FUNCTIONS
    // =====================================

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[character]);
    }

    function formatTime(seconds) {
        if (!Number.isFinite(seconds)) {
            return "0:00";
        }

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
    }

    function getCurrentSong() {
        return songs[currentSongIndex] || null;
    }

    function getSongById(id) {
        return songs.find(song => song.id === id);
    }

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(toastTimeout);

        toastTimeout = setTimeout(() => {
            toast.classList.remove("show");
        }, 2500);
    }

    // =====================================
    // 5. SONG DISPLAY
    // =====================================

    function songCover(song) {
        if (song.coverUrl) {
            return `<img src="${escapeHTML(song.coverUrl)}" alt="">`;
        }

        return escapeHTML(song.cover || "♫");
    }

    function renderSongCard(song) {
        return `
            <article class="song-card" data-play-song="${escapeHTML(song.id)}">

                <div class="song-card-cover">
                    ${songCover(song)}
                </div>

                <h3>${escapeHTML(song.title)}</h3>
                <p>${escapeHTML(song.artist)}</p>

            </article>
        `;
    }

    function renderSongRow(song) {
        const isLiked = likedSongIds.includes(song.id);
        const isCurrent = getCurrentSong()?.id === song.id;

        return `
            <div class="song-row ${isCurrent ? "active" : ""}"
                 data-song-row="${escapeHTML(song.id)}">

                <div class="song-row-cover"
                     data-play-song="${escapeHTML(song.id)}">
                    ${songCover(song)}
                </div>

                <div class="song-row-info"
                     data-play-song="${escapeHTML(song.id)}">

                    <h3>${escapeHTML(song.title)}</h3>
                    <p>${escapeHTML(song.artist)}</p>

                </div>

                <button
                    class="like-song-btn ${isLiked ? "liked" : ""}"
                    data-like-song="${escapeHTML(song.id)}"
                    aria-label="${isLiked ? "Unlike" : "Like"} song"
                    title="${isLiked ? "Unlike" : "Like"}"
                >
                    ${isLiked ? "♥" : "♡"}
                </button>

                <button
                    data-add-song="${escapeHTML(song.id)}"
                    aria-label="Add to playlist"
                    title="Add to playlist"
                >
                    +
                </button>

            </div>
        `;
    }

    // =====================================
    // 6. RENDER MAIN COLLECTIONS
    // =====================================

    function renderHome() {
        const recentSongs = recentSongIds
            .map(id => getSongById(id))
            .filter(Boolean)
            .slice(0, 6);

        const displayRecent = recentSongs.length
            ? recentSongs
            : songs.slice(0, 6);

        recentlyPlayed.innerHTML = displayRecent
            .map(renderSongCard)
            .join("");

        homeSongList.innerHTML = songs
            .map(renderSongRow)
            .join("");
    }

    function renderLibrary() {
        librarySongs.innerHTML = songs.length
            ? songs.map(renderSongRow).join("")
            : emptyState("No music yet", "Upload your first song to get started.");
    }

    function renderLikedSongs() {
        const liked = likedSongIds
            .map(id => getSongById(id))
            .filter(Boolean);

        likedSongs.innerHTML = liked.length
            ? liked.map(renderSongRow).join("")
            : emptyState("No liked songs", "Your favorite songs will appear here.");
    }

    function renderSearch(query = "") {
        const normalizedQuery = query.trim().toLowerCase();

        const results = songs.filter(song => {
            return (
                song.title.toLowerCase().includes(normalizedQuery) ||
                song.artist.toLowerCase().includes(normalizedQuery) ||
                song.album.toLowerCase().includes(normalizedQuery)
            );
        });

        searchResults.innerHTML = results.length
            ? results.map(renderSongRow).join("")
            : emptyState("No results found", "Try searching for another song.");
    }

    function emptyState(title, description) {
        return `
            <div class="empty-state">
                <h3>${escapeHTML(title)}</h3>
                <p>${escapeHTML(description)}</p>
            </div>
        `;
    }

    function renderAll() {
        renderHome();
        renderLibrary();
        renderLikedSongs();
        renderPlaylists();

        if (searchInput.value.trim()) {
            renderSearch(searchInput.value);
        }

        updatePlayer();
    }

    // =====================================
    // 7. PLAY MUSIC
    // =====================================

    async function playSong(index) {
        if (index < 0 || index >= songs.length) {
            return;
        }

        const song = songs[index];

        currentSongIndex = index;

        if (audioPlayer.src !== song.src) {
            audioPlayer.src = song.src;
        }

        try {
            await audioPlayer.play();

            isPlaying = true;

            addToRecentlyPlayed(song.id);

            updatePlayer();
            renderAll();

        } catch (error) {
            isPlaying = false;

            updatePlayer();

            console.error("Playback error:", error);

            showToast("Unable to play this song. Check the audio source.");
        }
    }

    function togglePlayPause() {
        if (!getCurrentSong()) {
            if (songs.length > 0) {
                playSong(0);
            }

            return;
        }

        if (audioPlayer.paused) {
            audioPlayer.play()
                .then(() => {
                    isPlaying = true;
                    updatePlayer();
                })
                .catch(error => {
                    console.error("Playback error:", error);
                    showToast("Unable to play this song.");
                });
        } else {
            audioPlayer.pause();
            isPlaying = false;
            updatePlayer();
        }
    }

    function playNext() {
        if (!songs.length) return;

        let nextIndex;

        if (isShuffle && songs.length > 1) {
            do {
                nextIndex = Math.floor(Math.random() * songs.length);
            } while (nextIndex === currentSongIndex);
        } else {
            nextIndex = currentSongIndex + 1;

            if (nextIndex >= songs.length) {
                if (repeatMode === 2) {
                    nextIndex = 0;
                } else {
                    audioPlayer.pause();
                    isPlaying = false;
                    updatePlayer();
                    return;
                }
            }
        }

        playSong(nextIndex);
    }

    function playPrevious() {
        if (!songs.length) return;

        if (audioPlayer.currentTime > 3) {
            audioPlayer.currentTime = 0;
            return;
        }

        let previousIndex = currentSongIndex - 1;

        if (previousIndex < 0) {
            previousIndex = songs.length - 1;
        }

        playSong(previousIndex);
    }

    // =====================================
    // 8. PLAYER DISPLAY
    // =====================================

    function updatePlayer() {
        const song = getCurrentSong();

        if (!song) {
            playerTitle.textContent = "Select a song";
            playerArtist.textContent = "VIBRA Music";
            playerCover.textContent = "♫";
            playPauseBtn.textContent = "▶";
            likeCurrentBtn.textContent = "♡";
            return;
        }

        playerTitle.textContent = song.title;
        playerArtist.textContent = song.artist;

        if (song.coverUrl) {
            playerCover.innerHTML = `
                <img
                    src="${escapeHTML(song.coverUrl)}"
                    alt=""
                    style="width:100%;height:100%;object-fit:cover;border-radius:inherit"
                >
            `;
        } else {
            playerCover.textContent = song.cover || "♫";
        }

        playPauseBtn.textContent = isPlaying ? "Ⅱ" : "▶";

        const isLiked = likedSongIds.includes(song.id);

        likeCurrentBtn.textContent = isLiked ? "♥" : "♡";
        likeCurrentBtn.style.color = isLiked ? "#ff6b81" : "";

        shuffleBtn.classList.toggle("active", isShuffle);

        repeatBtn.classList.toggle("active", repeatMode !== 0);

        repeatBtn.textContent = repeatMode === 1 ? "↻¹" : "↻";
    }

    // =====================================
    // 9. PLAYER EVENTS
    // =====================================

    playPauseBtn.addEventListener("click", togglePlayPause);

    nextBtn.addEventListener("click", playNext);

    previousBtn.addEventListener("click", playPrevious);

    shuffleBtn.addEventListener("click", () => {
        isShuffle = !isShuffle;

        updatePlayer();

        showToast(isShuffle ? "Shuffle enabled" : "Shuffle disabled");
    });

    repeatBtn.addEventListener("click", () => {
        repeatMode = (repeatMode + 1) % 3;

        updatePlayer();

        const messages = [
            "Repeat disabled",
            "Repeat one enabled",
            "Repeat all enabled"
        ];

        showToast(messages[repeatMode]);
    });

    likeCurrentBtn.addEventListener("click", () => {
        const song = getCurrentSong();

        if (song) {
            toggleLike(song.id);
        }
    });

    audioPlayer.addEventListener("play", () => {
        isPlaying = true;
        updatePlayer();
    });

    audioPlayer.addEventListener("pause", () => {
        isPlaying = false;
        updatePlayer();
    });

    audioPlayer.addEventListener("ended", () => {
        if (repeatMode === 1) {
            audioPlayer.currentTime = 0;

            audioPlayer.play().catch(() => {
                showToast("Unable to replay this song.");
            });

            return;
        }

        if (repeatMode === 2 || currentSongIndex < songs.length - 1 || isShuffle) {
            playNext();
        } else {
            isPlaying = false;
            updatePlayer();
        }
    });

    audioPlayer.addEventListener("timeupdate", () => {
        if (!audioPlayer.duration || !Number.isFinite(audioPlayer.duration)) {
            return;
        }

        const percentage =
            (audioPlayer.currentTime / audioPlayer.duration) * 100;

        progressBar.value = percentage;

        currentTime.textContent = formatTime(audioPlayer.currentTime);
    });

    audioPlayer.addEventListener("loadedmetadata", () => {
        duration.textContent = formatTime(audioPlayer.duration);
    });

    audioPlayer.addEventListener("error", () => {
        if (getCurrentSong()) {
            showToast("Audio could not be loaded.");
        }
    });

    progressBar.addEventListener("input", () => {
        if (audioPlayer.duration && Number.isFinite(audioPlayer.duration)) {
            audioPlayer.currentTime =
                (progressBar.value / 100) * audioPlayer.duration;
        }
    });

    volumeControl.addEventListener("input", () => {
        audioPlayer.volume = Number(volumeControl.value);
    });

    audioPlayer.volume = Number(volumeControl.value);

    // =====================================
    // 10. FAVORITES
    // =====================================

    function toggleLike(songId) {
        if (likedSongIds.includes(songId)) {
            likedSongIds = likedSongIds.filter(id => id !== songId);
            showToast("Removed from Liked Songs");
        } else {
            likedSongIds.push(songId);
            showToast("Added to Liked Songs ♥");
        }

        saveStorage(STORAGE_KEYS.liked, likedSongIds);

        renderAll();
    }

    // =====================================
    // 11. RECENTLY PLAYED
    // =====================================

    function addToRecentlyPlayed(songId) {
        recentSongIds = recentSongIds.filter(id => id !== songId);

        recentSongIds.unshift(songId);

        recentSongIds = recentSongIds.slice(0, 10);

        saveStorage(STORAGE_KEYS.recent, recentSongIds);
    }

    // =====================================
    // 12. NAVIGATION
    // =====================================

    function switchView(viewName, addHistory = true) {
        const validViews = [
            "home",
            "search",
            "library",
            "liked",
            "playlists"
        ];

        if (!validViews.includes(viewName)) {
            return;
        }

        document.querySelectorAll(".view").forEach(view => {
            view.classList.remove("active");
        });

        const target = document.getElementById(`${viewName}View`);

        if (target) {
            target.classList.add("active");
        }

        document.querySelectorAll(".nav-link").forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.view === viewName
            );
        });

        if (addHistory) {
            navigationHistory = navigationHistory.slice(0, historyIndex + 1);

            navigationHistory.push(viewName);

            historyIndex = navigationHistory.length - 1;
        }
    }

    document.addEventListener("click", event => {
        const navButton = event.target.closest("[data-view]");

        if (navButton) {
            switchView(navButton.dataset.view);
        }
    });

    document.getElementById("backBtn").addEventListener("click", () => {
        if (historyIndex > 0) {
            historyIndex--;
            switchView(navigationHistory[historyIndex], false);
        }
    });

    document.getElementById("forwardBtn").addEventListener("click", () => {
        if (historyIndex < navigationHistory.length - 1) {
            historyIndex++;
            switchView(navigationHistory[historyIndex], false);
        }
    });

    // =====================================
    // 13. SEARCH
    // =====================================

    searchInput.addEventListener("input", event => {
        renderSearch(event.target.value);
    });

    // =====================================
    // 14. LOCAL AUDIO UPLOAD
    // =====================================

    audioUpload.addEventListener("change", event => {
        const files = Array.from(event.target.files || []);

        const audioFiles = files.filter(file =>
            file.type.startsWith("audio/")
        );

        if (!audioFiles.length) {
            showToast("Please select valid audio files.");
            return;
        }

        audioFiles.forEach(file => {
            const song = {
                id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                title: file.name.replace(/\.[^/.]+$/, ""),
                artist: "Local Upload",
                album: "My Music",
                src: URL.createObjectURL(file),
                cover: "🎵",
                isLocal: true
            };

            songs.push(song);
        });

        renderAll();

        showToast(`${audioFiles.length} song(s) added successfully`);

        audioUpload.value = "";
    });

    // =====================================
    // 15. PLAYLIST CREATION
    // =====================================

    function openPlaylistModal() {
        playlistModal.classList.add("active");
        playlistNameInput.value = "";
        playlistNameInput.focus();
    }

    function closePlaylistModal() {
        playlistModal.classList.remove("active");
    }

    createPlaylistBtn.addEventListener("click", openPlaylistModal);

    closeModalBtn.addEventListener("click", closePlaylistModal);

    playlistModal.addEventListener("click", event => {
        if (event.target === playlistModal) {
            closePlaylistModal();
        }
    });

    savePlaylistBtn.addEventListener("click", createPlaylist);

    playlistNameInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            createPlaylist();
        }
    });

    function createPlaylist() {
        const name = playlistNameInput.value.trim();

        if (!name) {
            showToast("Please enter a playlist name.");
            playlistNameInput.focus();
            return;
        }

        const playlist = {
            id: `playlist-${Date.now()}`,
            name,
            songs: [],
            createdAt: new Date().toISOString()
        };

        playlists.push(playlist);

        saveStorage(STORAGE_KEYS.playlists, playlists);

        closePlaylistModal();

        renderPlaylists();

        showToast("Playlist created successfully!");
    }

    // =====================================
    // 16. RENDER PLAYLISTS
    // =====================================

    function renderPlaylists() {
        if (!playlists.length) {
            playlistGrid.innerHTML = emptyState(
                "No playlists yet",
                "Create a playlist to organize your favorite music."
            );

            playlistDetails.innerHTML = "";

            return;
        }

        playlistGrid.innerHTML = playlists.map(playlist => `
            <article
                class="playlist-card"
                data-open-playlist="${escapeHTML(playlist.id)}"
            >
                <div class="playlist-cover">♫</div>

                <h3>${escapeHTML(playlist.name)}</h3>

                <p>${playlist.songs.length} songs</p>
            </article>
        `).join("");

        if (selectedPlaylistId) {
            const selected = playlists.find(
                playlist => playlist.id === selectedPlaylistId
            );

            if (selected) {
                renderPlaylistDetails(selected);
            } else {
                selectedPlaylistId = null;
                playlistDetails.innerHTML = "";
            }
        } else {
            playlistDetails.innerHTML = "";
        }
    }

    // =====================================
    // 17. PLAYLIST DETAILS
    // =====================================

    function renderPlaylistDetails(playlist) {
        const playlistSongs = playlist.songs
            .map(id => getSongById(id))
            .filter(Boolean);

        playlistDetails.innerHTML = `
            <div class="section-header">

                <div>
                    <p class="eyebrow">YOUR PLAYLIST</p>
                    <h2>${escapeHTML(playlist.name)}</h2>
                </div>

                <div>
                    <button
                        class="text-button"
                        data-rename-playlist="${escapeHTML(playlist.id)}"
                    >
                        Rename
                    </button>

                    <button
                        class="text-button"
                        data-delete-playlist="${escapeHTML(playlist.id)}"
                    >
                        Delete
                    </button>
                </div>

            </div>

            <p style="color:#a1a1aa;font-size:12px;margin-bottom:18px">
                ${playlistSongs.length} songs
            </p>

            <div class="song-list">

                ${playlistSongs.length
                    ? playlistSongs.map(song => `
                        <div class="song-row">

                            <div class="song-row-cover"
                                 data-play-song="${escapeHTML(song.id)}">
                                ${songCover(song)}
                            </div>

                            <div class="song-row-info"
                                 data-play-song="${escapeHTML(song.id)}">

                                <h3>${escapeHTML(song.title)}</h3>
                                <p>${escapeHTML(song.artist)}</p>

                            </div>

                            <button
                                data-remove-from-playlist="${escapeHTML(song.id)}"
                                title="Remove from playlist"
                                aria-label="Remove song"
                            >
                                ×
                            </button>

                        </div>
                    `).join("")
                    : emptyState("This playlist is empty", "Add songs using the + button in your music library.")
                }

            </div>
        `;
    }

    // =====================================
    // 18. ADD SONG TO PLAYLIST
    // =====================================

    function addSongToPlaylist(songId) {
        if (!playlists.length) {
            showToast("Create a playlist first.");
            return;
        }

        const song = getSongById(songId);

        if (!song) return;

        const playlistOptions = playlists
            .map((playlist, index) => `${index + 1}. ${playlist.name}`)
            .join("\n");

        const answer = prompt(
            `Choose a playlist by number:\n\n${playlistOptions}`
        );

        if (answer === null) return;

        const index = Number(answer) - 1;

        if (!Number.isInteger(index) || index < 0 || index >= playlists.length) {
            showToast("Invalid playlist selection.");
            return;
        }

        const playlist = playlists[index];

        if (playlist.songs.includes(songId)) {
            showToast("Song is already in this playlist.");
            return;
        }

        playlist.songs.push(songId);

        saveStorage(STORAGE_KEYS.playlists, playlists);

        renderPlaylists();

        showToast("Song added to playlist!");
    }

    // =====================================
    // 19. REMOVE SONG FROM PLAYLIST
    // =====================================

    function removeSongFromPlaylist(songId) {
        const playlist = playlists.find(
            item => item.id === selectedPlaylistId
        );

        if (!playlist) return;

        playlist.songs = playlist.songs.filter(id => id !== songId);

        saveStorage(STORAGE_KEYS.playlists, playlists);

        renderPlaylists();

        showToast("Song removed from playlist.");
    }

    // =====================================
    // 20. RENAME PLAYLIST
    // =====================================

    function renamePlaylist(playlistId) {
        const playlist = playlists.find(
            item => item.id === playlistId
        );

        if (!playlist) return;

        const newName = prompt("Enter the new playlist name:", playlist.name);

        if (newName === null) return;

        const trimmedName = newName.trim();

        if (!trimmedName) {
            showToast("Playlist name cannot be empty.");
            return;
        }

        playlist.name = trimmedName.slice(0, 40);

        saveStorage(STORAGE_KEYS.playlists, playlists);

        renderPlaylists();

        showToast("Playlist renamed.");
    }

    // =====================================
    // 21. DELETE PLAYLIST
    // =====================================

    function deletePlaylist(playlistId) {
        const playlist = playlists.find(
            item => item.id === playlistId
        );

        if (!playlist) return;

        const confirmed = confirm(
            `Are you sure you want to delete "${playlist.name}"?`
        );

        if (!confirmed) return;

        playlists = playlists.filter(
            item => item.id !== playlistId
        );

        if (selectedPlaylistId === playlistId) {
            selectedPlaylistId = null;
        }

        saveStorage(STORAGE_KEYS.playlists, playlists);

        renderPlaylists();

        showToast("Playlist deleted.");
    }

    // =====================================
    // 22. GLOBAL CLICK HANDLER
    // =====================================

    document.addEventListener("click", event => {

        const playButton = event.target.closest("[data-play-song]");

        if (playButton) {
            const song = getSongById(playButton.dataset.playSong);

            if (song) {
                const index = songs.findIndex(item => item.id === song.id);
                playSong(index);
            }

            return;
        }

        const likeButton = event.target.closest("[data-like-song]");

        if (likeButton) {
            toggleLike(likeButton.dataset.likeSong);
            return;
        }

        const addButton = event.target.closest("[data-add-song]");

        if (addButton) {
            addSongToPlaylist(addButton.dataset.addSong);
            return;
        }

        const playlistButton = event.target.closest("[data-open-playlist]");

        if (playlistButton) {
            selectedPlaylistId = playlistButton.dataset.openPlaylist;

            const playlist = playlists.find(
                item => item.id === selectedPlaylistId
            );

            if (playlist) {
                renderPlaylistDetails(playlist);
            }

            return;
        }

        const removeButton = event.target.closest("[data-remove-from-playlist]");

        if (removeButton) {
            removeSongFromPlaylist(removeButton.dataset.removeFromPlaylist);
            return;
        }

        const renameButton = event.target.closest("[data-rename-playlist]");

        if (renameButton) {
            renamePlaylist(renameButton.dataset.renamePlaylist);
            return;
        }

        const deleteButton = event.target.closest("[data-delete-playlist]");

        if (deleteButton) {
            deletePlaylist(deleteButton.dataset.deletePlaylist);
        }

    });

    // =====================================
    // 23. KEYBOARD SHORTCUTS
    // =====================================

    document.addEventListener("keydown", event => {

        const tag = event.target.tagName;

        const isTyping =
            tag === "INPUT" ||
            tag === "TEXTAREA" ||
            event.target.isContentEditable;

        if (isTyping) return;

        if (event.code === "Space") {
            event.preventDefault();
            togglePlayPause();
        }

        if (event.code === "ArrowRight" && audioPlayer.duration) {
            audioPlayer.currentTime = Math.min(
                audioPlayer.currentTime + 5,
                audioPlayer.duration
            );
        }

        if (event.code === "ArrowLeft" && audioPlayer.duration) {
            audioPlayer.currentTime = Math.max(
                audioPlayer.currentTime - 5,
                0
            );
        }

        if (event.code === "ArrowUp") {
            event.preventDefault();

            audioPlayer.volume = Math.min(audioPlayer.volume + 0.05, 1);
            volumeControl.value = audioPlayer.volume;
        }

        if (event.code === "ArrowDown") {
            event.preventDefault();

            audioPlayer.volume = Math.max(audioPlayer.volume - 0.05, 0);
            volumeControl.value = audioPlayer.volume;
        }

    });

    // =====================================
    // 24. INITIALIZE APPLICATION
    // =====================================

    function initializeApp() {

        likedSongIds = likedSongIds.filter(
            id => songs.some(song => song.id === id)
        );

        recentSongIds = recentSongIds.filter(
            id => songs.some(song => song.id === id)
        );

        renderAll();

        switchView("home", false);

        console.log("VIBRA initialized successfully.");
    }

    initializeApp();

});
