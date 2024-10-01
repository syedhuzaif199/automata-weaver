import { clamp } from "./utils.js";
import { Arrow } from "./Arrow.js";
import { ControlPoint } from "./ControlPoint.js";
import { Transition } from "./Transition.js";

import {
  SELECTED_COLOR,
  UNSELECTED_COLOR,
  STATE_HIGHLIGHTED_COLOR,
  MINSCALE,
  MAXSCALE,
  TEXT_SIZE,
  CONTROL_POINT_SIZE,
  TEXT_FONT,
  UNHIGHLIGHTED_COLOR,
  FAIL_COLOR,
  SUCCESS_COLOR,
  TRANSITION_HIGHLIGHTED_COLOR,
  TEXTBOX_BASE_WIDTH,
  EPSILON,
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
    this.highlightedControlPoints = null;
    this.failControlPoints = [];
    this.successControlPoints = null;
    this.isEditingDisabled = false;

    this.setupSVG();
  }

  setupSVG() {
    this.svg.setAttribute("width", this.width);
    this.svg.setAttribute("height", this.height);
    this.svg.setAttribute("viewBox", this.getViewBoxString());
    this.svg.style.cursor = actionToCursor[this.action];
    this.addEventListeners();
  }

  clear() {
    this.controlPoints.forEach((cp) => cp.removeFromSVG());
    this.transitions.forEach((t) => t.removeFromSVG());
    this.controlPoints = [];
    this.transitions = [];
    this.inputNode = new ControlPoint(
      this.svg,
      this.width / 4,
      this.height / 2
    );
    this.inputNode.setText("Input");
    this.controlPoints.push(this.inputNode);
  }

  saveToJSON() {
    const controlPoints = this.controlPoints.map((cp) => {
      const newcp = cp.toJSON();
      newcp.id = this.controlPoints.indexOf(cp);
      return newcp;
    });
    const transitions = this.transitions.map((t) => {
      const newT = t.toJSON();
      newT.id1 = this.controlPoints.indexOf(t.startControlPoint);
      newT.id2 = this.controlPoints.indexOf(t.endControlPoint);
      return newT;
    });
    return JSON.stringify({ controlPoints, transitions });
  }

  loadFromJSON(json) {
    this.clear();
    this.inputNode.removeFromSVG();
    const data = JSON.parse(json);
    this.controlPoints = data.controlPoints.map((cp) => {
      const newcp = new ControlPoint(this.svg, cp.x, cp.y);
      newcp.flag = !cp.flag;
      newcp.toggleFlag();
      newcp.setText(cp.text);
      return newcp;
    });
    this.transitions = data.transitions.map((t) => {
      const newT = new Transition(
        this.svg,
        this.controlPoints[t.id1],
        this.controlPoints[t.id2],
        new Arrow(
          this.svg,
          t.startControlPoint.x,
          t.startControlPoint.y,
          t.endControlPoint.x,
          t.endControlPoint.y
        )
      );

      newT.setText(t.text);
      return newT;
    });
    this.inputNode = this.controlPoints[0];
    this.updateAllTransitions();
  }

  saveToLocalStorage() {
    const data = this.saveToJSON();
    localStorage.setItem("automatonData", data);
  }

  loadFromLocalStorage() {
    const data = localStorage.getItem("automatonData");
    if (data) {
      this.loadFromJSON(data);
    } else {
      console.error("No automaton data found!");
    }
  }

  drawDFA(dfa) {
    console.log("Minimized dfa:", dfa);
    this.clear();

    const numStates = dfa.numStates;
    const transitions = dfa.transitions;
    const angle = (2 * Math.PI) / numStates;
    const radius = (4 * CONTROL_POINT_SIZE) / angle + CONTROL_POINT_SIZE;
    const center = {
      x: this.inputNode.x + 4 * CONTROL_POINT_SIZE + radius,
      y: this.height / 2,
    };

    for (let i = 0; i < numStates; i++) {
      const x = center.x + radius * Math.cos(i * angle + 0.01 + Math.PI);
      const y = center.y + radius * Math.sin(i * angle + Math.PI);
      const cp = new ControlPoint(this.svg, x, y);
      if (dfa.finalStates.includes(i)) {
        cp.toggleFlag();
      }
      cp.setText("q" + i.toString());
      this.controlPoints.push(cp);
    }

    console.log("control points:", this.controlPoints);
    for (let key in transitions) {
      let [state, symbol] = key.split(",");
      state = parseInt(state) + 1;
      console.log("state:", state);
      const endState = parseInt(transitions[key]) + 1;
      const existingTransition = this.transitions.find(
        (t) =>
          t.startControlPoint === this.controlPoints[state] &&
          t.endControlPoint === this.controlPoints[endState]
      );
      if (existingTransition) {
        existingTransition.setText(existingTransition.getText() + "," + symbol);
        continue;
      }
      const transition = new Transition(
        this.svg,
        this.controlPoints[state],
        this.controlPoints[endState],
        new Arrow(
          this.svg,
          this.controlPoints[state].x,
          this.controlPoints[state].y,
          this.controlPoints[endState].x,
          this.controlPoints[endState].y
        )
      );

      transition.setText(symbol);

      this.transitions.push(transition);
    }

    const transition = new Transition(
      this.svg,
      this.inputNode,
      this.controlPoints[1],
      new Arrow(
        this.svg,
        this.inputNode.x,
        this.inputNode.y,
        this.controlPoints[1].x,
        this.controlPoints[1].y
      )
    );

    this.transitions.push(transition);

    this.updateAllTransitions();
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
      this.textField.style.width = TEXTBOX_BASE_WIDTH * this.scale + "px";
      this.textField.style.height = TEXT_SIZE * this.scale + "px";
      this.textField.style.fontSize = TEXT_SIZE * this.scale + "px";
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
    this.svg.style.cursor = actionToCursor[this.action];
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

  highlightControlPoints(controlPoints) {
    if (this.highlightedControlPoints) {
      this.highlightedControlPoints.forEach((controlPoint) =>
        controlPoint.setFillColor(UNHIGHLIGHTED_COLOR)
      );
    }
    controlPoints.forEach((controlPoint) =>
      controlPoint.setFillColor(STATE_HIGHLIGHTED_COLOR)
    );
    this.highlightedControlPoints = controlPoints;
  }

  highlightTransition(transition, color = TRANSITION_HIGHLIGHTED_COLOR) {
    transition.setStrokeColor(color);
  }

  unHighlightTransition(transition) {
    transition.setStrokeColor(UNSELECTED_COLOR);
  }

  unHighlightAllTransitions() {
    this.transitions.forEach((transition) => {
      if (transition !== this.selectedElement) {
        transition.setStrokeColor(UNSELECTED_COLOR);
      }
    });
  }

  unHighlightAllControlPoints() {
    this.controlPoints.forEach((cp) => cp.setFillColor(UNHIGHLIGHTED_COLOR));
  }

  setFailStates(controlPoints) {
    if (this.failControlPoints) {
      this.failControlPoints.forEach((controlPoint) =>
        controlPoint.setFillColor(UNHIGHLIGHTED_COLOR)
      );
    }
    controlPoints.forEach((controlPoint) =>
      controlPoint.setFillColor(FAIL_COLOR)
    );
    this.failControlPoints = controlPoints;
  }

  setSuccessStates(controlPoints) {
    if (this.successControlPoints) {
      this.successControlPoints.forEach((controlPoint) =>
        controlPoint.setFillColor(UNHIGHLIGHTED_COLOR)
      );
    }
    controlPoints.forEach((controlPoint) =>
      controlPoint.setFillColor(SUCCESS_COLOR)
    );
    this.successControlPoints = controlPoints;
  }

  createTextField() {
    const textField = document.createElement("input");
    textField.setAttribute("type", "text");
    textField.style.position = "absolute";
    textField.style.visibility = "hidden";
    textField.style.width = TEXTBOX_BASE_WIDTH + "px";
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
      if (e.key === "Enter" || e.key === "Escape") {
        this.hideTextField();
      }
    });
    return textField;
  }

  spawnTextField() {
    if (this.isEditingDisabled) {
      return;
    }
    console.log("Spawning Text Field");
    this.textField.style.visibility = "visible";
    const { x, y } = this.SVGToScreen(this.selectedElement.getCenter());
    this.textField.style.fontSize = TEXT_SIZE * this.scale + "px";
    this.textField.style.width = TEXTBOX_BASE_WIDTH * this.scale + "px";
    this.textField.style.height = TEXT_SIZE * this.scale + "px";
    this.textField.style.left =
      x - this.textField.style.width.replace("px", "") / 2 + "px";
    this.textField.style.top =
      y - this.textField.style.height.replace("px", "") / 2 + "px";
    this.textField.focus();
    this.textField.value = this.selectedElement.getText();
    this.textField.select();
    this.selectedElement.setTextVisible(false);
  }

  isTextFieldVisible() {
    return this.textField.style.visibility === "visible";
  }

  hideTextField() {
    this.textField.style.visibility = "hidden";
    if (this.selectedElement) {
      this.selectedElement.setTextVisible(true);
      if (this.textField.value.replaceAll(" ", "") !== "") {
        this.setSelectedElementText(this.textField.value);
      } else if (this.selectionType === selectionTypes.transition) {
        this.setSelectedElementText(EPSILON);
      }

      this.deselect();
    }
    this.textField.value = "";
  }

  flagAsFinalState() {
    if (
      this.selectionType === selectionTypes.controlPoint &&
      this.selectedElement != this.inputNode &&
      !this.isEditingDisabled
    ) {
      this.selectedElement.toggleFlag();
    }
  }

  handleDoubleClick(e) {
    if (this.selectionType === selectionTypes.transition) {
      if (this.selectedElement.startControlPoint === this.inputNode) {
        return;
      }
      this.spawnTextField();
    } else if (
      this.selectionType === selectionTypes.controlPoint &&
      this.selectedElement !== this.inputNode
    ) {
      this.spawnTextField();
    }
  }

  onMouseDown(e) {
    e.preventDefault();
    if (e.button === 1 || (e.button === 0 && this.keyDown === " ")) {
      this.changeState(states.panning);
      return;
    }

    if (e.button === 0) {
      if (!this.isEditingDisabled) {
        this.unHighlightAllTransitions();
      }
      if (this.textField.style.visibility === "visible") {
        this.hideTextField();
        return;
      }
      switch (this.action) {
        case actions.select:
          this.selectElementAtPoint(e.offsetX, e.offsetY);
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
    console.log("left");
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

  selectElementAtPoint(offsetX, offsetY) {
    const { x, y } = this.screenToSVG(offsetX, offsetY);
    const transition = this.transitions.find((t) => t.contains(x, y));
    console.log("Selected Transition:", transition);
    const controlPoint = this.controlPoints.find((cp) => cp.contains(x, y));
    if (transition) {
      this.selectElement(transition, selectionTypes.transition);
    } else if (controlPoint) {
      this.selectElement(controlPoint, selectionTypes.controlPoint);
    } else {
      this.deselect();
    }
  }

  selectElement(element, type) {
    this.deselect();
    this.selectedElement = element;
    this.selectionType = type;
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
      this.selectionType = selectionTypes.none;
    }
  }

  deleteSelected() {
    if (this.selectionType === selectionTypes.none) {
      return;
    }
    if (this.isEditingDisabled) {
      return;
    }

    if (this.selectionType === selectionTypes.controlPoint) {
      if (this.selectedElement === this.inputNode) {
        return;
      }
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
      if (this.selectedElement.startControlPoint === this.inputNode) {
        this.selectedElement.endControlPoint.setFillColor(UNHIGHLIGHTED_COLOR);
      }
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
      transition.endControlPoint === this.highlightedControlPoints
    ) {
      this.highlightedControlPoints.setFillColor(UNHIGHLIGHTED_COLOR);
      this.highlightedControlPoints = null;
      console.log("Removed Highlighted Control Point");
    }
  }

  addState(offsetX, offsetY) {
    if (this.isEditingDisabled) {
      return;
    }
    const cp = new ControlPoint(
      this.svg,
      offsetX / this.scale + this.viewBox.x,
      offsetY / this.scale + this.viewBox.y
    );
    this.controlPoints.push(cp);
    this.selectElement(cp, selectionTypes.controlPoint);
    this.spawnTextField();
  }

  startTransition(offsetX, offsetY) {
    if (this.isEditingDisabled) {
      return;
    }
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

    //Transitions to the input node are not allowed
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

      // Remove the transition starting from the input node if it exists
      if (this.startControlPoint === this.inputNode) {
        this.transitions.forEach((transition) => {
          if (transition.startControlPoint === this.inputNode) {
            this.removeTransition(transition);
          }
        });
      }
      const transition = new Transition(
        this.svg,
        this.startControlPoint,
        endControlPoint,
        this.arrow
      );
      this.transitions.push(transition);
      this.selectElement(transition, selectionTypes.transition);

      //Cannot edit the text inside the input node
      if (this.startControlPoint !== this.inputNode) {
        this.spawnTextField();
      } else {
        // highlight the node that has just been connected to the input node
        this.highlightControlPoints([endControlPoint]);
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
