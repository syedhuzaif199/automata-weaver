import { clamp } from "./utils.js";
import { Arrow } from "./Arrow.js";
import { ControlPoint } from "./ControlPoint.js";
import { Transition } from "./Transition.js";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

const SELECTED_COLOR = "red";
const UNSELECTED_COLOR = "black";

const MINSCALE = 0.25;
const MAXSCALE = 4;

const states = Object.freeze({
  default: 0,
  panning: 1,
  dragging: 2,
});

const actions = Object.freeze({
  addState: 0,
  addTransition: 1,
  select: 2,
});

const actionToCursor = {
  [actions.addState]: "crosshair",
  [actions.addTransition]: "crosshair",
  [actions.select]: "default",
};

const stateToCursor = {
  [states.default]: "default",
  [states.panning]: "grabbing",
  [states.dragging]: "move",
};

class SVGHandler {
  constructor(svg, width, height) {
    this.svg = svg;
    this.width = width;
    this.height = height;
    this.viewBox = { x: 0, y: 0, width, height };
    this.scale = 1;
    this.state = states.default;
    this.action = actions.select;
    this.keyDown = null;
    this.controlPoints = [];
    this.transitions = [];
    this.startControlPoint = null;
    this.arrow = null;
    this.selectedControlPoint = null;
    this.states = states;
    this.actions = actions;

    this.setupSVG();
  }

  setupSVG() {
    this.svg.setAttribute("width", this.width);
    this.svg.setAttribute("height", this.height);
    this.svg.setAttribute("viewBox", this.getViewBoxString());
    this.svg.style.cursor = actionToCursor[this.action];
    this.addEventListeners();
  }

  resetSVG() {
    this.viewBox = { x: 0, y: 0, width: this.width, height: this.height };
    this.scale = 1;
    this.updateViewBox();
  }

  resizeSVG(width, height) {
    this.width = width;
    this.height = height;
    this.viewBox.width = width / this.scale;
    this.viewBox.height = height / this.scale;
    this.updateViewBox();
  }

  zoomInOnPoint(event) {
    const { offsetX, offsetY } = event;
    this.viewBox.x += offsetX / this.scale;
    this.viewBox.y += offsetY / this.scale;

    this.scale = clamp(MINSCALE, MAXSCALE, this.scale + 0.1);

    this.viewBox.x -= offsetX / this.scale;
    this.viewBox.y -= offsetY / this.scale;
    this.viewBox.width = this.width / this.scale;
    this.viewBox.height = this.height / this.scale;

    this.updateViewBox();
  }

  zoomOutOnPoint(event) {
    const { offsetX, offsetY } = event;
    this.viewBox.x += offsetX / this.scale;
    this.viewBox.y += offsetY / this.scale;

    this.scale = clamp(MINSCALE, MAXSCALE, this.scale - 0.1);

    this.viewBox.x -= offsetX / this.scale;
    this.viewBox.y -= offsetY / this.scale;
    this.viewBox.width = this.width / this.scale;
    this.viewBox.height = this.height / this.scale;

    this.updateViewBox();
  }

  zoomIn() {
    this.zoom(0.1);
  }

  zoomOut() {
    this.zoom(-0.1);
  }

  zoom(delta) {
    const [offsetX, offsetY] = [this.width / 2, this.height / 2];
    this.viewBox.x += offsetX / this.scale;
    this.viewBox.y += offsetY / this.scale;

    this.scale = clamp(MINSCALE, MAXSCALE, this.scale + delta);

    this.viewBox.x -= offsetX / this.scale;
    this.viewBox.y -= offsetY / this.scale;
    this.viewBox.width = this.width / this.scale;
    this.viewBox.height = this.height / this.scale;

    this.updateViewBox();
  }

  resetZoom() {
    const [offsetX, offsetY] = [this.width / 2, this.height / 2];
    this.viewBox.x += offsetX / this.scale;
    this.viewBox.y += offsetY / this.scale;

    this.scale = 1;

    this.viewBox.x -= offsetX / this.scale;
    this.viewBox.y -= offsetY / this.scale;
    this.viewBox.width = this.width / this.scale;
    this.viewBox.height = this.height / this.scale;
    this.updateViewBox();
  }

  updateViewBox() {
    this.svg.setAttribute("viewBox", this.getViewBoxString());
  }

  getViewBoxString() {
    return `${this.viewBox.x} ${this.viewBox.y} ${this.viewBox.width} ${this.viewBox.height}`;
  }

  changeState(newState) {
    this.state = newState;
    this.svg.style.cursor = stateToCursor[this.state];
  }

  screenToSVG(x, y) {
    return {
      x: x / this.scale + this.viewBox.x,
      y: y / this.scale + this.viewBox.y,
    };
  }

  pan(dx, dy) {
    this.viewBox.x -= dx / this.scale;
    this.viewBox.y -= dy / this.scale;
    this.updateViewBox();
  }

  setAction(action) {
    this.action = action;
    this.svg.style.cursor = actionToCursor[action];
    if (action !== actions.select) {
      this.deselect();
    }
  }

  setKeyDown(key) {
    this.keyDown = key;
  }

  addEventListeners() {
    this.svg.addEventListener("mousedown", (e) => this.onMouseDown(e));
    this.svg.addEventListener("mousemove", (e) => this.onMouseMove(e));
    this.svg.addEventListener("mouseup", (e) => this.onMouseUp(e));
    this.svg.addEventListener("mouseleave", (e) => this.onMouseLeave(e));
    this.svg.addEventListener("wheel", (e) => this.onMouseWheel(e));
  }

  onMouseDown(e) {
    e.preventDefault();

    if (e.button === 1 || (e.button === 0 && this.keyDown === " ")) {
      this.changeState(states.panning);
      return;
    }

    if (e.button === 0) {
      switch (this.action) {
        case actions.select:
          this.selectElement(e.offsetX, e.offsetY);
          break;
        case actions.addState:
          this.addState(e.offsetX, e.offsetY);
          break;
        case actions.addTransition:
          this.startTransition(e.offsetX, e.offsetY);
          break;
      }
    }
  }

  onMouseMove(e) {
    const { x, y } = this.screenToSVG(e.offsetX, e.offsetY);
    if (this.state === states.panning) {
      this.pan(e.movementX, e.movementY);
      return;
    }

    switch (this.action) {
      case actions.select:
        if (this.state === states.dragging) {
          this.selectedControlPoint.updatePosition(x, y);
          this.updateAllTransitions();
        }
        break;
      case actions.addTransition:
        if (this.startControlPoint) {
          this.updateTransition(e.offsetX, e.offsetY);
        }
        break;
    }
  }

  onMouseUp(e) {
    this.changeState(states.default);
    if (this.action === actions.addTransition && this.startControlPoint) {
      this.endTransition(e.offsetX, e.offsetY);
    }
  }

  onMouseLeave(e) {
    this.changeState(states.default);
  }

  onMouseWheel(e) {
    e.preventDefault();
    if (this.keyDown === "Control") {
      if (e.deltaY < 0) {
        this.zoomInOnPoint(e);
      } else {
        this.zoomOutOnPoint(e);
      }
    }
  }

  selectElement(offsetX, offsetY) {
    const { x, y } = this.screenToSVG(offsetX, offsetY);
    const cp = this.controlPoints.find((cp) => cp.contains(x, y));
    this.deselect();
    this.selectedControlPoint = cp ? cp : null;
    if (this.selectedControlPoint) {
      this.selectedControlPoint.setStrokeColor(SELECTED_COLOR);
      this.changeState(states.dragging);
    }
  }

  deselect() {
    if (this.selectedControlPoint) {
      this.selectedControlPoint.setStrokeColor(UNSELECTED_COLOR);
      this.selectedControlPoint = null;
    }
  }

  deleteSelected() {
    if (this.selectedControlPoint) {
      const index = this.controlPoints.indexOf(this.selectedControlPoint);
      this.controlPoints.splice(index, 1);
      const temp = [];
      this.transitions.forEach((transition) => {
        if (
          transition.startControlPoint === this.selectedControlPoint ||
          transition.endControlPoint === this.selectedControlPoint
        ) {
          temp.push(transition);
          transition.arrow.remove();
        }
      });

      temp.forEach((t) => {
        const index = this.transitions.indexOf(t);
        this.transitions.splice(index, 1);
      });

      this.selectedControlPoint.removeFromSVG();
      this.selectedControlPoint = null;
    }
    console.log("State after deletion");
    console.log("Control Points:");
    console.log(this.controlPoints);
    console.log("Transitions:");
    console.log(this.transitions);
  }

  addState(offsetX, offsetY) {
    const cp = new ControlPoint(
      this.svg,
      offsetX / this.scale + this.viewBox.x,
      offsetY / this.scale + this.viewBox.y
    );
    this.controlPoints.push(cp);
  }

  startTransition(offsetX, offsetY) {
    const { x, y } = this.screenToSVG(offsetX, offsetY);
    this.startControlPoint = this.controlPoints.find((cp) => cp.contains(x, y));
    if (!this.startControlPoint) {
      return;
    }
    this.arrow = new Arrow(
      this.svg,
      this.startControlPoint.x,
      this.startControlPoint.y,
      x,
      y
    );
  }

  updateTransition(offsetX, offsetY) {
    const { x, y } = this.screenToSVG(offsetX, offsetY);
    this.arrow.update(
      this.startControlPoint.x,
      this.startControlPoint.y,
      x,
      y,
      false
    );
  }

  endTransition(offsetX, offsetY) {
    const { x, y } = this.screenToSVG(offsetX, offsetY);
    const endControlPoint = this.controlPoints.find((cp) => cp.contains(x, y));
    if (!endControlPoint) {
      this.arrow.remove();
      return;
    }
    const doubleTransition = this.transitions.filter((transition) => {
      return (
        transition.startControlPoint === this.startControlPoint &&
        transition.endControlPoint === endControlPoint
      );
    });
    if (doubleTransition.length === 0) {
      this.arrow.update(
        this.startControlPoint.x,
        this.startControlPoint.y,
        endControlPoint.x,
        endControlPoint.y,
        true
      );
      this.transitions.push(
        new Transition(
          this.svg,
          this.startControlPoint,
          endControlPoint,
          this.arrow
        )
      );
    } else {
      this.arrow.remove();
    }
    this.startControlPoint = null;
  }

  updateAllTransitions() {
    this.transitions.forEach((transition) => {
      transition.arrow.update(
        transition.startControlPoint.x,
        transition.startControlPoint.y,
        transition.endControlPoint.x,
        transition.endControlPoint.y,
        true
      );
    });
  }
}

export { SVGHandler };
