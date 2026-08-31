/**
 * SUNO Playlist Player - Core Application Engine
 * Google Drive Local Audio Streaming Engine
 */

const audioPlayer = document.getElementById('audio-player');
const progressBar = document.getElementById('progress-bar');
const playPauseBtn = document.getElementById('play-pause-btn');
const playlistEl = document.getElementById('playlist');
const folderListEl = document.getElementById('folder-list');
const titleEl = document.getElementById('current-song-title');
const shuffleBtn = document.getElementById('shuffle-btn');
const repeatBtn = document.getElementById('repeat-btn');

let foldersData = {};
let currentFolder = "";
let originalSongs = [];
let currentPlaylist = [];
let currentIndex = 0;

let isShuffle = true;
let isRepeat = 'all'; // 'all', 'one', 'off'

const playSvg = `<svg width="36" height="36" viewBox="0 0 36 36" fill="currentColor" stroke="none"><path d="M 12,26 25,18 12,10 z"></path></svg>`;
const pauseSvg = `<svg width="36" height="36" viewBox="0 0 36 36" fill="currentColor" stroke="none"><path d="M 12,26 16,26 16,10 12,10 z M 20,10 20,26 24,26 24,10 z"></path></svg>`;

// 📦 Application Initialization
async function init() {
    titleEl.textContent = 'Loading music...';
    try {
        const res = await fetch('playlists.json');
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        
        foldersData = {};
        if (data && data.preloaded_folders) {
            foldersData = data.preloaded_folders;
        }

        renderFolderList();

        const folderNames = Object.keys(foldersData);
        if (folderNames.length > 0) {
            selectFolder(folderNames[0], false); // Preload first folder without autoplay
        } else {
            titleEl.textContent = 'No music folders found in Google Drive';
            playlistEl.innerHTML = '<li class="song-item" style="cursor:default; color: #555;">No audio files found in G:\\내 드라이브\\Music_Streaming</li>';
        }

        setupMediaSessionHandlers();
    } catch (error) {
        console.error("Failed to load library:", error);
        titleEl.textContent = 'Failed to load music';
        playlistEl.innerHTML = '<li class="song-item" style="cursor:default; color: #ff6b6b;">Error loading audio files.</li>';
    }
}

// 📁 Folder & Track Rendering
function renderFolderList() {
    folderListEl.innerHTML = '';
    for (const folderName in foldersData) {
        const item = document.createElement('div');
        item.className = 'folder-item';
        item.id = `folder-ui-${folderName.replace(/\s+/g, '-')}`;
        item.onclick = () => selectFolder(folderName);

        const nameDiv = document.createElement('div');
        nameDiv.className = 'folder-name';
        nameDiv.innerHTML = `<span>${folderName}</span>`;

        item.appendChild(nameDiv);
        folderListEl.appendChild(item);
    }
}

function selectFolder(folderName, autoPlay = true) {
    currentFolder = folderName;

    document.querySelectorAll('.folder-item').forEach(el => el.classList.remove('active'));
    const activeId = `folder-ui-${folderName.replace(/\s+/g, '-')}`;
    const activeEl = document.getElementById(activeId);
    if (activeEl) activeEl.classList.add('active');

    originalSongs = foldersData[folderName] || [];
    currentPlaylist = [...originalSongs];
    currentIndex = 0;

    if (isShuffle) {
        const shuffled = [...originalSongs];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        currentPlaylist = shuffled;
    }

    renderPlaylist();

    if (currentPlaylist.length > 0) {
        if (autoPlay) {
            playSong(0);
        } else {
            // Select a random song on startup without auto-play
            const randIdx = Math.floor(Math.random() * currentPlaylist.length);
            currentIndex = randIdx;
            const song = currentPlaylist[currentIndex];

            if (titleEl) {
                const sameTitleSongs = originalSongs.filter(s => s.name === song.name);
                if (sameTitleSongs.length > 1) {
                    const num = sameTitleSongs.findIndex(s => s.id === song.id) + 1;
                    titleEl.textContent = `${song.name} #${num}`;
                } else {
                    titleEl.textContent = song.name;
                }
            }
            updateHighlight(song);

            // Preload song
            audioPlayer.src = song.audio_url;

            if ('mediaSession' in navigator) {
                updateMediaSessionMetadata();
            }
        }
    }
}

function renderPlaylist() {
    playlistEl.innerHTML = '';
    if (originalSongs.length === 0) return;

    const titleCounts = {};
    const titleIndex = {};

    originalSongs.forEach(song => {
        titleCounts[song.name] = (titleCounts[song.name] || 0) + 1;
    });

    originalSongs.forEach((song, originalIndex) => {
        const li = document.createElement('li');
        li.className = 'song-item';
        li.id = `song-ui-${originalIndex}`;

        let displayName = song.name;
        if (titleCounts[song.name] > 1) {
            titleIndex[song.name] = (titleIndex[song.name] || 0) + 1;
            displayName = `${song.name} #${titleIndex[song.name]}`;
        }

        const titleSpan = document.createElement('span');
        titleSpan.className = 'song-title';
        titleSpan.textContent = displayName;

        li.appendChild(titleSpan);

        li.onclick = () => {
            const playIndex = currentPlaylist.findIndex(s => s === song || s.id === song.id);
            if (playIndex !== -1) {
                playSong(playIndex);
            }
        };

        playlistEl.appendChild(li);
    });
}

// 🎵 Audio Playback Engine (Optimized for Instant Streaming)
let nextTrackPreloader = new Audio();

function preloadNextTrack() {
    if (currentPlaylist.length === 0) return;
    const nextIdx = (currentIndex < currentPlaylist.length - 1) ? currentIndex + 1 : 0;
    const nextSong = currentPlaylist[nextIdx];
    if (nextSong && nextSong.audio_url) {
        nextTrackPreloader.src = nextSong.audio_url;
        nextTrackPreloader.preload = 'auto';
    }
}

function playSong(index) {
    if (currentPlaylist.length === 0) return;

    currentIndex = index;
    const song = currentPlaylist[currentIndex];
    if (!song) return;

    // Highlight and title sync
    if (titleEl) {
        const sameTitleSongs = originalSongs.filter(s => s.name === song.name);
        if (sameTitleSongs.length > 1) {
            const num = sameTitleSongs.findIndex(s => s.id === song.id) + 1;
            titleEl.textContent = `${song.name} #${num}`;
        } else {
            titleEl.textContent = song.name;
        }
    }
    updateHighlight(song);

    // MediaSession Metadata sync
    if ('mediaSession' in navigator) {
        updateMediaSessionMetadata();
    }

    const modal = document.getElementById('settings-modal');
    if (modal && modal.style.display === 'flex') {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'paused';
        }
        return;
    }

    // Instant Source Swap & Play
    audioPlayer.src = song.audio_url;
    audioPlayer.preload = 'auto';

    const playPromise = audioPlayer.play();
    if (playPromise !== undefined) {
        playPromise.catch(e => {
            console.log("Audio play caught:", e);
        });
    }

    // Preload next track in background
    setTimeout(preloadNextTrack, 1000);
}

function updateHighlight(song) {
    const originalIndex = originalSongs.findIndex(s => s.id === song.id);
    document.querySelectorAll('.song-item').forEach(el => el.classList.remove('active'));
    const activeEl = document.getElementById(`song-ui-${originalIndex}`);
    if (activeEl) {
        activeEl.classList.add('active');

        const container = activeEl.closest('.scrollable-content');
        if (container) {
            setTimeout(() => {
                const containerRect = container.getBoundingClientRect();
                const itemRect = activeEl.getBoundingClientRect();
                const relativeTop = itemRect.top - containerRect.top;
                container.scrollTo({
                    top: container.scrollTop + relativeTop - (containerRect.height / 2) + (itemRect.height / 2),
                    behavior: 'smooth'
                });
            }, 50);
        }
    }
}

function updateMediaSessionMetadata() {
    if ('mediaSession' in navigator) {
        const song = currentPlaylist[currentIndex];
        if (!song) return;

        navigator.mediaSession.metadata = new MediaMetadata({
            title: song.name,
            artist: currentFolder || 'Music Player',
            album: currentFolder || 'Music Player',
            artwork: []
        });

        navigator.mediaSession.playbackState = 'playing';
    }
}

function setupMediaSessionHandlers() {
    if ('mediaSession' in navigator) {
        const actions = {
            'play': () => audioPlayer.play(),
            'pause': () => audioPlayer.pause(),
            'previoustrack': () => playPrevious(),
            'nexttrack': () => playNext()
        };

        for (const [action, handler] of Object.entries(actions)) {
            try { navigator.mediaSession.setActionHandler(action, handler); } catch (e) { }
        }

        navigator.mediaSession.setActionHandler('seekto', (details) => {
            if (details.seekTime && audioPlayer.duration) {
                audioPlayer.currentTime = details.seekTime;
            }
        });
    }
}

// 🎛️ Controls & Event Listeners
window.togglePlay = function () {
    const modal = document.getElementById('settings-modal');
    if (modal && modal.style.display === 'flex') {
        return;
    }
    if (audioPlayer.paused) {
        audioPlayer.play().catch(e => console.log("Play failed:", e));
    } else {
        audioPlayer.pause();
    }
};

window.playNext = function () {
    if (currentPlaylist.length === 0) return;
    if (currentIndex < currentPlaylist.length - 1) {
        playSong(currentIndex + 1);
    } else {
        playSong(0);
    }
};

window.playPrevious = function () {
    if (currentPlaylist.length === 0) return;
    if (currentIndex > 0) {
        playSong(currentIndex - 1);
    } else {
        playSong(currentPlaylist.length - 1);
    }
};

audioPlayer.addEventListener('play', () => {
    playPauseBtn.innerHTML = pauseSvg;
    playPauseBtn.style.paddingLeft = '0';
    if ('mediaSession' in navigator) {
        updateMediaSessionMetadata();
        navigator.mediaSession.playbackState = "playing";
    }
});

audioPlayer.addEventListener('pause', () => {
    playPauseBtn.innerHTML = playSvg;
    playPauseBtn.style.paddingLeft = '0';
    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = "paused";
    }
});

audioPlayer.addEventListener('timeupdate', () => {
    if (audioPlayer.duration && !isNaN(audioPlayer.duration)) {
        const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.value = percent;
        progressBar.style.setProperty('--progress', `${percent}%`);
    }
});

progressBar.addEventListener('input', (e) => {
    if (audioPlayer.duration && !isNaN(audioPlayer.duration)) {
        const seekTime = (e.target.value / 100) * audioPlayer.duration;
        audioPlayer.currentTime = seekTime;
        progressBar.style.setProperty('--progress', `${e.target.value}%`);
    }
});

audioPlayer.addEventListener('ended', () => {
    if (isRepeat === 'all') {
        playNext();
    } else if (isRepeat === 'one') {
        if (currentIndex < currentPlaylist.length - 1) {
            playSong(currentIndex + 1);
        } else {
            audioPlayer.currentTime = 0;
            audioPlayer.play().catch(e => console.log(e));
        }
    }
});

window.toggleShuffle = function () {
    isShuffle = !isShuffle;
    if (isShuffle) {
        shuffleBtn.classList.add('active-mode');
        const currentSong = currentPlaylist[currentIndex];
        let shuffled = [...originalSongs];

        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        currentPlaylist = shuffled;
        if (currentSong) {
            const songIdx = currentPlaylist.findIndex(s => s.id === currentSong.id);
            if (songIdx !== -1) {
                currentPlaylist.splice(songIdx, 1);
                currentPlaylist.unshift(currentSong);
                currentIndex = 0;
            }
        }
    } else {
        shuffleBtn.classList.remove('active-mode');
        const currentSong = currentPlaylist[currentIndex];
        currentPlaylist = [...originalSongs];
        if (currentSong) {
            const songIdx = currentPlaylist.findIndex(s => s.id === currentSong.id);
            if (songIdx !== -1) {
                currentIndex = songIdx;
            }
        }
    }
};

window.toggleRepeat = function () {
    if (isRepeat === 'all') {
        isRepeat = 'one';
    } else if (isRepeat === 'one') {
        isRepeat = 'off';
    } else {
        isRepeat = 'all';
    }
    updateRepeatUI();
};

function updateRepeatUI() {
    if (isRepeat === 'all') {
        repeatBtn.classList.add('active-mode');
        repeatBtn.classList.remove('active-one');
        repeatBtn.style.opacity = '1';
        repeatBtn.title = "Continuous Play (All Tracks)";
    } else if (isRepeat === 'one') {
        repeatBtn.classList.add('active-mode');
        repeatBtn.classList.add('active-one');
        repeatBtn.style.opacity = '1';
        repeatBtn.title = "Play Through Once";
    } else {
        repeatBtn.classList.remove('active-mode');
        repeatBtn.classList.remove('active-one');
        repeatBtn.style.opacity = '0.4';
        repeatBtn.title = "Stop After Single Track";
    }
}

// ⚙️ Settings Modal
window.toggleSettingsModal = function () {
    const modal = document.getElementById('settings-modal');
    if (!modal) return;
    if (modal.style.display === 'flex') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'flex';
    }
};

// Initialize Application
init();
