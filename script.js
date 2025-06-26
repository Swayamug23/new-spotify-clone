console.log('Lets start Javascript');
let currentSong = new Audio();
let currFolder;
let songs = [];

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

async function getSongs(folder) {
    currFolder = folder;
    try {
        const res = await fetch(`/${folder}/`);
        const html = await res.text();
        const div = document.createElement("div");
        div.innerHTML = html;

        const as = div.getElementsByTagName("a");
        songs = [];

        for (let a of as) {
            if (a.href.endsWith(".mp3")) {
                const file = a.href.split(`/${folder}/`)[1];
                songs.push(file);
            }
        }

        // Display songs in playlist
        const songUL = document.querySelector(".songList ul");
        songUL.innerHTML = "";
        for (let song of songs) {
            songUL.innerHTML += `
                <li data-track="${song}">
                    <img class="invert" width="34" src="img/music.svg" alt="">
                    <div class="info">
                        <div>${decodeURIComponent(song)}</div>
                        <div>Swayam</div>
                    </div>
                    <div class="playnow">
                        <span>Play Now</span>
                        <img class="invert" src="img/play.svg" alt="">
                    </div>
                </li>`;
        }

        // Add click listener to each song
        document.querySelectorAll(".songList li").forEach(e => {
            e.addEventListener("click", () => {
                playMusic(e.dataset.track);
            });
        });

        return songs;
    } catch (err) {
        console.error("Error loading songs:", err);
        return [];
    }
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/${track}`;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
    console.log("Displaying albums...");
    try {
        const res = await fetch(`/songs/`);
        const html = await res.text();
        const div = document.createElement("div");
        div.innerHTML = html;
        const anchors = Array.from(div.getElementsByTagName("a"));
        const cardContainer = document.querySelector(".cardContainer");

        for (let a of anchors) {
            if (a.href.includes("/songs") && !a.href.includes(".htaccess")) {
                const folder = a.href.split("/").slice(-2)[0];

                try {
                    const metaRes = await fetch(`/songs/${folder}/info.json`);
                    const meta = await metaRes.json();

                    cardContainer.innerHTML += `
                        <div data-folder="${folder}" class="card">
                            <div class="play">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                        stroke-linejoin="round" />
                                </svg>
                            </div>
                            <img src="/songs/${folder}/cover.jpg" alt="">
                            <h2>${meta.title}</h2>
                            <p>${meta.description}</p>
                        </div>`;
                } catch {
                    console.warn(`Missing info.json in /songs/${folder}`);
                }
            }
        }

        // Card click to load songs
        document.querySelectorAll(".card").forEach(card => {
            card.addEventListener("click", async () => {
                console.log("Fetching Songs");
                songs = await getSongs(`songs/${card.dataset.folder}`);
                playMusic(songs[0]);
            });
        });
    } catch (err) {
        console.error("Failed to load albums:", err);
    }
}

async function main() {
    await getSongs("songs/playlist1");
    await displayAlbums();
    if (songs.length > 0) playMusic(songs[0], true);

    play.addEventListener("click", () => {
        const currentTrack = currentSong.src.split("/").pop();
        if (currentSong.paused) {
            playMusic(currentTrack, true);
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerText =
            `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left =
            `${(currentSong.currentTime / currentSong.duration) * 100}%`;
    });

    document.querySelector(".seekBar").addEventListener("click", (e) => {
        const percent = e.offsetX / e.target.getBoundingClientRect().width;
        document.querySelector(".circle").style.left = `${percent * 100}%`;
        currentSong.currentTime = currentSong.duration * percent;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    previous.addEventListener("click", () => {
        const currentTrack = currentSong.src.split("/").pop();
        const index = songs.indexOf(currentTrack);
        if (index > 0) playMusic(songs[index - 1]);
    });

    next.addEventListener("click", () => {
        const currentTrack = currentSong.src.split("/").pop();
        const index = songs.indexOf(currentTrack);
        if (index < songs.length - 1) playMusic(songs[index + 1]);
    });

    document.querySelector(".volume input").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = "img/volume.svg";
        }
    });

    document.querySelector(".volume>img").addEventListener("click", (e) => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = "img/mute.svg";
            currentSong.volume = 0;
            document.querySelector(".volume input").value = 0;
        } else {
            e.target.src = "img/volume.svg";
            currentSong.volume = 0.1;
            document.querySelector(".volume input").value = 10;
        }
    });
}

main();
