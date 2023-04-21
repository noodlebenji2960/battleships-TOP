export let gameStates = ["init", "placement", "playing", "endGame"]

export let shipType = [     {type: "carrier", length: 5, imgURL:"img/1.svg", audio:new Audio()},
                            {type: "battleship", length: 4, imgURL:"img/4.svg", audio:new Audio},
                            {type: "destroyer", length: 3, imgURL:"img/5.svg", audio:new Audio("audio/destroyer.mp3")},
                            {type: "submarine", length: 3, imgURL:"img/6.svg", audio:new Audio ("audio/submarine.mp3")},
                            {type: "patrolboat", length: 2, imgURL:"img/2.svg", audio:new Audio("audio/patrolboat.mp3")}
                ]

export class Ship{
    constructor(type, player){
        let shipObj = shipType.find((ele)=>{if(type==ele.type){return true}})
        this.type = shipObj.type
        this.length = shipObj.length;
        this.imgURL = shipObj.imgURL;
        this.hits = 0;
        this.sunk = false;
        this.owner = player
    }
    hit(){
        this.hits++;
        this.isSunk()
    }
    isSunk(){
        if(this.hits>=this.length){
            this.sunk = true;
        }
    }
}

export class Player{
    constructor(id, color, type, name){
        this.id = id
        this.name = name
        this.color = color
        this.type = type
        this.ships = []
    }
}

export class GameController{
    constructor(){
        this.gameState = null
        this.players = [],
        this.turn = 0,
        this.message = null,
        this.winner = null
        this.board = [];
    }
    initialize(playerType){
        if(playerType=="human"){
            this.PvPinitialize()
        }else{
            this.PvEinitialize()
        }

        for(let x=0;x<=9;x++){
            for(let y=0;y<=9;y++){
                this.board.push({X:x, Y:y, p1Ship:null, p1Hit:false, p1Miss:false, p2Ship:null, p2Hit:false, p2Miss:false});
            }
        }
    }
    nextTurn(){
        this.checkWinner()
        this.turn++
    }
    placeShip(id, type, isVertical, activePlayer){
        let ship = new Ship(type, activePlayer)
        let x = Number(id.charAt(6))
        let y = Number(id.charAt(7))
        if((x+ship.length<=10&&isVertical==false)||y+1-ship.length>0&&isVertical==true){
            if(activePlayer=="p1"){
                this.players[0].ships.push(ship)
            } else {
                this.players[1].ships.push(ship)
            }

            for(let i=0;i<ship.length;i++){
                let coordObj = this.board.find((ele)=>{if((ele.X==x)&&(ele.Y==y)){
                    return true
                }})

                if(activePlayer=="p1"){
                    coordObj.p1Ship = ship
                } else {
                    coordObj.p2Ship = ship
                }
                if(isVertical==true){
                    y = y-1
                }else{
                    x = x+1
                }
            }
        }
    }
    ai(){
        let unOccupied = []
        for(let i=0;i<this.board.length;i++){
            if(!this.board[i].p1Hit||!this.board[i].p1Miss){
                let x = this.board[i].X
                let y = this.board[i].Y
                unOccupied.push(`${x}${y}`)
            } else{
            }
        }
        let randomUnoccupiedIndex = Math.floor(Math.random()*unOccupied.length)
        let randomUnoccupied = `enemy${unOccupied[randomUnoccupiedIndex]}`
        if(this.recieveAttack(randomUnoccupied, "p2")==true){
            return true
        }else{
            return false
        }
    }
    checkPossible(id, ship, isVertical, activePlayer){
        let occupied = []
        let notOccupied = []
        let x = Number(id.charAt(6));
        let y = Number(id.charAt(7));
        if((x<=10-ship.length&&isVertical==false)||(y+1>=ship.length&&isVertical==true)){
            for(let o=0;o<this.board.length;o++){
                let X = this.board[o].X
                let Y = this.board[o].Y
                if(this.board[o].p1Ship==null&&activePlayer=="p1"){
                    notOccupied.push(`${X}${Y}`)
                }else if(this.board[o].p2Ship==null&&activePlayer=="p2"){
                    notOccupied.push(`${X}${Y}`)
                }else{
                    occupied.push(`${X}${Y}`)
                }
            }
            for(let z=0;z<ship.length;z++){
                if(occupied.includes(`${x}${y}`)){
                    return false
                }else{}
                if(isVertical==false){
                    x = x+1
                }else{
                    y = y-1
                }
            }
            return true
        }else{
            return false
        }
    }
    randomShips(activePlayer){
        let occupied = []
        let notOccupied = []
        for(let i=0;i<shipType.length;i++){
            let type = shipType[i].type
            let isVertical = Math.random() < 0.5
            let x;
            let y;

            for(let o=0;o<this.board.length;o++){
                let X = this.board[o].X
                let Y = this.board[o].Y
                if(this.board[o].p1Ship==null&&activePlayer=="p1"){
                    notOccupied.push(`${X}${Y}`)
                }else if(this.board[o].p2Ship==null&&activePlayer=="p2"){
                    notOccupied.push(`${X}${Y}`)
                }else{
                    occupied.push(`${X}${Y}`)
                }
            }

            function getNum(){
                if(isVertical==false){
                    let max = (9-shipType[i].length)
                    x = Number(Math.floor(Math.random() * (max - 0 + 1) + 0))
                    y = Number(Math.floor(Math.random() * (9 - 0 + 1) + 0))
                }else{
                    let min = shipType[i].length
                    x = Number(Math.floor(Math.random() * (9 - min + 1) + min))
                    y = Number(Math.floor(Math.random() * (9 - min + 1) + min))
                }
                let randomID = `${x}${y}`

                for(let z=0;z<shipType[i].length;z++){
                    if (occupied.includes(`${x}${y}`)){
                        return getNum()
                    }
                    if(isVertical==false){
                        x = x+1
                    }else{
                        y = y-1
                    }
                }
                return randomID
            }
            let randomID = `player${getNum()}`
            this.placeShip(randomID,type,isVertical,activePlayer)
        }
        this.gameState = "playing"
    }
    recieveAttack(id, activePlayer){
        let x = Number(id.charAt(5))
        let y = Number(id.charAt(6))

        let coordObj = this.board.find((ele)=>{if((ele.X==x)&&(ele.Y==y)){
            return true
        }})
        if(coordObj.p1Ship==null&&activePlayer=="p2"){
            coordObj.p1Miss=true
            this.nextTurn()
            this.checkWinner()
            return false
        }else if(coordObj.p1Ship!==null&&activePlayer=="p2"){
            coordObj.p1Hit=true
            coordObj.p1Ship.hit(activePlayer)
            this.nextTurn()
            this.checkWinner()
            return true
        }else if(coordObj.p2Ship==null&&activePlayer=="p1"){
            coordObj.p2Miss=true
            this.nextTurn()
            this.checkWinner()
            return false
        }else if(coordObj.p2Ship!==null&&activePlayer=="p1"){
            coordObj.p2Hit=true
            coordObj.p2Ship.hit(activePlayer)
            this.nextTurn()
            this.checkWinner()
            return true
        }else{
        }
    }
    PvPinitialize(){
        this.gameState = gameStates[0]
        this.players = []
        this.players.push(new Player("p1", "blue", "human"))
        this.players.push(new Player("p2", "red", "human"))
    }
    PvEinitialize(){
        this.gameState = gameStates[0]
        this.players = []
        this.players.push(new Player("p1", "blue", "human"))
        this.players.push(new Player("p2", "red", "ai"))
    }
    checkWinner(){
        let p1Check = this.players[0].ships.every((e)=>{
            if(e.sunk == true){
                return true
            }
        });
        let p2Check = this.players[1].ships.every((e) => {
            if(e.sunk == true){
                return true
            }
        });

        if(p2Check == true){
            this.winner = "p1"
            this.updateMessage("P1 Wins!")
        } else if(p1Check == true){
            this.winner == "p2"
            this.updateMessage("P2 Wins!")
        }else{
            return
        }
    }
    updateMessage(string){
        document.getElementById("message").textContent = ""
        clearTimeout(timeoutMessage)
        var i = 0;
        var speed = 18;
        
        (function typeWriter() {
          if (i < string.length) {
            document.getElementById("message").textContent += string.charAt(i);
            i++;
            timeoutMessage = setTimeout(typeWriter, speed);
          }
        })()
    }
}
let timeoutMessage;