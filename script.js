console.log('Lets start Javascript')
let currentSong = new Audio()
let currFolder;
let songs = []
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    const paddedMins = String(mins).padStart(2, '0');
    const paddedSecs = String(secs).padStart(2, '0');

    return `${paddedMins}:${paddedSecs}`;
}

async function getSongs(folder) {
    currFolder = folder
    console.log(folder)
    let s = await fetch(`https://spotify-clone-project-k8yg.vercel.app/${currFolder}/`)
    let a = await s.text()
    console.log(a)


    let div = document.createElement("div")
    div.innerHTML = a
    let as = div.getElementsByTagName("a");


    songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${currFolder}/`)[1])
        }

    }



    let songul = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songul.innerHTML = ""
    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + `<li data-track="${song}">
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
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e) => {
        e.addEventListener("click", () => {
            playMusic(e.dataset.track)
            
        })
    })
    return songs

    

}

const playMusic = (track, pause = false) => {
    console.log(track)
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "pause.svg"
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track)
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00"
    document.querySelectorAll(".songList li").forEach((li) => {
        li.classList.remove("playing");
        if (decodeURIComponent(li.dataset.track) === decodeURIComponent(track)) {
            li.classList.add("playing");
        }
    })
    


}
async function displayAlbums() {
    console.log("displaying albums")
    let a = await fetch(`public/song/`)
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
            let a = await fetch(`public/song/${folder}/info.json`)
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
                        <img src="public/song/${folder}/cover.jpg" alt="">
                        <h4>${response.title}</h4>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getSongs(`public/song/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])

        })
    })
}

async function main() {


    await getSongs("public/song/playlist1")
    await displayAlbums()
    playMusic(songs[0], true)

    play.addEventListener("click", () => {
        const currentTrack = currentSong.src.split("/").pop(); // get the filename (e.g., "My%20Song.mp3")

        if (currentSong.paused) {
            playMusic(currentTrack, true); // resume & update border
            currentSong.play();            // resume playing
            play.src = "pause.svg";
        } else {
            currentSong.pause();
            play.src = "play.svg";
        }
    });


    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`

        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    document.querySelector(".seekBar").addEventListener("click", (e) => {
        let percent = e.offsetX / e.target.getBoundingClientRect().width * 100
        document.querySelector(".circle").style.left = (e.offsetX / e.target.getBoundingClientRect().width) + "%"

        currentSong.currentTime = (currentSong.duration * percent) / 100

    })

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"

    })
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"

    })

    // Add an event listener to previous
    previous.addEventListener("click", () => {
        currentSong.pause()
        console.log("Previous clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    // Add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("Next clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume >0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })

  

    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".volume").getElementsByTagName("input")[0].target.value = 10;
        }

    })



}

main()

