
/* =========================================
   VIBRA - MUSIC PLAYER
   Vanilla JavaScript
========================================= */


/* DOM ELEMENTS */

const audio = document.getElementById("audioPlayer");

const playButton = document.getElementById("playButton");
const previousButton = document.getElementById("previousButton");
const nextButton = document.getElementById("nextButton");

const shuffleButton = document.getElementById("shuffleButton");
const repeatButton = document.getElementById("repeatButton");

const progressBar = document.getElementById("progressBar");
const volumeBar = document.getElementById("volumeBar");

const currentTimeElement = document.getElementById("currentTime");
const durationElement = document.getElementById("duration");

const playerTitle = document.getElementById("playerTitle");
const playerArtist = document.getElementById("playerArtist");
const playerArt = document.getElementById("playerArt");
const playerLike = document.getElementById("playerLike");

const searchInput = document.getElementById("searchInput");
const clearSearch = document.getElementById("clearSearch");

const fileInput = document.getElementById("fileInput");


/* MUSIC COLLECTION */

const songs = [
    {
        id: "demo-1",
        title: "SoundHelix Song 1",
        artist: "Demo Artist",
        album: "Sample Collection",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        duration: "Sample",
        color: "linear-gradient(135deg, #9333ea, #312e81)",
        uploaded: false
    },
    {
        id: "demo-2",
        title: "SoundHelix Song 2",
        artist: "Demo Artist",
        album: "Sample Collection",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        duration: "Sample",
        color: "linear-gradient(135deg, #ec4899, #831843)",
        uploaded: false
    },
    {
        id: "demo-3",
        title: "SoundHelix Song 3",
        artist: "Demo Artist",
        album: "Sample Collection",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        duration: "Sample",
        color: "linear-gradient(135deg, #2563eb, #164e63)",
        uploaded: false
    }
];


/* APPLICATION STATE */

let currentSongIndex = -1;

let isPlaying = false;
let isShuffling = false;
let repeatMode = 0;
// 0 = Off
// 1 = Repeat all
// 2 = Repeat one

let currentFilter = "all";
let currentView = "home";

let uploadedSongs = [];

let favorites = JSON.parse(
    localStorage.getItem("vibraFavorites") || "[]"
);

let searchHistory = [];


/* HELPER FUNCTIONS */

function getAllSongs() {
    return [...songs, ...uploadedSongs];
}

function getCurrentSong() {
    return getAllSongs()[currentSongIndex] || null;
}

function formatTime(seconds) {
    if (!Number.isFinite(seconds)) {
        return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function saveFavorites() {
    localStorage.setItem(
        "vibraFavorites",
        JSON.stringify(favorites)
    );
}

function isFavorite(songId) {
    return favorites.includes(songId);
}


/* NAVIGATION */

function showView(viewName) {

    const targetView = document.getElementById(
        `${viewName}View`
    );

    if (!targetView) return;

    document.querySelectorAll(".view").forEach(view => {
        view.classList.remove("active");
    });

    targetView.classList.add("active");

    document.querySelectorAll(".nav-item").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.view === viewName
        );
    });

    currentView = viewName;

    if (viewName === "home") {
        renderHome();
    }

    if (viewName === "library") {
        renderLibrary();
    }

    if (viewName === "favorites") {
        renderFavorites();
    }

    if (viewName === "uploads") {
        renderUploads();
    }

    if (viewName === "search") {
        renderSearch(searchInput.value);
    }

    document.getElementById("contentArea").scrollTop = 0;
}


/* NAVIGATION BUTTONS */

document.querySelectorAll(".nav-item").forEach(button => {

    button.addEventListener("click", () => {
        showView(button.dataset.view);
    });

});

document.querySelectorAll("[data-view]").forEach(button => {

    button.addEventListener("click", () => {
        showView(button.dataset.view);
    });

});


/* CATEGORY CARDS */

document.querySelectorAll("[data-category]").forEach(card => {

    card.addEventListener("click", () => {

        const category = card.dataset.category;

        if (category === "favorites") {
            showView("favorites");
        } else if (category === "uploads") {
            showView("uploads");
        } else {
            showView("library");
        }

    });

});


/* HOME PAGE */

function renderHome() {

    const container = document.getElementById("homeTrackList");

    const allSongs = getAllSongs();

    const recentSongs = [...allSongs].reverse().slice(0, 5);

    renderTrackList(recentSongs, container);

}


/* LIBRARY */

function renderLibrary() {

    const container = document.getElementById("libraryTrackList");

    let filteredSongs = getAllSongs();

    if (currentFilter === "favorites") {
        filteredSongs = filteredSongs.filter(song =>
            isFavorite(song.id)
        );
    }

    if (currentFilter === "uploads") {
        filteredSongs = uploadedSongs;
    }

    renderTrackList(filteredSongs, container);

}

document.querySelectorAll(".filter-tab").forEach(button => {

    button.addEventListener("click", () => {

        document.querySelectorAll(".filter-tab").forEach(tab => {
            tab.classList.remove("active");
        });

        button.classList.add("active");

        currentFilter = button.dataset.filter;

        renderLibrary();

    });

});


/* FAVORITES */

function renderFavorites() {

    const favoriteSongs = getAllSongs().filter(song =>
        isFavorite(song.id)
    );

    renderTrackList(
        favoriteSongs,
        document.getElementById("favoritesTrackList")
    );

}


/* UPLOADED SONGS */

function renderUploads() {

    renderTrackList(
        uploadedSongs,
        document.getElementById("uploadsTrackList")
    );

}


/* TRACK LIST RENDERING */

function renderTrackList(trackArray, container) {

    if (!trackArray.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">♫</div>
                <h2>Nothing here yet</h2>
                <p>Add music or explore your collection to get started.</p>
            </div>
        `;

        return;
    }

    container.innerHTML = trackArray.map(song => {

        const index = getAllSongs().findIndex(
            item => item.id === song.id
        );

        const isCurrent = index === currentSongIndex;

        return `
            <div class="track-row ${isCurrent ? "playing" : ""}">

                <div
                    class="track-cover"
                    style="background: ${song.color}"
                >
                    ♪
                </div>

                <div
                    class="track-details"
                    data-index="${index}"
                >
                    <h4>${escapeHTML(song.title)}</h4>
                    <p>${escapeHTML(song.artist)}</p>
                </div>

                <div class="track-duration">
                    ${song.duration || "—"}
                </div>

                <div class="track-actions">

                    <button
                        class="track-like ${isFavorite(song.id) ? "liked" : ""}"
                        data-like="${escapeHTML(song.id)}"
                        aria-label="Toggle favorite"
                    >
                        ${isFavorite(song.id) ? "♥" : "♡"}
                    </button>

                </div>

            </div>
        `;

    }).join("");


    container.querySelectorAll(".track-details").forEach(element => {

        element.addEventListener("click", () => {

            playSong(Number(element.dataset.index));

        });

    });


    container.querySelectorAll(".track-like").forEach(button => {

        button.addEventListener("click", () => {

            toggleFavorite(button.dataset.like);

        });

    });

}


/* BASIC HTML ESCAPING */

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, character => {

        const replacements = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return replacements[character];

    });

}


/* PLAY SONG */

async function playSong(index) {

    const allSongs = getAllSongs();

    if (index < 0 || index >= allSongs.length) {
        return;
    }

    currentSongIndex = index;

    const song = allSongs[index];

    if (!song || !song.src) return;

    audio.pause();

    audio.src = song.src;

    playerTitle.textContent = song.title;
    playerArtist.textContent = song.artist;

    playerArt.style.background = song.color;

    playerArt.innerHTML = "<span>♫</span>";

    playerLike.textContent = isFavorite(song.id) ? "♥" : "♡";

    playerLike.classList.toggle(
        "liked",
        isFavorite(song.id)
    );

    progressBar.value = 0;

    currentTimeElement.textContent = "0:00";
    durationElement.textContent = "0:00";

    try {

        await audio.play();

        isPlaying = true;

        updatePlayButton();

    } catch (error) {

        isPlaying = false;

        updatePlayButton();

        console.error("Playback failed:", error);

        alert(
            "Unable to play this track. Check your internet connection or select another audio file."
        );

    }

    refreshTrackLists();

}


/* PLAY / PAUSE */

async function togglePlay() {

    if (currentSongIndex === -1) {

        if (!getAllSongs().length) {
            alert("Please add some music first.");
            return;
        }

        await playSong(0);
        return;

    }

    if (audio.paused) {

        try {

            await audio.play();

            isPlaying = true;

        } catch (error) {

            console.error("Playback error:", error);

        }

    } else {

        audio.pause();

        isPlaying = false;

    }

    updatePlayButton();

}

function updatePlayButton() {

    playButton.textContent = isPlaying ? "Ⅱ" : "▶";

    playButton.title = isPlaying ? "Pause" : "Play";

}

playButton.addEventListener("click", togglePlay);

audio.addEventListener("play", () => {

    isPlaying = true;
    updatePlayButton();

});

audio.addEventListener("pause", () => {

    isPlaying = false;
    updatePlayButton();

});


/* NEXT SONG */

function nextSong() {

    const allSongs = getAllSongs();

    if (!allSongs.length) return;

    if (isShuffling && allSongs.length > 1) {

        let randomIndex;

        do {

            randomIndex = Math.floor(
                Math.random() * allSongs.length
            );

        } while (randomIndex === currentSongIndex);

        playSong(randomIndex);

    } else {

        const nextIndex =
            (currentSongIndex + 1) % allSongs.length;

        playSong(nextIndex);

    }

}


/* PREVIOUS SONG */

function previousSong() {

    const allSongs = getAllSongs();

    if (!allSongs.length) return;

    if (audio.currentTime > 3) {

        audio.currentTime = 0;
        return;

    }

    const previousIndex =
        (currentSongIndex - 1 + allSongs.length) % allSongs.length;

    playSong(previousIndex);

}

nextButton.addEventListener("click", nextSong);

previousButton.addEventListener("click", previousSong);


/* AUTOMATIC NEXT TRACK */

audio.addEventListener("ended", () => {

    if (repeatMode === 2) {

        audio.currentTime = 0;

        audio.play().catch(console.error);

        return;

    }

    const allSongs = getAllSongs();

    if (currentSongIndex < allSongs.length - 1) {

        nextSong();

    } else if (repeatMode === 1) {

        playSong(0);

    } else {

        isPlaying = false;

        updatePlayButton();

    }

});


/* SHUFFLE */

shuffleButton.addEventListener("click", () => {

    isShuffling = !isShuffling;

    shuffleButton.classList.toggle(
        "enabled",
        isShuffling
    );

});


/* REPEAT */

repeatButton.addEventListener("click", () => {

    repeatMode = (repeatMode + 1) % 3;

    const labels = [
        "Repeat off",
        "Repeat all",
        "Repeat one"
    ];

    repeatButton.title = labels[repeatMode];

    repeatButton.classList.toggle(
        "enabled",
        repeatMode !== 0
    );

    repeatButton.textContent =
        repeatMode === 2 ? "↻¹" : "↻";

});


/* PROGRESS BAR */

audio.addEventListener("loadedmetadata", () => {

    durationElement.textContent = formatTime(audio.duration);

});

audio.addEventListener("timeupdate", () => {

    if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
        return;
    }

    const percentage =
        (audio.currentTime / audio.duration) * 100;

    progressBar.value = percentage;

    currentTimeElement.textContent =
        formatTime(audio.currentTime);

    durationElement.textContent =
        formatTime(audio.duration);

});

progressBar.addEventListener("input", () => {

    if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
        return;
    }

    audio.currentTime =
        (Number(progressBar.value) / 100) * audio.duration;

});


/* VOLUME */

audio.volume = 0.7;

volumeBar.addEventListener("input", () => {

    audio.volume = Number(volumeBar.value) / 100;

});


/* FAVORITE MANAGEMENT */

function toggleFavorite(songId) {

    if (isFavorite(songId)) {

        favorites = favorites.filter(id => id !== songId);

    } else {

        favorites.push(songId);

    }

    saveFavorites();

    const currentSong = getCurrentSong();

    if (currentSong && currentSong.id === songId) {

        playerLike.textContent =
            isFavorite(songId) ? "♥" : "♡";

        playerLike.classList.toggle(
            "liked",
            isFavorite(songId)
        );

    }

    refreshTrackLists();

}

playerLike.addEventListener("click", () => {

    const currentSong = getCurrentSong();

    if (!currentSong) return;

    toggleFavorite(currentSong.id);

});


/* REFRESH ALL MUSIC LISTS */

function refreshTrackLists() {

    renderHome();

    renderLibrary();

    renderFavorites();

    renderUploads();

    if (currentView === "search") {
        renderSearch(searchInput.value);
    }

}


/* SEARCH */

function renderSearch(query) {

    const container = document.getElementById("searchResults");

    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⌕</div>
                <h2>Search your music</h2>
                <p>Enter a song title or artist above.</p>
            </div>
        `;

        return;

    }

    const results = getAllSongs().filter(song => {

        return (
            song.title.toLowerCase().includes(normalizedQuery) ||
            song.artist.toLowerCase().includes(normalizedQuery) ||
            song.album.toLowerCase().includes(normalizedQuery)
        );

    });

    renderTrackList(results, container);

}

searchInput.addEventListener("input", () => {

    const query = searchInput.value;

    clearSearch.style.display = query ? "block" : "none";

    showView("search");

    renderSearch(query);

});

clearSearch.addEventListener("click", () => {

    searchInput.value = "";

    clearSearch.style.display = "none";

    renderSearch("");

    searchInput.focus();

});


/* UPLOAD MUSIC */

function openFilePicker() {

    fileInput.click();

}

document.getElementById("uploadButton").addEventListener(
    "click",
    openFilePicker
);

document.getElementById("sidebarUpload").addEventListener(
    "click",
    openFilePicker
);

document.getElementById("uploadFromPage").addEventListener(
    "click",
    openFilePicker
);


function addMusicFiles(files) {

    const audioFiles = Array.from(files).filter(file => {

        return file.type.startsWith("audio/");

    });

    if (!audioFiles.length) {

        alert("Please select valid audio files.");

        return;

    }

    audioFiles.forEach(file => {

        const song = {

            id: "upload-" + crypto.randomUUID(),

            title: file.name.replace(/\.[^/.]+$/, ""),

            artist: "Local Music",

            album: "Your Uploads",

            src: URL.createObjectURL(file),

            duration: "—",

            color: getRandomColor(),

            uploaded: true

        };

        uploadedSongs.push(song);

        audio.addEventListener("loadedmetadata", function handler() {

            if (audio.src === song.src) {

                song.duration = formatTime(audio.duration);

                audio.removeEventListener(
                    "loadedmetadata",
                    handler
                );

                refreshTrackLists();

            }

        });

    });

    refreshTrackLists();

    showView("uploads");

}

fileInput.addEventListener("change", () => {

    addMusicFiles(fileInput.files);

    fileInput.value = "";

});


/* RANDOM COVER COLORS */

function getRandomColor() {

    const colors = [
        "linear-gradient(135deg, #9333ea, #312e81)",
        "linear-gradient(135deg, #ec4899, #831843)",
        "linear-gradient(135deg, #2563eb, #164e63)",
        "linear-gradient(135deg, #059669, #064e3b)",
        "linear-gradient(135deg, #f97316, #7c2d12)",
        "linear-gradient(135deg, #db2777, #581c87)"
    ];

    return colors[
        Math.floor(Math.random() * colors.length)
    ];

}


/* DRAG AND DROP MUSIC UPLOAD */

const dropzone = document.getElementById("uploadDropzone");

dropzone.addEventListener("dragover", event => {

    event.preventDefault();

    dropzone.classList.add("dragging");

});

dropzone.addEventListener("dragleave", () => {

    dropzone.classList.remove("dragging");

});

dropzone.addEventListener("drop", event => {

    event.preventDefault();

    dropzone.classList.remove("dragging");

    addMusicFiles(event.dataTransfer.files);

});


/* KEYBOARD SHORTCUTS */

document.addEventListener("keydown", event => {

    const activeElement = document.activeElement;

    const isTyping =
        activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA";

    if (isTyping) return;

    if (event.code === "Space") {

        event.preventDefault();

        togglePlay();

    }

    if (event.code === "ArrowRight") {

        if (Number.isFinite(audio.duration)) {
            audio.currentTime = Math.min(
                audio.currentTime + 5,
                audio.duration
            );
        }

    }

    if (event.code === "ArrowLeft") {

        audio.currentTime = Math.max(
            audio.currentTime - 5,
            0
        );

    }

});


/* BACK / FORWARD NAVIGATION */

document.getElementById("backButton").addEventListener(
    "click",
    () => showView("home")
);

document.getElementById("forwardButton").addEventListener(
    "click",
    () => showView("library")
);


/* AUDIO ERROR HANDLING */

audio.addEventListener("error", () => {

    if (audio.src) {

        isPlaying = false;

        updatePlayButton();

        console.error(
            "The audio file could not be loaded."
        );

    }

});


/* INITIALIZE APPLICATION */

function initializeApp() {

    renderHome();

    renderLibrary();

    renderFavorites();

    renderUploads();

    updatePlayButton();

    console.log("VIBRA Music Player initialized successfully.");

}

initializeApp();
