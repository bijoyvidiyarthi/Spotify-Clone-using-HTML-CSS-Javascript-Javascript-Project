class MusicPlayer {
    constructor(apiBase) {
        this.apiBase = apiBase;
        this.audio = new Audio();
        this.songs = [];      // raw song URLs
        this.images = [];     // image file names
        this.songObjs = [];   // [{name, artist, url, img}, ...]

        // track current song object and folder
        this.currentSong = null;
        this.currentFolder = ""; // initialize

        this.loop = false;

        // UI — may be null if element missing; we guard usage later
        this.songList = document.querySelector(".songList ul");
        this.playlistPlayBtns = document.querySelectorAll(".Play-Btn, .Pause-Btn");
        this.playButton = document.querySelector(".playbtn") || document.querySelector(".pausebtn");
        this.prevButton = document.querySelector(".prev");
        this.nextButton = document.querySelector(".next");
        this.seekbar = document.querySelector(".seekbar");
        this.currTime = document.querySelector(".current-time");
        this.totalTime = document.querySelector(".total-time");
        this.songNameDisplay = document.querySelector(".song-title a");
        this.artistNameDisplay = document.querySelector(".desc a");
        this.coverImg = document.querySelector(".song-cover img");
        this.volumeBar = document.getElementById("volume-bar");
        this.volIcon = document.getElementById("volume-icon");

        // Default volume
        this.audio.volume = 0.5;
        if (this.volumeBar) {
            this.volumeBar.value = Math.round(this.audio.volume * 100);
            this.volumeBar.style.setProperty("--vol-progress", `${this.volumeBar.value}%`);
        }

        this.init();
    }

    async init() {
        try {
            // load an initial library (you can change this)
            await this.loadLibrary("songs/folder1", { autoplay: false });
            this.bindControls();
        } catch (err) {
            console.error("Failed to initialize MusicPlayer:", err);
        }
    }

    // load a folder (songLibrary) into the player
    async loadLibrary(songFolder, { autoplay = false } = {}) {
        try {
            if (this.currentFolder && this.currentFolder !== songFolder) {
                this.resetFolderPlayBtn();
                this.audio.pause();
                this.updatePlayButton(false);
            }

            this.currentFolder = songFolder;

            // fetch songs from folder
            this.songs = await this.fetchSongs(this.currentFolder);

            // fetch images (do it here so buildSong can match images)
            this.images = await this.fetchImages();

            // build song objects
            this.songObjs = this.songs.map(url => this.buildSong(url));

            // render list and load first track (do not autoplay unless requested)
            this.renderSongList();
            if (this.songObjs.length > 0) {
                this.currentSong = this.songObjs[0];
                this.loadTrack(this.currentSong);
                if (autoplay) await this.playTrack(this.currentSong);
            } else {
                // no songs found — clear UI
                if (this.songNameDisplay) this.songNameDisplay.textContent = "No songs";
                if (this.artistNameDisplay) this.artistNameDisplay.textContent = "";
                if (this.coverImg) {
                    this.coverImg.src = `/playlist-covers/playlist-1.jpg`;
                    this.coverImg.alt = `Playlist Cover`;
                }
            }
        } catch (err) {
            console.error("loadLibrary error:", err);
        }
    }

    getFolderPlayBtn() {
        if (!this.currentFolder) return null;
        const folderName = this.currentFolder.split('/')[1];
        const card = document.querySelector(`.music-card[data-folder="${folderName}"]`);
        if (!card) return null;
        return card.querySelector(".Play-Btn, .Pause-Btn");
    }

    resetFolderPlayBtn() {
        const btn = this.getFolderPlayBtn();
        if (btn) {
            btn.src = "Play-Btn.svg";
            btn.classList.add("Play-Btn");
            btn.classList.remove("Pause-Btn");
            btn.classList.remove("active");
        }
    }

    // ---- fetching helpers ----
    async fetchSongs(songFolder) {
        // songFolder should be something like "songs/folder1"
        this.currentFolder = songFolder;
        const res = await fetch(`${this.apiBase}/${this.currentFolder}`);
        const html = await res.text();
        const div = document.createElement("div");
        div.innerHTML = html;

        return Array.from(div.querySelectorAll("a"))
            .map(a => a.href)
            .filter(h => typeof h === "string" && h.toLowerCase().endsWith(".mp3"));
    }

    async fetchImages() {
        const res = await fetch(`${this.apiBase}/images`);
        const html = await res.text();
        const div = document.createElement("div");
        div.innerHTML = html;

        return Array.from(div.querySelectorAll("a"))
            .map(a => {
                try {
                    const href = a.href || "";
                    return decodeURIComponent(href.split("/").pop() || "");
                } catch (e) {
                    return null;
                }
            })
            .filter(Boolean)
            .filter(f => /\.(jpe?g|png|gif)$/i.test(f));
    }

    buildSong(url) {
        const filename = decodeURIComponent(url.split("/").pop() || url);
        const base = filename.replace(/\.mp3$/i, "").trim();
        const parts = base.split("-");
        const songName = (parts[0] || base).trim();
        const artistName = parts.length > 1 ? parts.slice(1).join("-").trim() : "Unknown Artist";
        const matchedImg = this.images.find(img => img.toLowerCase().startsWith(songName.toLowerCase()));
        return { name: songName, artist: artistName, url, img: matchedImg };
    }

    formatTime(seconds = 0) {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, "0")}`;
    }

    loadTrack(track) {
        if (!track) return;
        this.audio.src = track.url;
        if (this.songNameDisplay) this.songNameDisplay.textContent = track.name;
        if (this.artistNameDisplay) this.artistNameDisplay.textContent = track.artist;
        if (track.img && this.coverImg) {
            this.coverImg.src = `/images/${track.img}`;
            this.coverImg.alt = `${track.name} cover`;
        } else if (this.coverImg) {
            this.coverImg.src = `/playlist-covers/playlist-1.jpg`;
            this.coverImg.alt = `Song Cover Image`;
        }
        this.updatePlayingHighlight();
    }

    async playTrack(track) {
        if (!track) return;
        this.currentSong = track;
        this.loadTrack(track);
        try {
            await this.audio.play();
            this.updatePlayButton(true);
        } catch (err) {
            console.error("Play failed:", err);
            this.updatePlayButton(false);
        }
    }

    togglePlayPause() {
        if (this.audio.paused) {
            this.audio.play().then(() => this.updatePlayButton(true)).catch(e => console.error(e));
        } else {
            this.audio.pause();
            this.updatePlayButton(false);
        }
    }

    updatePlayButton(isPlaying) {
        if (this.playButton) {
            this.playButton.src = isPlaying ? "pause.svg" : "play.svg";
            this.playButton.classList.toggle("playbtn", !isPlaying);
            this.playButton.classList.toggle("pausebtn", isPlaying);
            this.playButton.classList.toggle("active", isPlaying);
        }

        const folderBtn = this.getFolderPlayBtn();
        if (folderBtn) {
            folderBtn.src = isPlaying ? "Pause-Btn.svg" : "Play-Btn.svg";
            folderBtn.classList.toggle("Play-Btn", !isPlaying);
            folderBtn.classList.toggle("Pause-Btn", isPlaying);
            folderBtn.classList.toggle("active", isPlaying);
        }
    }

    playNext() {
        if (!this.currentSong) {
            if (this.songObjs.length) return this.playTrack(this.songObjs[0]);
            return;
        }
        const idx = this.songObjs.findIndex(s => s.url === this.currentSong.url);
        const nextIdx = idx + 1;
        if (nextIdx < this.songObjs.length) {
            this.playTrack(this.songObjs[nextIdx]);
        } else if (this.loop && this.songObjs.length) {
            this.playTrack(this.songObjs[0]);
        } else {
            this.audio.pause();
            this.updatePlayButton(false);
        }
    }

    playPrev() {
        if (!this.currentSong) {
            if (this.songObjs.length) return this.playTrack(this.songObjs[this.songObjs.length - 1]);
            return;
        }
        const idx = this.songObjs.findIndex(s => s.url === this.currentSong.url);
        const prevIdx = idx - 1;
        if (prevIdx >= 0) {
            this.playTrack(this.songObjs[prevIdx]);
        } else if (this.loop && this.songObjs.length) {
            this.playTrack(this.songObjs[this.songObjs.length - 1]);
        } else {
            this.audio.currentTime = 0;
            this.audio.pause();
            this.updatePlayButton(false);
        }
    }

    updateSeekbar() {
        const current = this.audio.currentTime || 0;
        const duration = this.audio.duration || 0;
        const percent = duration ? (current / duration) * 100 : 0;
        if (this.seekbar) {
            this.seekbar.value = current;
            this.seekbar.max = duration || 0;
            this.seekbar.style.setProperty("--seek-progress", `${percent}%`);
        }
        if (this.currTime) this.currTime.textContent = this.formatTime(current);
        if (this.totalTime) this.totalTime.textContent = duration ? this.formatTime(duration) : "0:00";
    }

    updateVolumeUI(value) {
        const pct = Math.round(value * 100);
        if (this.volumeBar) this.volumeBar.style.setProperty("--vol-progress", `${pct}%`);
        if (this.volIcon) {
            if (value === 0) this.volIcon.src = "mute.svg";
            else if (value < 0.5) this.volIcon.src = "volume-low.svg";
            else this.volIcon.src = "sound.svg";
        }
    }

    updatePlayingHighlight() {
        if (!this.songList) return;
        const lis = Array.from(this.songList.children);
        lis.forEach(li => li.classList.remove("playing"));
        if (!this.currentSong) return;
        const matchLi = lis.find(li => (li.dataset.url || "") === (this.currentSong.url || ""));
        if (matchLi) matchLi.classList.add("playing");
    }

    bindControls() {
        this.playlistPlayBtns.forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const card = btn.closest(".music-card");
                if (!card) return;
                const folderName = card.dataset.folder;
                const folder = `songs/${folderName}`;
                if (this.currentFolder === folder) {
                    this.togglePlayPause();
                } else {
                    this.loadLibrary(folder, { autoplay: true });
                }
            });
        });

        if (this.playButton) this.playButton.addEventListener("click", () => this.togglePlayPause());
        if (this.prevButton) this.prevButton.addEventListener("click", () => this.playPrev());
        if (this.nextButton) this.nextButton.addEventListener("click", () => this.playNext());

        if (this.seekbar) {
            this.seekbar.addEventListener("input", () => {
                this.audio.currentTime = parseFloat(this.seekbar.value) || 0;
            });
        }

        this.audio.addEventListener("loadedmetadata", () => {
            if (this.seekbar) this.seekbar.max = this.audio.duration || 0;
            this.updateSeekbar();
        });

        this.audio.addEventListener("timeupdate", () => this.updateSeekbar());
        this.audio.addEventListener("ended", () => this.playNext());

        if (this.volumeBar) {
            this.volumeBar.addEventListener("input", (e) => {
                const raw = (typeof e.target.valueAsNumber === "number") ? e.target.valueAsNumber : parseFloat(e.target.value);
                const vol = Math.max(0, Math.min(1, (raw || 0) / 100));
                this.audio.volume = vol;
                this.updateVolumeUI(vol);
            });
        }

        this.updateVolumeUI(this.audio.volume);
    }

    renderSongList() {
        if (!this.songList) return;
        this.songList.innerHTML = "";
        this.songObjs.forEach(track => {
            const li = document.createElement("li");
            li.dataset.url = track.url;
            li.innerHTML = `
                <img class="icon invert" src="music.svg" alt="music icon">
                <div class="songInfo">
                    <div class="SongName">${track.name}</div>
                    <div class="artistName hover-white">${track.artist}</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="icon" src="play.svg" alt="play icon">
                </div>`;
            li.addEventListener("click", () => this.playTrack(track));
            this.songList.appendChild(li);
        });
        this.updatePlayingHighlight();
    }
}

// displayAlbum: build .music-card list from songs/info.json
// - player: instance of MusicPlayer (used for loadLibrary / currentFolder)
async function displayAlbum(player) {
    const apiBase = (player && player.apiBase) ? player.apiBase.replace(/\/$/, "") : "";
    const cardContainer = document.querySelector(".card-container");
    if (!cardContainer) {
        console.warn("No .card-container found in DOM");
        return;
    }

    // clear existing cards
    cardContainer.innerHTML = "";

    try {
        // fetch info.json from songs/info.json
        const infoUrl = `${apiBase}/songs/info.json`;
        const res = await fetch(infoUrl);
        if (!res.ok) {
            throw new Error(`info.json not found at ${infoUrl} (status ${res.status})`);
        }
        const info = await res.json(); // expected to be an array

        // Build cards. Map array index -> folderN (folder1, folder2, ...)
        info.forEach((cardInfo = {}, idx) => {
            const folderName = `folder${idx + 1}`; // matches your /songs/folder1, folder2, ...
            const card = document.createElement("div");
            card.className = "music-card flex flex-column justify-center";
            card.dataset.folder = folderName;

            // Use provided image path in info.json (e.g. "playlist-covers/playlist-1.jpg")
            const imgSrc = cardInfo.image || "playlist-covers/playlist-1.jpg";
            const title = cardInfo.title || folderName;
            const desc = cardInfo.description || "";

            card.innerHTML = `
                <div class="playlist-cover">
                    <img src="${imgSrc}" alt="song-cover-img">
                    <button class="btn-prim" aria-label="Play ${title}">
                        <img class="Play-Btn" src="Play-Btn.svg" alt="play button">
                    </button>
                </div>
                <div class="playlist-details flex flex-column">
                    <span class="title"><a href="#">${title}</a></span>
                    <span class="description">${desc}</span>
                </div>
            `;

            // card click → load library (no autoplay)
            card.addEventListener("click", async (ev) => {
                ev.stopPropagation();
                card.classList.add("loading");
                try {
                    await player.loadLibrary(`songs/${folderName}`, { autoplay: false });
                } catch (err) {
                    console.error("Failed to load library for", folderName, err);
                } finally {
                    card.classList.remove("loading");
                }
            });

            // play button click → toggle or load+autoplay
            const playBtnWrapper = card.querySelector(".btn-prim");
            if (playBtnWrapper) {
                playBtnWrapper.addEventListener("click", async (ev) => {
                    ev.stopPropagation();
                    card.classList.add("loading");
                    try {
                        const folderPath = `songs/${folderName}`;
                        // if same folder loaded → toggle pause/resume
                        if (player.currentFolder === folderPath) {
                            if (!player.audio.paused) {
                                player.audio.pause();
                                player.updatePlayButton(false);
                            } else {
                                await player.audio.play();
                                player.updatePlayButton(true);
                            }
                        } else {
                            // different folder → load & autoplay
                            await player.loadLibrary(folderPath, { autoplay: true });
                        }
                    } catch (err) {
                        console.error("Play button action failed for", folderName, err);
                    } finally {
                        card.classList.remove("loading");
                    }
                });
            }

            cardContainer.appendChild(card);
        });

    } catch (err) {
        console.error("displayAlbum error:", err);
        // Optional fallback: try local relative path if apiBase fetch failed
        try {
            const r2 = await fetch("/songs/info.json");
            if (r2.ok) {
                const info = await r2.json();
                // naive fallback: recursively call displayAlbum with virtual player that has empty apiBase
                // (or you can re-run this function using player with apiBase = "")
                console.warn("Fetched fallback /songs/info.json — consider updating apiBase");
            }
        } catch (e2) {
            console.warn("Fallback info.json fetch also failed", e2);
        }
    }
}


// INIT (guarded event listeners)
(function () {

    const player = new MusicPlayer("http://127.0.0.1:3000");


    const container = document.querySelector(".scroll-container");
    if (container) {
        let timer;
        container.addEventListener("scroll", () => {
            container.classList.add("show-scroll");
            clearTimeout(timer);
            timer = setTimeout(() => container.classList.remove("show-scroll"), 800);
        });
    }

    document.querySelectorAll(".half-invert, .playcontrol").forEach(el => {
        el.addEventListener("mouseover", () => {
            el.classList.add("invert");
            el.classList.remove("half-invert");
        });
        el.addEventListener("mouseleave", () => {
            el.classList.add("half-invert");
            el.classList.remove("invert");
        });
    });

    const hamburger = document.querySelector(".hamburger");
    if (hamburger) {
        hamburger.addEventListener("click", () => {
            const left = document.querySelector(".left");
            if (left) left.style.left = 0;
        });
    }
    const cross = document.querySelector(".cross");
    if (cross) {
        cross.addEventListener("click", () => {
            const left = document.querySelector(".left");
            if (left) left.style.left = "-120%";
        });
    }



    // render albums dynamically
    displayAlbum(player);



})();