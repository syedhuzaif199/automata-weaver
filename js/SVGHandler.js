import { clamp } from "./utils.js";
import { Arrow } from "./Arrow.js";
import { ControlPoint } from "./ControlPoint.js";
import { Transition } from "./Transition.js";

import {
  SELECTED_COLOR,
  UNSELECTED_COLOR,
  HIGHLIGHTED_COLOR,
  MINSCALE,
  MAXSCALE,
  TEXT_SIZE,
  CONTROL_POINT_SIZE,
  TEXT_FONT,
  UNHIGHLIGHTED_COLOR,
  FAIL_COLOR,
  SUCCESS_COLOR,
} from "./constants.js";

const states = Object.freeze({
  default: 0,
  panning: 1,
  dragging: 2,
});

const actions = Object.freeze({
  addState: 0,
  addTransition: 1,
  select: 2,
  addText: 3,
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

const selectionTypes = Object.freeze({
  controlPoint: 0,
  transition: 1,
  none: 2,
});

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
    this.selectedElement = null;
    this.selectionType = selectionTypes.none;
    this.states = states;
    this.actions = actions;
    this.textField = this.createTextField();
    this.inputNode = new ControlPoint(this.svg, width / 4, height / 2);
    this.inputNode.setText("Input");
    this.controlPoints.push(this.inputNode);
    this.highlightedControlPoint = null;
    this.failControlPoint = null;
    this.successControlPoint = null;

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

  updateTextBoxTransforms() {
    if (this.isTextFieldVisible()) {
      const { x, y } = this.selectedElement.getCenter();
      const { x: screenX, y: screenY } = this.SVGToScreen({ x, y });
      this.textField.style.left =
        screenX - this.textField.style.width.replace("px", "") / 2 + "px";
      this.textField.style.top =
        screenY - this.textField.style.height.replace("px", "") / 2 + "px";
      this.textField.style.width = 2 * CONTROL_POINT_SIZE * this.scale + "px";
      this.textField.style.height = TEXT_SIZE * this.scale + "px";
    }
  }

  getScale() {
    return this.scale;
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
    this.updateTextBoxTransforms();
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

  SVGToScreen({ x, y }) {
    return {
      x: (x - this.viewBox.x) * this.scale,
      y: (y - this.viewBox.y) * this.scale,
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
    // deselect any selected elements if any button other than select is pressed
    if (action !== actions.select) {
      this.deselect();
    }
    this.hideTextField();
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

  setSelectedElementText(text) {
    if (this.selectionType !== selectionTypes.none) {
      this.selectedElement.setText(text);
    }
  }

  highlightControlPoint(element) {
    if (this.highlightedControlPoint) {
      this.highlightedControlPoint.setFillColor(UNHIGHLIGHTED_COLOR);
    }
    element.setFillColor(HIGHLIGHTED_COLOR);
    this.highlightedControlPoint = element;
  }

  highlightTransition(transition) {
    transition.setStrokeColor(HIGHLIGHTED_COLOR);
  }

  unHighlightTransition(transition) {
    transition.setStrokeColor(UNSELECTED_COLOR);
  }

  setFailState(element) {
    if (this.failControlPoint) {
      this.failControlPoint.setFillColor(UNHIGHLIGHTED_COLOR);
    }
    element.setFillColor(FAIL_COLOR);
    this.failControlPoint = element;
  }

  setSuccessState(element) {
    if (this.successControlPoint) {
      this.successControlPoint.setFillColor(UNHIGHLIGHTED_COLOR);
    }
    element.setFillColor(SUCCESS_COLOR);
    this.successControlPoint = element;
  }

  createTextField() {
    const textField = document.createElement("input");
    textField.setAttribute("type", "text");
    textField.style.position = "absolute";
    textField.style.visibility = "hidden";
    textField.style.width = 2 * CONTROL_POINT_SIZE + "px";
    textField.style.height = TEXT_SIZE + "px";
    // set background transparent
    textField.style.backgroundColor = "transparent";
    textField.style.border = "none";
    textField.style.outline = "none";
    textField.style.fontSize = TEXT_SIZE + "px";
    textField.style.fontFamily = TEXT_FONT;
    textField.style.textAlign = "center";
    document.body.appendChild(textField);
    textField.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const text = this.textField.value;
        this.setSelectedElementText(text);
        this.hideTextField();
      }
      if (e.key === "Escape") {
        this.hideTextField();
      }
    });
    return textField;
  }

  spawnTextField() {
    console.log("Spawning Text Field");
    this.textField.style.visibility = "visible";
    const { x, y } = this.SVGToScreen(this.selectedElement.getCenter());
    this.textField.style.left =
      x - this.textField.style.width.replace("px", "") / 2 + "px";
    this.textField.style.top =
      y - this.textField.style.height.replace("px", "") / 2 + "px";
    this.textField.focus();
    this.selectedElement.setTextVisible(false);
  }

  isTextFieldVisible() {
    return this.textField.style.visibility === "visible";
  }

  hideTextField() {
    this.textField.style.visibility = "hidden";
    if (this.selectedElement) {
      this.selectedElement.setTextVisible(true);
      if (this.textField.value !== "") {
        this.setSelectedElementText(this.textField.value);
      }
      this.deselect();
    }
    this.textField.value = "";
  }

  flagAsFinalState() {
    if (
      this.selectionType === selectionTypes.controlPoint &&
      this.selectedElement != this.inputNode
    ) {
      this.selectedElement.toggleFlag();
    }
  }

  handleDoubleClick(e) {
    const { clientX, clientY } = e;
    if (this.selectionType === selectionTypes.transition) {
      if (this.selectedElement.startControlPoint === this.inputNode) {
        return;
      }
      this.spawnTextField(clientX, clientY);
    } else if (this.selectionType === selectionTypes.controlPoint) {
      this.spawnTextField(clientX, clientY);
    }
  }

  onMouseDown(e) {
    e.preventDefault();
    if (e.button === 1 || (e.button === 0 && this.keyDown === " ")) {
      this.changeState(states.panning);
      return;
    }

    if (e.button === 0) {
      if (this.textField.style.visibility === "visible") {
        this.hideTextField();
        return;
      }
      switch (this.action) {
        case actions.select:
          this.selectElement(e.offsetX, e.offsetY);
          if (e.detail === 2) {
            this.handleDoubleClick(e);
          }
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
          this.selectedElement.updatePosition(x, y);
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
    const transition = this.transitions.find((t) => t.contains(x, y));
    console.log("Selected Transition:", transition);
    const controlPoint = this.controlPoints.find((cp) => cp.contains(x, y));
    this.deselect();
    if (transition) {
      this.selectedElement = transition;
      this.selectionType = selectionTypes.transition;
    } else if (controlPoint) {
      this.selectedElement = controlPoint;
      this.selectionType = selectionTypes.controlPoint;
    } else {
      this.selectedElement = null;
      this.selectionType = selectionTypes.none;
    }
    if (this.selectedElement) {
      this.selectedElement.setStrokeColor(SELECTED_COLOR);
    }
    if (this.selectionType === selectionTypes.controlPoint) {
      this.changeState(states.dragging);
    }
  }

  deselect() {
    if (this.selectedElement) {
      this.selectedElement.setStrokeColor(UNSELECTED_COLOR);
      this.selectedElement = null;
    }
  }

  deleteSelected() {
    if (this.selectionType === selectionTypes.none) {
      return;
    }

    if (this.selectionType === selectionTypes.controlPoint) {
      const index = this.controlPoints.indexOf(this.selectedElement);
      this.controlPoints.splice(index, 1);
      const temp = [];
      this.transitions.forEach((transition) => {
        if (
          transition.startControlPoint === this.selectedElement ||
          transition.endControlPoint === this.selectedElement
        ) {
          temp.push(transition);
          transition.removeFromSVG();
        }
      });

      temp.forEach((t) => {
        const index = this.transitions.indexOf(t);
        this.transitions.splice(index, 1);
      });
    } else if (this.selectionType == selectionTypes.transition) {
      this.removeTransition(this.selectedElement);
    }

    this.selectedElement.removeFromSVG();
    this.selectedElement = null;
    this.selectionType = selectionTypes.none;

    console.log("State after deletion");
    console.log("Control Points:");
    console.log(this.controlPoints);
    console.log("Transitions:");
    console.log(this.transitions);
  }

  removeTransition(transition) {
    const index = this.transitions.indexOf(transition);
    this.transitions.splice(index, 1);
    transition.removeFromSVG();
    if (
      transition.startControlPoint === this.inputNode &&
      transition.endControlPoint === this.highlightedControlPoint
    ) {
      this.highlightedControlPoint.setFillColor(UNHIGHLIGHTED_COLOR);
      this.highlightedControlPoint = null;
      console.log("Removed Highlighted Control Point");
    }
  }

  addState(offsetX, offsetY) {
    const cp = new ControlPoint(
      this.svg,
      offsetX / this.scale + this.viewBox.x,
      offsetY / this.scale + this.viewBox.y
    );
    this.controlPoints.push(cp);
    this.selectElement(offsetX, offsetY);
    this.spawnTextField();
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
    if (endControlPoint === this.inputNode) {
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
      if (endControlPoint === this.inputNode) {
        this.arrow.remove();
        return;
      }
      if (this.startControlPoint === this.inputNode) {
        this.transitions.forEach((transition) => {
          if (transition.startControlPoint === this.inputNode) {
            this.removeTransition(transition);
          }
        });
      }
      this.transitions.push(
        new Transition(
          this.svg,
          this.startControlPoint,
          endControlPoint,
          this.arrow
        )
      );
      const screenPoint = this.SVGToScreen(this.arrow.getCenter());
      this.selectElement(screenPoint.x, screenPoint.y);
      if (this.startControlPoint !== this.inputNode) {
        this.spawnTextField();
      } else {
        this.highlightControlPoint(endControlPoint);
      }
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
