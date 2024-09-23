import { SVGHandler } from "./SVGHandler.js";
import { DFASimulationHandler } from "./dfaSimulationHandler.js";
import { NFASimulationHandler } from "./nfaSimulationHandler.js";

const svg = document.querySelector("svg");
const svgHandler = new SVGHandler(svg, window.innerWidth, window.innerHeight);

let simulationHandler;

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

document.querySelector("#menu-pane").childNodes.forEach((child) => {
  child.addEventListener("click", (e) => {
    console.log("Menu Pane Clicked");
    const pane = document.querySelector("#menu-pane");
    pane.style.display = "none";
  });
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

const loadJSONBtn = document.querySelector("#load-json");
loadJSONBtn.addEventListener("click", onLoadJSONBtnClick);

const saveJSONBtn = document.querySelector("#save-json");
saveJSONBtn.addEventListener("click", onSaveJSONBtnClick);

const savePdfBtn = document.querySelector("#save-pdf");
savePdfBtn.addEventListener("click", onSavePdfBtnClick);

const clearCanvasBtn = document.querySelector("#clear-btn");
clearCanvasBtn.addEventListener("click", onClearCanvasBtnClick);

const playPauseBtn = document.querySelector("#play-pause");
playPauseBtn.addEventListener("click", onPlayPauseBtnClick);

const onPauseCallback = () => {
  playPauseBtn.children[0].src = "./assets/play.svg";
};

const previousBtn = document.querySelector("#previous");
previousBtn.addEventListener("click", onPreviousBtnClick);

const nextBtn = document.querySelector("#next");
nextBtn.addEventListener("click", onNextBtnClick);

const rewindBtn = document.querySelector("#rewind");
rewindBtn.addEventListener("click", onRewindBtnClick);

const fastForwardBtn = document.querySelector("#fast-forward");
fastForwardBtn.addEventListener("click", onFastForwardBtnClick);

const addInputBtn = document.querySelector("#add-input");
addInputBtn.addEventListener("click", () => onAddInputBtnClick());

const removeInputBtn = document.querySelector("#remove-input");
removeInputBtn.addEventListener("click", () => onRemoveInputBtnClick());

const machineTypeSelect = document.querySelector("#machine-type");
machineTypeSelect.addEventListener("change", onMachineTypeChange);

const machineOptionsBtn = document.querySelector("#machine-options");
machineOptionsBtn.addEventListener("click", onMachineOptionsBtnClick);

function onAddInputBtnClick(e) {
  const inputBox = document.querySelector("#input");
  const inputField = document.createElement("input");
  inputField.classList.add("input-field");
  inputField.type = "text";
  inputBox.appendChild(inputField);
}

function onRemoveInputBtnClick(e) {
  const inputBox = document.querySelector("#input");
  const inputFields = document.querySelectorAll(".input-field");
  if (inputFields.length > 1) {
    inputBox.removeChild(inputFields[inputFields.length - 1]);
  }
}

function setMachineType(machineType) {
  console.log("Machine Type Changed", machineType);
  switch (machineType) {
    case "dfa":
      simulationHandler = new DFASimulationHandler(svgHandler, onPauseCallback);
      break;
    case "nfa":
      simulationHandler = new NFASimulationHandler(svgHandler, onPauseCallback);
      break;

    default:
      simulationHandler = new DFASimulationHandler(svgHandler, onPauseCallback);
      break;
  }
}

setMachineType(machineTypeSelect.value);

function onMachineTypeChange(e) {
  const machineType = e.target.value;
  setMachineType(machineType);
}

function onMachineOptionsBtnClick(e) {
  console.log("Machine Options Button Clicked");
  // const options = document.querySelector("#machine-options-pane");
  // options.style.display = options.style.display === "none" ? "flex" : "none";
  if (machineTypeSelect.value === "dfa") {
    simulationHandler.drawMinimizedDFA();
  } else if (machineTypeSelect.value === "nfa") {
    simulationHandler.convertToDFA();
  }
}

function onClearCanvasBtnClick() {
  if (confirm("Are you sure you want to clear the canvas?")) {
    svgHandler.clear();
  }
}

function onPlayPauseBtnClick() {
  simulationHandler.handlePlayPause();
  if (simulationHandler.isPlaying) {
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
  simulationHandler.isPlaying = true;
  playPauseBtn.children[0].src = "./assets/play.svg";

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

function updateZoomResetBtn() {
  zoomResetBtn.innerHTML = parseInt(svgHandler.getScale() * 100) + "%";
}

function onHomeClick(event) {
  svgHandler.resetSVG();
  updateZoomResetBtn();
}

function onZoomIn(event) {
  svgHandler.zoomIn();
  updateZoomResetBtn();
}

function onZoomOut(event) {
  svgHandler.zoomOut();
  updateZoomResetBtn();
}

function onZoomReset(event) {
  svgHandler.resetZoom();
  updateZoomResetBtn();
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

function onSaveJSONBtnClick(e) {
  console.log("Save JSON Button Clicked");
  svgHandler.saveToLocalStorage();
}

function onLoadJSONBtnClick(e) {
  console.log("Load JSON Button Clicked");
  svgHandler.loadFromLocalStorage();
}

function onSavePdfBtnClick(e) {
  console.log("Save PDF Button Clicked");
  window.print();
}

window.addEventListener("resize", () => {
  console.log("resize");
  svgHandler.resizeSVG(window.innerWidth, window.innerHeight);
});

document.addEventListener("DOMContentLoaded", () => {
  const pane = document.querySelector("#menu-pane");
  pane.style.display = "none";
});

document.addEventListener("wheel", (e) => {
  updateZoomResetBtn();
});
