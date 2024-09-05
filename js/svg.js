import { clamp } from "./utils.js";

let scale = 1;
const MINSCALE = 0.25;
const MAXSCALE = 4;

let keyDown = null;
let svg = null;
let viewBox = null;

let states = Object.freeze({
  default: 0,
  panning: 1,
});
let state = states.default;
let action = null;

let controlPoints = [];

const actions = Object.freeze({
  addState: 0,
  addTransition: 1,
  select: 2,
});

let WIDTH = 800;
let HEIGHT = 800;

export function setAction(ac) {
  action = ac;
}

export function setKeyDown(key) {
  keyDown = key;
  if (keyDown === " ") {
    svg.style.cursor = "grab";
  } else {
    svg.style.cursor = "default";
  }
}

export function setupSVG(s, width, height) {
  svg = s;
  WIDTH = width;
  HEIGHT = height;
  viewBox = {
    x: 0,
    y: 0,
    width,
    height,
  };
  svg.setAttributeNS(null, "viewBox", getViewBoxString(viewBox));
  svgAddEventListeners(svg);
}

export function getViewBoxString(viewBox) {
  return `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`;
}

export function resetSVG() {
  viewBox = {
    x: 0,
    y: 0,
    width: WIDTH,
    height: HEIGHT,
  };
  scale = 1;
  svg.setAttributeNS(null, "viewBox", getViewBoxString(viewBox));
}

export function svgZoomIn() {
  const [offsetX, offsetY] = [WIDTH / 2, HEIGHT / 2];
  viewBox.x += offsetX / scale;
  viewBox.y += offsetY / scale;

  scale += 0.1;
  scale = clamp(MINSCALE, MAXSCALE, scale);
  viewBox.x -= offsetX / scale;
  viewBox.y -= offsetY / scale;
  viewBox.width = WIDTH / scale;
  viewBox.height = HEIGHT / scale;

  svg.setAttributeNS(null, "viewBox", getViewBoxString(viewBox));
}

export function svgZoomOut() {
  const [offsetX, offsetY] = [WIDTH / 2, HEIGHT / 2];
  viewBox.x += offsetX / scale;
  viewBox.y += offsetY / scale;

  scale -= 0.1;
  scale = clamp(MINSCALE, MAXSCALE, scale);

  viewBox.x -= offsetX / scale;
  viewBox.y -= offsetY / scale;
  viewBox.width = WIDTH / scale;
  viewBox.height = HEIGHT / scale;

  svg.setAttributeNS(null, "viewBox", getViewBoxString(viewBox));
}

function svgAddEventListeners(svg) {
  svg.addEventListener("mousedown", (e) => svgOnMouseDown(e));
  svg.addEventListener("mousemove", (e) => svgOnMouseMove(e));
  svg.addEventListener("mouseup", () => svgOnMouseUp());
  svg.addEventListener("mouseleave", () => svgOnMouseLeave());
  svg.addEventListener("wheel", (e) => svgOnMouseWheel(e));
}

function svgOnMouseDown(e) {
  const { offsetX, offsetY } = e;

  console.log("offsetX", offsetX, "offsetY", offsetY);
  e.preventDefault();

  if (e.button === 1) {
    state = states.panning;
    svg.style.cursor = "grab";
  } else if (e.button === 0) {
    if (action == actions.addState) {
      const cp = new ControlPoint(
        svg,
        offsetX / scale + viewBox.x,
        offsetY / scale + viewBox.y
      );
      controlPoints.push(cp);
    }
    if (keyDown === " ") {
      state = states.panning;
    }
  }
}

function svgOnMouseMove(e) {
  if (state === states.panning) {
    svg.style.cursor = "grabbing";
    viewBox.x -= e.movementX / scale;
    viewBox.y -= e.movementY / scale;
    svg.setAttributeNS(null, "viewBox", getViewBoxString(viewBox));
  }
}

function svgOnMouseUp(e) {
  svg.style.cursor = "default";
  state = states.default;
}

function svgOnMouseLeave() {
  svg.style.cursor = "default";
  state = states.default;
}

function svgOnMouseWheel(e) {
  e.preventDefault();
  if (keyDown === "Control") {
    if (e.deltaY < 0) {
      zoomInOnPoint(e);
    } else {
      zoomOutOnPoint(e);
    }
  }
}

function zoomInOnPoint(event) {
  const { offsetX, offsetY } = event;
  viewBox.x += offsetX / scale;
  viewBox.y += offsetY / scale;

  scale = clamp(MINSCALE, MAXSCALE, scale + 0.1);

  viewBox.x -= offsetX / scale;
  viewBox.y -= offsetY / scale;
  viewBox.width = WIDTH / scale;
  viewBox.height = HEIGHT / scale;

  svg.setAttributeNS(null, "viewBox", getViewBoxString(viewBox));
}

function zoomOutOnPoint(event) {
  const { offsetX, offsetY } = event;
  viewBox.x += offsetX / scale;
  viewBox.y += offsetY / scale;

  scale = clamp(MINSCALE, MAXSCALE, scale - 0.1);

  viewBox.x -= offsetX / scale;
  viewBox.y -= offsetY / scale;
  viewBox.width = WIDTH / scale;
  viewBox.height = HEIGHT / scale;

  svg.setAttributeNS(null, "viewBox", getViewBoxString(viewBox));
}

class ControlPoint {
  constructor(
    svg,
    x,
    y,
    radius = 10,
    fill = "blue",
    stroke = "black",
    stroke_width = "1px"
  ) {
    this.ns = "http://www.w3.org/2000/svg";
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.fill = fill;
    this.stroke = stroke;
    this.stroke_width = stroke_width;
    this.circle = document.createElementNS(this.ns, "circle");
    this.circle.setAttributeNS(null, "cx", this.x);
    this.circle.setAttributeNS(null, "cy", this.y);
    this.circle.setAttributeNS(null, "r", this.radius);
    this.circle.setAttributeNS(null, "fill", this.fill);
    this.circle.setAttributeNS(null, "stroke", this.stroke);
    this.circle.setAttributeNS(null, "stroke-width", this.stroke_width);
    this.locked = false;
    this.svg = svg;
    this.svg.appendChild(this.circle);
  }

  addEventListener(eventName, listener) {
    this.circle.addEventListener(eventName, listener);
  }

  updatePosition(x, y) {
    this.x = x;
    this.y = y;
    this.circle.setAttributeNS(null, "cx", this.x);
    this.circle.setAttributeNS(null, "cy", this.y);
  }

  contains(x, y) {
    return Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2) < this.radius;
  }
}

class QBezier {
  constructor(
    svg,
    x0,
    y0,
    x1,
    y1,
    x2,
    y2,
    stroke = "red",
    stroke_width = "2px"
  ) {
    this.ns = "http://www.w3.org/2000/svg";
    this.svg = svg;
    this.qBezier = document.createElementNS(this.ns, "path");
    this.svg.appendChild(this.qBezier);
    this.controlPoints = [
      new ControlPoint(this.svg, x0, y0),
      new ControlPoint(this.svg, x1, y1),
      new ControlPoint(this.svg, x2, y2),
    ];
    this.stroke = stroke;
    this.stroke_width = stroke_width;
    this.qBezier.setAttributeNS(null, "fill", "none");
    this.qBezier.setAttributeNS(null, "stroke", this.stroke);
    this.qBezier.setAttributeNS(null, "stroke-width", this.stroke_width);
    this.updatePath();
    this.addEventListeners();
  }

  updatePath() {
    const [p0, p1, p2] = this.controlPoints;
    this.qBezier.setAttributeNS(
      null,
      "d",
      `M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`
    );
  }

  addEventListeners() {
    this.controlPoints.forEach((cp) => {
      cp.addEventListener("mousedown", (e) => this.onMouseDown(e, cp));
    });
    this.svg.addEventListener("mousemove", (e) => this.onMouseMove(e));
    this.svg.addEventListener("mouseup", () => this.onMouseUp());
    this.svg.addEventListener("mouseleave", () => this.onMouseUp());
  }

  onMouseDown(e, cp) {
    e.preventDefault();
    this.dragging = cp;
  }

  onMouseMove(e) {
    if (this.dragging) {
      const { offsetX, offsetY } = e;
      let x = 0,
        y = 0;
      // width,
      // height;
      if (this.svg.getAttribute("viewBox")) {
        // [x, y] = this.svg.getAttribute("viewBox").split(" ").map(parseFloat);
        x = viewBox.x;
        y = viewBox.y;
      }
      this.dragging.updatePosition(offsetX / scale + x, offsetY / scale + y);
      this.updatePath();
    }
  }

  onMouseUp() {
    this.dragging = null;
  }
}

export { scale, actions, ControlPoint, QBezier };
