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
    songs = [];

    try {
        const res = await fetch(`/${folder}/`);
        const html = await res.text();
        const div = document.createElement("div");
        div.innerHTML = html;
        const links = div.getElementsByTagName("a");

        for (let a of links) {
            if (a.href.endsWith(".mp3")) {
                const songName = decodeURIComponent(a.href.split(`/${folder}/`)[1]);
                songs.push(songName);
            }
        }

        // Show songs
        let songUL = document.querySelector(".songList ul");
        songUL.innerHTML = "";
        for (const song of songs) {
            songUL.innerHTML += `
                <li data-track="${song}">
                    <img src="music.svg" alt="">
                    <div class="info">
                        <div>${song}</div>
                        <div>swayam</div>
                    </div>
                    <div class="playnow">
                        <span>Play now</span>
                        <img class="invert" src="play.svg" alt="">
                    </div>
                </li>`;
        }

        // Attach listeners to each list item
        document.querySelectorAll(".songList li").forEach(li => {
            li.addEventListener("click", () => playMusic(li.dataset.track));
        });

        return songs;

    } catch (err) {
        console.error("Error fetching songs:", err);
        return [];
    }
}


const playMusic = (track, pause = false) => {
    const audioPath = `/${currFolder}/${track}`;
    currentSong.src = audioPath;
    if (!pause) {
        currentSong.play();
        play.src = "pause.svg";
    }
    document.querySelector(".songInfo").innerText = decodeURI(track);
    document.querySelector(".songTime").innerText = "00:00 / 00:00";

    document.querySelectorAll(".songList li").forEach(li => {
        li.classList.remove("playing");
        if (decodeURIComponent(li.dataset.track) === decodeURIComponent(track)) {
            li.classList.add("playing");
        }
    });
};


async function displayAlbums() {
    console.log("Displaying albums");
    let cardContainer = document.querySelector(".cardContainer");

    const playlists = ["playlist1","playlist2"]; // Add more if needed

    for (let folder of playlists) {
        try {
            let res = await fetch(`song/${folder}/info.json`);
            let meta = await res.json();

            cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg width="50" height="50" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="100" cy="100" r="90" fill="#1ed760" />
                            <polygon points="80,60 80,140 140,100" fill="black" />
                        </svg>
                    </div>
                    <img src="/song/${folder}/cover.jpg" alt="">
                    <h4>${meta.title}</h4>
                    <p>${meta.description}</p>
                </div>`;
        } catch {
            console.warn(`Missing info.json in ${folder}`);
        }
    }

    document.querySelectorAll(".card").forEach((card) => {
        card.addEventListener("click", async () => {
            songs = await getSongs(`song/${card.dataset.folder}`);
            playMusic(songs[0]);
        });
    });
}

async function main() {
    await getSongs("song/playlist1");
    await displayAlbums();
    playMusic(songs[0], true);

    play.addEventListener("click", () => {
        const currentTrack = currentSong.src.split("/").pop();
        if (currentSong.paused) {
            playMusic(currentTrack, true);
            currentSong.play();
            play.src = "pause.svg";
        } else {
            currentSong.pause();
            play.src = "play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerText =
            `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left =
            `${(currentSong.currentTime / currentSong.duration) * 100}%`;
    });

    document.querySelector(".seekBar").addEventListener("click", (e) => {
        let percent = e.offsetX / e.target.getBoundingClientRect().width;
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
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index > 0) playMusic(songs[index - 1]);
    });

    next.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index < songs.length - 1) playMusic(songs[index + 1]);
    });

    document.querySelector(".volume input").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = "volume.svg";
        }
    });

    document.querySelector(".volume>img").addEventListener("click", (e) => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = "mute.svg";
            currentSong.volume = 0;
            document.querySelector(".volume input").value = 0;
        } else {
            e.target.src = "volume.svg";
            currentSong.volume = 0.1;
            document.querySelector(".volume input").value = 10;
        }
    });
}

main();
