let bgMusic =           new Audio("audio/music.mp3")

let click1 =            new Audio("audio/click1.mp3")
let menuError =         new Audio("audio/menuError.mp3")

let launchAudio =   [   new Audio("audio/launch/rocket-launch1.mp3"),
                        new Audio("audio/launch/rocket-launch2.mp3")
                    ]
let hitAudio =      [   new Audio("audio/hit/explosion1.mp3"),
                        new Audio("audio/hit/explosion2.mp3"),
                        new Audio("audio/hit/explosion3.mp3")
                    ]
let missAudio =     [   new Audio("audio/miss/splash1.mp3"),
                        new Audio("audio/miss/splash2.mp3")
                    ]

let menu = new Audio();
export let launch = new Audio(); 
export function playAudio(type){
    if(type=="launch"){
        launch = launchAudio[Math.floor(Math.random()*launchAudio.length)]
        launch.play()
        return launch
    }else if(type=="hit"){
        return hitAudio[Math.floor(Math.random()*hitAudio.length)].play()
    }else if(type=="miss"){
        return missAudio[Math.floor(Math.random()*missAudio.length)].play()
    }else if(type=="click"){
        menu.currentTime = 0
        menu = click1
        menu.play()
        return menu
    }else if(type=="error"){
        menu.currentTime = 0
        menu = menuError
        menu.play()
        return menu
    }
}

//background music
document.addEventListener("click", (e)=>{
    bgMusic.volume = 0.6
    bgMusic.play()
    let icon = document.getElementById("musicControl")
    icon.style.maskImage = `url("img/musicOn.svg")`
    icon.style.webkitMaskImage = `url("img/musicOn.svg")`
    icon.setAttribute("data", "on")
}, {once:true})

//music button
document.getElementById("musicControl").addEventListener("click", (e)=>{
    let icon = document.getElementById("musicControl")
    let toggle = icon.getAttribute("data")

    if(toggle=="on"){
        bgMusic.volume = 0.0
        icon.style.maskImage = `url("img/musicOff.svg")`
        icon.style.webkitMaskImage = `url("img/musicOff.svg")`
        icon.setAttribute("data", "off")
    }else if(toggle=="off"){
        bgMusic.volume = 0.6
        icon.style.maskImage = `url("img/musicOn.svg")`
        icon.style.webkitMaskImage = `url("img/musicOn.svg")`
        icon.setAttribute("data", "on")
    }
})
