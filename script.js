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
    console.log(folder);

    try {
        let res = await fetch(`/${currFolder}/index.json`);
        let songList = await res.json();

        songs = songList;

        let songul = document.querySelector(".songList ul");
        songul.innerHTML = "";

        for (const song of songs) {
            songul.innerHTML += `
                <li data-track="${song}">
                    <img src="music.svg" alt="">
                    <div class="info">
                        <div>${song.replaceAll("%20", " ")}</div>
                        <div>swayam</div>
                    </div>
                    <div class="playnow">
                        <span>Play now</span>
                        <img class="invert" src="play.svg" alt="">
                    </div>
                </li>`;
        }

        document.querySelectorAll(".songList li").forEach((li) => {
            li.addEventListener("click", () => playMusic(li.dataset.track));
        });

        return songs;
    } catch (error) {
        console.error("Failed to fetch songs:", error);
        return [];
    }
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/${track}`;
    if (!pause) {
        currentSong.play();
        play.src = "pause.svg";
    }
    document.querySelector(".songInfo").innerText = decodeURI(track);
    document.querySelector(".songTime").innerText = "00:00 / 00:00";

    document.querySelectorAll(".songList li").forEach((li) => {
        li.classList.remove("playing");
        if (decodeURIComponent(li.dataset.track) === decodeURIComponent(track)) {
            li.classList.add("playing");
        }
    });
};

async function displayAlbums() {
    console.log("displaying albums")
    let a = await fetch(/song/)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    
    let array = Array.from(anchors)
    
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/song")) {
            let folder = e.href.split("/").slice(-2)[0]
            // Get the metadata of the folder
            let a = await fetch(/song/`${folder}`/info.json)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg width="50" height="50" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                                <!-- Green Circle -->
                                <circle cx="100" cy="100" r="90" fill="#1ed760" />

                                <!-- Black Right-Pointing Triangle (centered) -->
                                <polygon points="80,60 80,140 140,100" fill="black" />
                            </svg>





                        </div>
                        <img src="/song/${folder}/cover.jpg" alt="">
                        <h4>${response.title}</h4>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getSongs(song/`${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])

        })
    })
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
