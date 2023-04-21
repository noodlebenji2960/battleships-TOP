import { createGameboards } from "./DOM.js";
import { setupPhase } from "./DOM.js";

window.addEventListener("load", preload)

function preload(){
    document.querySelector("body").style.opacity = 1
    document.querySelector("body").style.visibility = "visible"
}

createGameboards()
setupPhase()