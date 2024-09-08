import { Arrow } from "./Arrow.js";

class Transition {
  constructor(svg, startControlPoint, endControlPoint, arrow) {
    this.svg = svg;
    this.startControlPoint = startControlPoint;
    this.endControlPoint = endControlPoint;
    this.arrow = arrow;
  }

  setStrokeColor(color) {
    this.arrow.setStrokeColor(color);
  }

  contains(x, y) {
    return this.arrow.contains(x, y);
  }

  removeFromSVG() {
    this.arrow.remove();
  }
}

export { Transition };
