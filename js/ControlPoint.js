import {
  SVG_NAMESPACE,
  CONTROL_POINT_SIZE,
  TEXT_SIZE,
  TEXT_FONT,
} from "./constants.js";
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
    this.text = document.createElementNS(SVG_NAMESPACE, "text");
    this.text.setAttributeNS(null, "x", this.x);
    this.text.setAttributeNS(null, "y", this.y);
    this.text.style.fontSize = TEXT_SIZE + "px";
    this.text.style.fontFamily = TEXT_FONT;
    this.text.textContent = "";
    this.text.setAttributeNS(null, "text-anchor", "middle");
    this.text.setAttributeNS(null, "dominant-baseline", "middle");
    this.svg.appendChild(this.text);
  }

  addEventListener(eventName, listener) {
    this.circle.addEventListener(eventName, listener);
  }

  updatePosition(x, y) {
    this.x = x;
    this.y = y;
    this.circle.setAttributeNS(null, "cx", this.x);
    this.circle.setAttributeNS(null, "cy", this.y);
    this.text.setAttributeNS(null, "x", this.x);
    this.text.setAttributeNS(null, "y", this.y);
  }

  contains(x, y) {
    return Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2) < this.radius;
  }

  removeFromSVG() {
    this.circle.remove();
    this.text.remove();
  }

  setStrokeColor(color) {
    this.circle.setAttributeNS(null, "stroke", color);
  }

  setFillColor(color) {
    this.circle.setAttributeNS(null, "fill", color);
  }

  setText(text) {
    // set the text content of the text element to the text argument
    this.text.textContent = text;
  }

  setTextVisible(visible) {
    this.text.style.visibility = visible ? "visible" : "hidden";
  }

  getCenter() {
    return { x: this.x, y: this.y };
  }
}

export { ControlPoint };
