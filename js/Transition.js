import { Arrow } from "./Arrow.js";

class Transition {
  constructor(svg, startControlPoint, endControlPoint, arrow) {
    this.svg = svg;
    this.startControlPoint = startControlPoint;
    this.endControlPoint = endControlPoint;
    this.arrow = arrow;
  }

  setColor(color) {
    this.arrow.setColor(color);
  }
}

export { Transition };
