const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const CONTROL_POINT_SIZE = 50;

class ControlPoint {
  constructor(
    svg,
    x,
    y,
    radius = CONTROL_POINT_SIZE,
    fill = "none",
    stroke = "black",
    stroke_width = "2px"
  ) {
    this.ns = SVG_NAMESPACE;
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

  removeFromSVG() {
    this.circle.remove();
  }

  setStrokeColor(color) {
    this.circle.setAttributeNS(null, "stroke", color);
  }

  setFillColor(color) {
    this.circle.setAttributeNS(null, "fill", color);
  }
}

export { ControlPoint };
