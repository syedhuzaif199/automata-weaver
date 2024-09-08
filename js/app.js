import { SVGHandler } from "./SVGHandler.js";

const WIDTH = window.innerWidth,
  HEIGHT = window.innerHeight;

const svg = document.querySelector("svg");
const svgHandler = new SVGHandler(svg, WIDTH, HEIGHT);

document.addEventListener("keydown", (e) => {
  svgHandler.setKeyDown(e.key);
  console.log("keyPressed", e.key);
});

document.addEventListener("keyup", (e) => {
  e.preventDefault();
  svgHandler.setKeyDown(null);
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

document
  .querySelector("#delete-button")
  .addEventListener("click", onDeleteBtnClick);

document.querySelector("#zoom-reset").addEventListener("click", onZoomReset);

function onHomeClick(event) {
  svgHandler.resetSVG();
}

function onZoomIn(event) {
  svgHandler.zoomIn();
}

function onZoomOut(event) {
  svgHandler.zoomOut();
}

function onZoomReset(event) {
  svgHandler.resetZoom();
}

function onSelectBtnClick(event) {
  console.log("Select Button Clicked");
  svgHandler.setAction(svgHandler.actions.select);
}

function addTransition() {
  svgHandler.setAction(svgHandler.actions.addTransition);
}

function addState() {
  svgHandler.setAction(svgHandler.actions.addState);
}

function onDeleteBtnClick() {
  console.log("Delete Button Clicked");

  svgHandler.deleteSelected();
}

window.addEventListener("resize", () => {
  console.log("resize");
  svgHandler.resizeSVG(window.innerWidth, window.innerHeight);
});
