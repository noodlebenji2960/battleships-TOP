import { GameController, gameStates } from "./logic.js"
import { shipType } from "./logic.js"

let alphabet = "abcdefghij".split("")
let isVertical = false

//Audio
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

let root = document.querySelector(":root")
let squareSize = Number(getComputedStyle(root).getPropertyValue("--squareSize").slice(0,3))

function playAudio(type){
    if(type=="launch"){
        return launchAudio[Math.floor(Math.random()*launchAudio.length)].play()
    }else if(type=="hit"){
        return hitAudio[Math.floor(Math.random()*hitAudio.length)].play()
    }else if(type=="miss"){
        return missAudio[Math.floor(Math.random()*missAudio.length)].play()
    }
    
}

document.addEventListener("click", (e)=>{
        bgMusic.volume = 0.6
        bgMusic.play()
        let icon = document.getElementById("musicControl")
        icon.style.maskImage = `url("img/musicOn.svg")`
        icon.style.webkitMaskImage = `url("img/musicOn.svg")`
        icon.setAttribute("data", "on")
}, {once:true})

//newGame
let newGame = new GameController()
newGame.initialize()

//music control
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

export function createGameboards(){
    //enemyBoard
    const enemyBoardDiv = document.getElementById("enemyBoard")
    //xAxis
    const enemyxAxis = document.createElement("div")
    enemyxAxis.classList.add("enemyxAxis")
    //yAxis
    const enemyyAxis = document.createElement("div")
    enemyyAxis.classList.add("enemyyAxis")

    document.getElementById("enemyContainer").append(enemyBoardDiv, enemyxAxis, enemyyAxis)

    //ship images
    for(let i=0;i<shipType.length;i++){
        let shipImageDiv = document.createElement("div")
        let shipImage = document.createElement("div")
        shipImage.classList.add("ship", shipType[i].type)
        shipImage.style.width = shipType[i].length * squareSize+"px"
        
        let skull = document.createElement("div")
        skull.id = `enemy${shipType[i].type}Skull`
        skull.classList.add("skull")
        shipImageDiv.append(shipImage, skull)
        document.getElementById("enemyStatus").append(shipImageDiv)
    }

    //enemy squares
    for(let y=9;y>=0;y--){
        let enemyxAxisSquare = document.createElement("div")
        enemyxAxisSquare.classList.add("enemySquare")
        enemyxAxisSquare.id = `enemyxAxis${9-y}`
        enemyxAxisSquare.textContent = alphabet[9-y]
        enemyxAxis.append(enemyxAxisSquare)

        let enemyyAxisSquare = document.createElement("div")
        enemyyAxisSquare.classList.add("enemySquare")
        enemyyAxisSquare.id = `enemyyAxis${y}`
        enemyyAxisSquare.textContent = y+1
        enemyyAxis.append(enemyyAxisSquare)
       
        for(let x=0;x<=9;x++){
            let div = document.createElement("div")
            div.id = `enemy${x}${y}`
            div.textContent = `${alphabet[x]}${y+1}`
            div.classList.add("enemySquare")
            enemyBoardDiv.append(div)
            div.addEventListener("click", enemyBoardClick,{once:true})
            div.addEventListener("mouseover", (e)=>{
                let yAxisSquare = document.getElementById(`enemyyAxis${e.target.id.charAt(6)}`)
                yAxisSquare.classList.add("enemyAxisMarked")
                let xAxisSquare = document.getElementById(`enemyxAxis${e.target.id.charAt(5)}`)
                xAxisSquare.classList.add("enemyAxisMarked")
            })
            div.addEventListener("mouseleave", (e)=>{
                let yAxisSquare = document.getElementById(`enemyyAxis${e.target.id.charAt(6)}`)
                yAxisSquare.classList.remove("enemyAxisMarked")
                let xAxisSquare = document.getElementById(`enemyxAxis${e.target.id.charAt(5)}`)
                xAxisSquare.classList.remove("enemyAxisMarked")
            })

        }
    }
    function enemyBoardClick(e){
        if(e.srcElement.classList.contains("miss")||e.srcElement.classList.contains("hit")){
            menuError.currentTime=0
            menuError.play()
            e.srcElement.addEventListener("click", enemyBoardClick, {once:true})
        }else{
            playAudio("launch")
        let activePlayer = checkActivePlayer()
        let target = e.target
        if(newGame.recieveAttack(e.target.id, activePlayer)==true){
            setTimeout(()=>{
                target.classList.add("hit")
                playAudio("hit")
                newGame.updateMessage("it's a hit!")
                
            },1100)
        }else{
            setTimeout(()=>{
                target.classList.add("miss")
                playAudio("miss")
                newGame.updateMessage("Missed!")
            },1100)
        }
        setTimeout(()=>{
            e.srcElement.addEventListener("click", enemyBoardClick, {once:true})
        },5000)

        
        if(newGame.winner!==null){
            let playerOverlay = document.getElementById("playerOverlay")
            playerOverlay.style.visibility = "visible"
            playerOverlay.classList.remove("collapsed")
            playerOverlay.classList.add("expanded")
            
            let retryButton = document.createElement("button")
            retryButton.textContent = "play again?"
            retryButton.addEventListener("click",(e)=>{
                clearBoard()
                newGame = new GameController()
                newGame.initialize()
                placementPhase()
            })
            playerOverlay.textContent = ""
            playerOverlay.append(retryButton)
            let enemyOverlay = document.getElementById("enemyOverlay")
            enemyOverlay.classList.remove("collapsed")
            enemyOverlay.classList.add("expanded")
            enemyOverlay.textContent = `Congratulations Admiral ${newGame.players[0].name}, the enemy has been eliminated!`
            newGame.gameState = "endGame"
        }else{
            passDevice()
        }
        }
    }
    //playerBoard
    const boardDiv = document.getElementById("playerBoard")

    const xAxis = document.createElement("div")
    xAxis.classList.add("playerxAxis")

    const yAxis = document.createElement("div")
    yAxis.classList.add("playeryAxis")

    document.getElementById("playerContainer").append(boardDiv, xAxis, yAxis)

    for(let i=0;i<shipType.length;i++){
        let shipImageDiv = document.createElement("div")
        shipImageDiv.id = `player${shipType[i].type}`
        
        //ships
        let shipImage = document.createElement("div")
        shipImage.classList.add("ship", shipType[i].type)
        shipImage.style.width = shipType[i].length * squareSize+"px"
        shipImage.addEventListener("click", (e)=>{
            click1.currentTime = 0
            click1.play()
            if(newGame.gameState=="placement"){
                document.querySelectorAll(".ship").forEach((e)=>{e.classList.remove("shipSelected")})
                shipImage.classList.add("shipSelected")
                let length = shipType[i].length
                let type = shipType[i].type.charAt(0).toUpperCase()+shipType[i].type.slice(1)
                newGame.updateMessage(type+" ("+length+" squares)")
            }
        })

        let skull = document.createElement("div")
        skull.id = `player${shipType[i].type}Skull`
        shipImageDiv.append(shipImage, skull)
        document.getElementById("playerStatus").append(shipImageDiv)
    }

    //placement controls
    let placementControls = document.createElement("div")
    placementControls.id = "placementControls"
    document.getElementById("playerStatus").append(placementControls)
    let coordsInput = document.createElement("div")
    let coordsInputX = document.createElement("select")
    coordsInputX.id = "coordXInput"
    let coordsInputY = document.createElement("select")
    coordsInputY.id = "coordYInput"
    for(let i=0;i<11;i++){
        let optionX = document.createElement("option")
        let optionY = document.createElement("option")
        if(i==0){
            optionX.textContent = "X"
            optionY.textContent = "Y"
        }else{
            optionX.textContent = alphabet[i-1]
            optionX.value = i-1
            optionY.textContent = i
            optionY.value = i-1
        }
        coordsInputX.append(optionX)
        coordsInputY.append(optionY)
    }
    let placeButton = document.createElement("button")
    placeButton.textContent = "Place"
    placeButton.addEventListener("click", (e)=>{
        click1.currentTime = 0;
        click1.play()
        let ship = shipType.find((e)=>{
            let type = document.getElementById("message").textContent.replace(/ .*/,'').toLowerCase()
            if(e.type==type){
                return true
            }
        })
        if(ship!==undefined){
            document.getElementById("randomButton").classList.add("disabled")
            let activePlayer = checkActivePlayer()
            let ships;
            let x = document.getElementById("coordXInput").value
            let y = document.getElementById("coordYInput").value
            if(newGame.checkPossible(`player${x}${y}`,ship,isVertical,activePlayer)){
                newGame.placeShip(`player${x}${y}`, ship.type, isVertical, activePlayer)
                renderFriendly()
                if(activePlayer=="p1"){
                    ships = newGame.players[0].ships
                }else{
                    ships = newGame.players[1].ships
                }
                if( newGame.players[0].ships.length==5&&newGame.players[1].ships.length==5){
                    newGame.turn++
                    clearBoard()
                    renderFriendly()
                    newGame.gameState="playing"
                } else if(ships.length==5){
                    newGame.turn++
                    placementPhase()
                    renderFriendly()
                }else{
                    document.getElementById(`player${ship.type}`).children[0].classList.remove("shipSelected")
                    document.getElementById(`player${ship.type}`).children[0].classList.add("disabled")
                    document.getElementById("message").textContent = ""
                }
            }else{
                menuError.currentTime=0
                menuError.play()
            }
        }
    })
    coordsInput.append(coordsInputX, coordsInputY, placeButton)
    let randomButton = document.createElement("button")
    randomButton.id = "randomButton"
    randomButton.textContent = "Place randomly"
    randomButton.addEventListener("click", (e)=>{
        click1.currentTime = 0;
        click1.play()

        clearBoard()

        if(newGame.players[1].type=="ai"){
            newGame.randomShips("p1")
            newGame.randomShips("p2")
            newGame.gameState="playing"
            renderFriendly()
        }else{
            newGame.randomShips(checkActivePlayer())
            newGame.turn++
            placementPhase()
        }
    })
    let rotateButton = document.createElement("button")
    rotateButton.id = "randomButton"
    rotateButton.textContent = "Rotate axis"
    rotateButton.addEventListener("click", (e)=>{
        if(isVertical){
            isVertical = false
            rotateButton.textContent = "Rotate axis(x)"
        }else{
            isVertical = true
            rotateButton.textContent = "Rotate axis(y)"
        }
    })
    placementControls.append(randomButton, rotateButton, coordsInput)
    //player squares
    for(let y=9;y>=0;y--){

        let xAxisSquare = document.createElement("div")
        xAxisSquare.classList.add("playerSquare")
        xAxisSquare.id = `playerxAxis${9-y}`
        xAxisSquare.textContent = alphabet[9-y]
        xAxis.append(xAxisSquare)

        let yAxisSquare = document.createElement("div")
        yAxisSquare.classList.add("playerSquare")
        yAxisSquare.id = `playeryAxis${y}`
        yAxisSquare.textContent = y+1
        yAxis.append(yAxisSquare)
        
        for(let x=0;x<=9;x++){
            let div = document.createElement("div")
            div.id = `player${x}${y}`
            div.textContent = `${alphabet[x]}${y+1}`
            div.classList.add("playerSquare")
            boardDiv.append(div)
            div.addEventListener("click", (e)=>{
                let gameState=newGame.gameState
                if(gameState=="placement"){
                    let activePlayer = checkActivePlayer()
                    click1.currentTime = 0;
                    click1.play()
                    let ship = shipType.find((e)=>{
                        let type = document.getElementById("message").textContent.replace(/ .*/,'').toLowerCase()
                        if(e.type==type){
                            return true
                        }
                    })
                    if(ship!==undefined&&newGame.checkPossible(e.target.id,ship,isVertical,activePlayer)){
                        document.getElementById("randomButton").classList.add("disabled")
                        let ships;
                        newGame.placeShip(e.target.id, ship.type, isVertical, activePlayer)
                        renderFriendly()
                        if(activePlayer=="p1"){
                            ships = newGame.players[0].ships
                        }else{
                            ships = newGame.players[1].ships
                        }
                        if( newGame.players[0].ships.length==5&&newGame.players[1].ships.length==5){
                            newGame.turn++
                            clearBoard()
                            renderFriendly()
                            newGame.gameState="playing"
                        } else if(ships.length==5){
                            newGame.turn++
                            placementPhase()
                            renderFriendly()
                        }else{
                            document.getElementById(`player${ship.type}`).children[0].classList.remove("shipSelected")
                            document.getElementById(`player${ship.type}`).children[0].classList.add("disabled")
                            document.getElementById("message").textContent = ""
                        }
                    }else{
                    }
                }else{
                    menuError.currentTime=0
                    menuError.play()
                }
            })

            
            div.addEventListener("mouseover", (e)=>{
                let gameState=newGame.gameState
                if(gameState=="placement"){
                    let ship = shipType.find((e)=>{
                        let type = document.getElementById("message").textContent.replace(/ .*/,'').toLowerCase()
                        if(e.type==type){
                            return true
                        }
                    })
                    if(ship!==undefined){
                        let activePlayer = checkActivePlayer()
                        let possible = newGame.checkPossible(e.target.id, ship, isVertical, activePlayer)
                        let x=Number(e.target.id.charAt(6))
                        let y=Number(e.target.id.charAt(7))
                        if(possible==true){
                            let id = document.getElementById(`player${x}${y}`)
                            id.classList.add("placement")
                            for(let i=0;i<ship.length-1;i++){
                                if(isVertical==false){
                                    x = x+1
                                }else{
                                    y = y-1
                                }
                                let id = document.getElementById(`player${x}${y}`)
                                id.classList.add("placement")
                            }
                        }else{
                            let id = document.getElementById(`player${x}${y}`)
                            id.classList.add("error")
                            for(let i=0;i<ship.length-1;i++){
                                if(isVertical==false){
                                    x = x+1
                                }else{
                                    y = y-1
                                }
                                let id = document.getElementById(`player${x}${y}`)
                                if(id!=null){
                                    id.classList.add("error")
                                }
                            }
                        }
                        e.target.addEventListener('contextmenu', rightClickRotate)
                    }
                }

                let yAxisSquare = document.getElementById(`playeryAxis${e.target.id.charAt(7)}`)
                yAxisSquare.classList.add("playerAxisMarked")
                let xAxisSquare = document.getElementById(`playerxAxis${e.target.id.charAt(6)}`)
                xAxisSquare.classList.add("playerAxisMarked")
            })

            function rightClickRotate(e){
                event.preventDefault();
                newGame.board.forEach((e)=>{
                    let x = e.X
                    let y = e.Y
                    let XY = document.getElementById(`player${x}${y}`)
                    XY.classList.remove("placement")
                    XY.classList.remove("error")
                })
                if(isVertical== false){
                    isVertical = true 
                }else{
                    isVertical = false
                }
                                    let ship = shipType.find((e)=>{
                        let type = document.getElementById("message").textContent.replace(/ .*/,'').toLowerCase()
                        if(e.type==type){
                            return true
                        }
                    })
                    if(ship!==undefined){
                        let activePlayer = checkActivePlayer()
                        let possible = newGame.checkPossible(e.target.id, ship, isVertical, activePlayer)
                        let x=Number(e.target.id.charAt(6))
                        let y=Number(e.target.id.charAt(7))
                        if(possible==true){
                            let id = document.getElementById(`player${x}${y}`)
                            id.classList.add("placement")
                            for(let i=0;i<ship.length-1;i++){
                                if(isVertical==false){
                                    x = x+1
                                }else{
                                    y = y-1
                                }
                                let id = document.getElementById(`player${x}${y}`)
                                id.classList.add("placement")
                            }
                        }else{
                            let id = document.getElementById(`player${x}${y}`)
                            id.classList.add("error")
                            for(let i=0;i<ship.length-1;i++){
                                if(isVertical==false){
                                    x = x+1
                                }else{
                                    y = y-1
                                }
                                let id = document.getElementById(`player${x}${y}`)
                                if(id!=null){
                                    id.classList.add("error")
                                }
                            }
                        }
                    }
            }

            div.addEventListener("mouseleave", (e)=>{
                let gameState=newGame.gameState
                if(gameState=="placement"){
                    let ship = shipType.find((e)=>{
                        let type = document.getElementById("message").textContent.replace(/ .*/,'').toLowerCase()
                        if(e.type==type){
                            return true
                        }
                    })
                    if(ship!==undefined){
                        let activePlayer = checkActivePlayer()
                        let possible = newGame.checkPossible(e.target.id, ship, isVertical, activePlayer)
                        let x=Number(e.target.id.charAt(6))
                        let y=Number(e.target.id.charAt(7))
                        if(possible==true){
                            e.target.classList.remove("placement")
                            for(let i=0;i<ship.length-1;i++){
                                if(isVertical==false){
                                    x = x+1
                                }else{
                                    y = y-1
                                }
                                let id = document.getElementById(`player${x}${y}`)
                                id.classList.remove("placement")
                            }
                        }else{
                            let id = document.getElementById(`player${x}${y}`)
                            id.classList.remove("error")
                            for(let i=0;i<ship.length-1;i++){
                                if(isVertical==false){
                                    x = x+1
                                }else{
                                    y = y-1
                                }
                                let id = document.getElementById(`player${x}${y}`)
                                if(id!=null){
                                    id.classList.remove("error")
                                }
                            }
                        }
                        e.target.addEventListener('contextmenu', rightClickRotate)
                    }
                }
                let yAxisSquare = document.getElementById(`playeryAxis${e.target.id.charAt(7)}`)
                yAxisSquare.classList.remove("playerAxisMarked")
                let xAxisSquare = document.getElementById(`playerxAxis${e.target.id.charAt(6)}`)
                xAxisSquare.classList.remove("playerAxisMarked")
            })
        }
    }
}

function aiTurn(){
    playAudio("launch")
    newGame.ai()
    renderFriendly()
    renderShots()
    renderSkulls()
    if(newGame.winner!=null){
        document.getElementById("playerOverlay").style.visibility = "visible"
        playerOverlay.textContent = `GAME OVER, The enemy has defeated your fleet Admiral ${newGame.players[0].name}!`
        document.getElementById("enemyOverlay").style.visibility = "visible"
        newGame.gameState = "endGame"
    }
}

function passDevice(){
    clearBoard()
    if(newGame.players[1].type=="human"){
        document.getElementById("playerBoard").classList.add("passDevice")
        document.getElementById("enemyBoard").classList.add("passDevice")
        let timeout = 5
        let playerOverlayDiv = document.getElementById("playerOverlay")
        playerOverlay.classList.remove("collapsed")
        playerOverlay.classList.add("expanded")
        let playerBoard = document.getElementById("playerBoard")
        playerBoard.style.opacity = 0
    
        let enemyOverlayDiv = document.getElementById("enemyOverlay")
        enemyOverlay.classList.remove("collapsed")
        enemyOverlay.classList.add("expanded")
        enemyOverlayDiv.textContent = "You have "+timeout+" seconds to pass the device!"
        let enemyBoard = document.getElementById("enemyBoard")
        enemyBoard.style.opacity = 0
    
        let interval = setInterval(()=>{
            timeout = timeout-1
            enemyOverlayDiv.textContent = "You have "+timeout+" seconds to pass the device!"
        }, 1000)
        setTimeout(()=>{
            newGame.updateMessage("Awaiting orders Admiral "+newGame.players[checkActivePlayer().charAt(1)-1].name)
            playerOverlay.classList.add("collapsed")
            playerOverlay.classList.remove("expanded")
            playerOverlayDiv.textContent =""
            playerBoard.style.opacity = "100%"
            enemyOverlay.classList.add("collapsed")
            enemyOverlay.classList.remove("expanded")
            enemyOverlayDiv.textContent = ""
            enemyBoard.style.opacity = "100%"
            clearBoard()
            clearInterval(interval);
            renderFriendly()
            renderShots()
            renderSkulls()
        },(timeout*1000))
    }else{
        aiTurn()
    }
}

function renderFriendly(){
    let activePlayer = checkActivePlayer()
    newGame.board.forEach((e)=>{
        let x = Number(e.X)
        let y = Number(e.Y)
        let id = document.getElementById("player"+x+y)
        if(e.p1Ship!==null&&activePlayer=="p1"){
            id.classList.add("friendly")
        }else if(e.p2Ship!==null&&activePlayer=="p2"){
            id.classList.add("friendly")
        }
    })
}

function checkActivePlayer(){
    if(newGame.turn%2==0){
        return "p1"
    }else{
        return "p2"
    }
}

function clearBoard(){
    //clear skulls
    let enemyStatuschildren = document.getElementById("enemyStatus").children
    for(let i=0;i<enemyStatuschildren.length;i++){
        enemyStatuschildren[i][1]
    }
    //reset message color
    document.getElementById("message").style.color = "black"
    //clear controls
    document.getElementById("placementControls").style.visibility = "hidden"
    //clear overlays
    let playerOverlayDiv = document.getElementById("playerOverlay")
    playerOverlay.classList.add("collapsed")
    playerOverlay.classList.remove("expanded")
    playerOverlayDiv.textContent=""
    let enemyOverlayDiv = document.getElementById("enemyOverlay")
    enemyOverlay.classList.add("collapsed")
    enemyOverlay.classList.remove("expanded")
    enemyOverlayDiv.textContent=""
    document.getElementById("enemyBoard").style.opacity = "100%"
    //clear selected ship
    let children = document.getElementById("playerStatus").children
    for(let i=0;i<children.length-1;i++){
        children[i].children[0].classList.remove("shipSelected")
    }
    //clear messages
    document.getElementById("message").textContent = ""
    
    newGame.board.forEach((e)=>{
        let x = Number(e.X)
        let y = Number(e.Y)
        //clear enemy waters
        let enemyID = document.getElementById("enemy"+x+y)
        enemyID.classList.remove("hit")
        enemyID.classList.remove("miss")
        if(enemyID.childNodes.length>1){
            enemyID.children[0].remove()
        }
        //clear friendly waters
        let playerID = document.getElementById("player"+x+y)
        playerID.classList.remove("placement")
        playerID.classList.remove("friendly")
        playerID.classList.remove("hit")
        playerID.classList.remove("miss")
        if(playerID.childNodes.length>1){
            playerID.children[0].remove()
        }
    })
}

function renderShots(){
    let activePlayer = checkActivePlayer()
    newGame.board.forEach((e)=>{
        let x = Number(e.X)
        let y = Number(e.Y)
        let enemyID = document.getElementById("enemy"+x+y)
        let playerID = document.getElementById("player"+x+y)

        if(activePlayer=="p1"){
            if(e.p2Hit==true){
                enemyID.classList.add("hit")
            }else if(e.p2Miss==true){
                enemyID.classList.add("miss")
            }
            if(e.p1Hit==true){
                playerID.classList.add("hit")
            }else if(e.p1Miss==true){
                playerID.classList.add("miss")
            }
        }
        if(activePlayer=="p2"){
            if(e.p1Hit==true){
                enemyID.classList.add("hit")
            }else if(e.p1Miss==true){
                enemyID.classList.add("miss")
            }
            if(e.p2Hit==true){
                playerID.classList.add("hit")
            }else if(e.p2Miss==true){
                playerID.classList.add("miss")
            }
        }
    })
}

function placementPhase(){
    newGame.gameState = "placement"
    for(let i=0;i<shipType.length;i++){
        document.getElementById(`player${shipType[i].type}`).children[0].classList.remove("disabled")
    }
    clearBoard()
    document.getElementById("placementControls").style.visibility = "visible"
    newGame.gameState = gameStates[1]
    document.getElementById("playerStatus").style.width=`${squareSize*5}px`
    document.getElementById("enemyStatus").style.width=`${squareSize*5}px`
    document.getElementById("message").style.width= `${squareSize*16}px`
    document.querySelectorAll(".ship").forEach((e)=>{e.style.opacity="100%"})

    let enemyOverlay = document.getElementById("enemyOverlay");
    enemyOverlay.classList.add("collapsed")
    enemyOverlay.classList.remove("expanded")
    enemyOverlay.textContent = ""
    if(newGame.players[1].ships.length==5){
        newGame.turn++
        clearBoard()
        newGame.gameState="playing"
        renderFriendly()
    }else if(newGame.players[1].type=="ai"&&newGame.players[0].ships.length==5){
        newGame.randomShips("p2")
        newGame.turn++
        clearBoard()
        newGame.gameState="playing"
        renderFriendly()
        newGame.updateMessage("Awaiting orders Admiral "+newGame.players[checkActivePlayer().charAt(1)-1].name)
    }else{
        setTimeout((e)=>{
            enemyOverlay.classList.remove("collapsed")
            enemyOverlay.classList.add("expanded")
            setTimeout((e)=>{
                enemyOverlay.textContent = "Place each ship individually or position your fleet randomly (right-click to rotate)"
                newGame.updateMessage(`Awaiting orders to move into position, Admiral ${activePlayerName}`)
            },1000)
        },1000)
    }
    let activePlayer = checkActivePlayer()
    let activePlayerName;
    if(activePlayer=="p1"){
        activePlayerName = newGame.players[0].name
    }else if(activePlayer=="p2"&&newGame.players[1].type=="human"){
        activePlayerName = newGame.players[1].name
    }
}

export function setupPhase(){
    let playerOverlay = document.getElementById("playerOverlay");
    playerOverlay.classList.remove("collapsed")
    playerOverlay.classList.add("expanded")

    let bigRedButton = document.createElement("div")
    bigRedButton.id = "bigRedButton"
    bigRedButton.textContent = "START"
    playerOverlay.append(bigRedButton)
    setTimeout((e)=>{bigRedButton.style.opacity = "100%"},1000)
    bigRedButton.addEventListener("click", start)

    let enemyOverlay = document.getElementById("enemyOverlay");
    enemyOverlay.classList.remove("collapsed")
    enemyOverlay.classList.add("expanded")

    let logo = document.createElement("div")
    logo.textContent = "BATTLESHIP"
    logo.classList.add("logo")
    
    let input = document.createElement("div")
    input.classList.add("input")
    let nameP1Input = document.createElement("input")
    nameP1Input.id="p1NameInput"
    nameP1Input.autocomplete="off"
    nameP1Input.maxLength = 16
    nameP1Input.placeholder = "PLAYER 1 NAME"
    nameP1Input.setAttribute("autofocus","")
    nameP1Input.addEventListener("keypress", (e)=>{
        newGame.players[0].name = nameP1Input.value.charAt(0).toUpperCase()+nameP1Input.value.slice(1)
        if(e.key=="Enter"){
            start()
        }
    })
    let nameP2Input = document.createElement("input")
    nameP2Input.id="p1NameInput"
    nameP2Input.autocomplete="off"
    nameP2Input.maxLength = 16
    nameP2Input.placeholder = "PLAYER 2 NAME"
    nameP2Input.style.visibility = "hidden"
    nameP2Input.addEventListener("keypress", (e)=>{
        newGame.players[1].name = nameP2Input.value.charAt(0).toUpperCase()+nameP2Input.value.slice(1)
        if(e.key=="Enter"){
            start()
        }
    })

    function start(){
        if((nameP1Input.value&&dropdown.value=="Computer")||(nameP1Input.value&&dropdown.value=="Human"&&nameP2Input.value)){
            bigRedButton.classList.add("animateBigRedButton")
            setTimeout((e)=>{
                bigRedButton.style.visibility = "hidden"
                placementPhase()
            },500)
        }else{
            bigRedButton.classList.add("animateBigRedButton")
            setTimeout((e)=>{
                menuError.currentTime=0
                menuError.play()
                if(!nameP1Input.value){
                    newGame.updateMessage("Player 1 name required")
                    document.getElementById("message").style.color = "red"
                }else if(dropdown.value=="Select Player 2:"){
                    newGame.updateMessage("Choose Player 2")
                    document.getElementById("message").style.color = "red"
                }else{
                    newGame.updateMessage("Player 2 name required")
                    document.getElementById("message").style.color = "red"
                }
                bigRedButton.classList.remove("animateBigRedButton")
            }, 500)
        }
    }
    
    let dropdown = document.createElement("select")
    dropdown.id = "setPlayer2Dropdown"
    dropdown.className = "enemyDropdown"
    let option1 = document.createElement("option")
    option1.textContent = "Select Player 2:"
    let option2 = document.createElement("option")
    option2.textContent = "Human"
    let option3 = document.createElement("option")
    option3.textContent = "Computer"
    dropdown.append(option1, option2, option3)

    dropdown.addEventListener("click", (e)=>{
        click1.currentTime = 0;
        click1.play()
    })

    dropdown.addEventListener("change", (e)=>{
        if(dropdown.value=="Human"){
            nameP2Input.style.visibility = "visible"
            newGame.players[1].type="human"
        }else{
            nameP2Input.style.visibility = "hidden"
            newGame.players[1].type="ai"
        }
    });

    input.append(nameP1Input, dropdown, nameP2Input)
    
    enemyOverlay.append(logo, input)
    setTimeout((e)=>{
        logo.style.opacity="100%"
        input.style.opacity="100%"
    },1000)
}
function renderSkulls(){
    let activePlayer = checkActivePlayer()
    if(activePlayer=="p1"){
        newGame.players[1].ships.forEach((e)=>{
            if(e.sunk==true){
                document.getElementById(`enemy${e.type}Skull`).style.visibility = "visible"
            }
        })
    }else{

    }
}