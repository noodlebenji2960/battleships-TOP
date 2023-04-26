import { GameController } from "./logic.js";
import { createGameboards } from "./DOM.js";
import { setupPhase } from "./DOM.js";

//preloader
window.addEventListener("load", preload)
function preload(){
    document.querySelector("body").style.opacity = 1
    document.querySelector("body").style.visibility = "visible"
}

//create new game
export let newGame = new GameController()

//DOM setup
createGameboards()
setupPhase()