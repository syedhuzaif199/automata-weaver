import {
  setKeyDown,
  setupSVG,
  ControlPoint,
  QBezier,
  resetSVG,
  svgZoomIn,
  setAction,
  actions,
  svgZoomOut,
} from "./svg.js";

const WIDTH = 800,
  HEIGHT = 800;

const svg = document.querySelector("svg");
setupSVG(svg, WIDTH, HEIGHT);
const bezier = new QBezier(svg, 50, 50, 150, 150, 250, 50);

document.addEventListener("keydown", (e) => {
  setKeyDown(e.key);
  console.log("keyPressed", e.key);
});

document.addEventListener("keyup", (e) => {
  e.preventDefault();
  setKeyDown(null);
});

document.querySelector("#home").addEventListener("click", onHomeClick);
document.querySelector("#zoom-in").addEventListener("click", onZoomIn);
document.querySelector("#zoom-out").addEventListener("click", onZoomOut);
document
  .querySelector("#add-transition")
  .addEventListener("click", addTransition);

document.querySelector("#add-state").addEventListener("click", addState);
document
  .querySelector("#select-button")
  .addEventListener("click", onSelectBtnClick);

function onHomeClick(event) {
  resetSVG();
}

function onZoomIn(event) {
  svgZoomIn();
}

function onZoomOut(event) {
  svgZoomOut();
}

function onSelectBtnClick(event) {
  console.log("Select Button Clicked");
  setAction(actions.select);
}

function addTransition() {
  console.log("Transition");
  Array.from(svg.children).forEach((element) => {
    console.log(element);
  });
  setAction(actions.addTransition);
}

function addState() {
  console.log("Added state");
  setAction(actions.addState);
}
