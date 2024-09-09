import { SVGHandler } from "./SVGHandler.js";
import { SimulationHandler } from "./simulationHandler.js";

const svg = document.querySelector("svg");
const svgHandler = new SVGHandler(svg, window.innerWidth, window.innerHeight);

const simulationHandler = new SimulationHandler(svgHandler);

document.addEventListener("keydown", (e) => {
  svgHandler.setKeyDown(e.key);
  console.log("keyPressed", e.key);
  if (svgHandler.textField.style.visibility === "visible") {
    return;
  }
  switch (e.key) {
    case "s":
    case "S":
      svgHandler.setAction(svgHandler.actions.select);
      setActiveButton(selectBtn);
      break;

    case "a":
    case "A":
      svgHandler.setAction(svgHandler.actions.addState);
      setActiveButton(addStateBtn);
      break;

    case "t":
    case "T":
      svgHandler.setAction(svgHandler.actions.addTransition);
      setActiveButton(addTransitionBtn);
      break;
    case "Delete":
    case "Backspace":
    case "d":
    case "D":
      svgHandler.deleteSelected();
      break;
    case "f":
    case "F":
      onFlagBtnClick();
      break;
  }
});

document.addEventListener("keyup", (e) => {
  e.preventDefault();
  svgHandler.setKeyDown(null);
});

const homeBtn = document.querySelector("#home");
homeBtn.addEventListener("click", onHomeClick);

const zoomInBtn = document.querySelector("#zoom-in");
zoomInBtn.addEventListener("click", onZoomIn);

const zoomOutBtn = document.querySelector("#zoom-out");
zoomOutBtn.addEventListener("click", onZoomOut);

const addTransitionBtn = document.querySelector("#add-transition");
addTransitionBtn.addEventListener("click", onAddTransitionBtnClick);

const addStateBtn = document.querySelector("#add-state");
addStateBtn.addEventListener("click", onAddStateBtnClick);

const selectBtn = document.querySelector("#select-button");
selectBtn.addEventListener("click", onSelectBtnClick);

const flagBtn = document.querySelector("#flag-final-button");
flagBtn.addEventListener("click", onFlagBtnClick);

const deleteBtn = document.querySelector("#delete-button");
deleteBtn.addEventListener("click", onDeleteBtnClick);

const zoomResetBtn = document.querySelector("#zoom-reset");
zoomResetBtn.addEventListener("click", onZoomReset);

const menuBtn = document.querySelector("#menu-btn");
menuBtn.addEventListener("click", onMenuBtnClick);

const playPauseBtn = document.querySelector("#play-pause");
playPauseBtn.addEventListener("click", onPlayPauseBtnClick);

const previousBtn = document.querySelector("#previous");
previousBtn.addEventListener("click", onPreviousBtnClick);

const nextBtn = document.querySelector("#next");
nextBtn.addEventListener("click", onNextBtnClick);

const rewindBtn = document.querySelector("#rewind");
rewindBtn.addEventListener("click", onRewindBtnClick);

const fastForwardBtn = document.querySelector("#fast-forward");
fastForwardBtn.addEventListener("click", onFastForwardBtnClick);

function onPlayPauseBtnClick() {
  simulationHandler.handlePlayPause();
  if (!simulationHandler.paused) {
    playPauseBtn.children[0].src = "./assets/pause.svg";
  } else {
    playPauseBtn.children[0].src = "./assets/play.svg";
  }
}

function onPreviousBtnClick() {
  simulationHandler.handlePrevious();
}

function onNextBtnClick() {
  simulationHandler.handleNext();
}

function onRewindBtnClick() {
  simulationHandler.handleRewind();
}

function onFastForwardBtnClick() {
  simulationHandler.handleFastForward();
}

let activeButton = addStateBtn;
svgHandler.setAction(svgHandler.actions.addState);
setActiveButton(activeButton);

function setActiveButton(button) {
  console.log("Setting Active Button");
  if (activeButton) {
    activeButton.classList.remove("active");
  }
  activeButton = button;
  activeButton.classList.add("active");
}

function onHomeClick(event) {
  svgHandler.resetSVG();
}

function onZoomIn(event) {
  svgHandler.zoomIn();
  zoomResetBtn.innerHTML = parseInt(svgHandler.getScale() * 100) + "%";
}

function onZoomOut(event) {
  svgHandler.zoomOut();
  zoomResetBtn.innerHTML = parseInt(svgHandler.getScale() * 100) + "%";
}

function onZoomReset(event) {
  svgHandler.resetZoom();
  zoomResetBtn.innerHTML = parseInt(svgHandler.getScale() * 100) + "%";
}

function onSelectBtnClick(event) {
  console.log("Select Button Clicked");
  svgHandler.setAction(svgHandler.actions.select);
  setActiveButton(selectBtn);
}

function onAddTransitionBtnClick() {
  svgHandler.setAction(svgHandler.actions.addTransition);
  setActiveButton(addTransitionBtn);
}

function onAddStateBtnClick() {
  svgHandler.setAction(svgHandler.actions.addState);
  setActiveButton(addStateBtn);
}

function onFlagBtnClick() {
  console.log("Flag Button Clicked");
  svgHandler.flagAsFinalState();
}

function onDeleteBtnClick() {
  console.log("Delete Button Clicked");

  svgHandler.deleteSelected();
}

function onMenuBtnClick(e) {
  console.log("Menu Button Clicked");
  const pane = document.querySelector("#menu-pane");
  pane.style.display = pane.style.display === "none" ? "flex" : "none";
}

window.addEventListener("resize", () => {
  console.log("resize");
  svgHandler.resizeSVG(window.innerWidth, window.innerHeight);
});

document.addEventListener("DOMContentLoaded", () => {
  const pane = document.querySelector("#menu-pane");
  pane.style.display = "none";
  playPauseBtn.children[0].src = "./assets/play.svg";
  s;
});

document.addEventListener("wheel", (e) => {
  zoomResetBtn.innerHTML = parseInt(svgHandler.getScale() * 100) + "%";
});
