import {
  SVG_NAMESPACE,
  CONTROL_POINT_SIZE,
  TEXT_SIZE,
  TEXT_FONT,
  UNSELECTED_COLOR,
  CONTROL_POINT_STROKE_WIDTH,
} from "./constants.js";
class ControlPoint {
  constructor(
    svg,
    x,
    y,
    radius = CONTROL_POINT_SIZE,
    fill = "none",
    stroke = UNSELECTED_COLOR,
    stroke_width = CONTROL_POINT_STROKE_WIDTH
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
    this.text.setAttribute("fill", this.stroke);
    this.text.setAttributeNS(null, "x", this.x);
    this.text.setAttributeNS(null, "y", this.y);
    this.text.style.fontSize = TEXT_SIZE + "px";
    this.text.style.fontFamily = TEXT_FONT;
    this.text.textContent = "";
    this.text.setAttributeNS(null, "text-anchor", "middle");
    this.text.setAttributeNS(null, "dominant-baseline", "middle");
    this.svg.appendChild(this.text);
    this.flag = false;
    this.flagCircle = document.createElementNS(this.ns, "circle");
    this.flagCircle.setAttributeNS(null, "cx", this.x);
    this.flagCircle.setAttributeNS(null, "cy", this.y);
    this.flagCircle.setAttributeNS(null, "r", this.radius * 0.8);
    this.flagCircle.setAttributeNS(null, "fill", this.fill);
    this.flagCircle.setAttributeNS(null, "stroke", this.stroke);
    this.flagCircle.setAttributeNS(
      null,
      "stroke-width",
      this.stroke_width * 0.5
    );
    this.flagCircle.style.visibility = "hidden";
    this.svg.appendChild(this.flagCircle);
  }

  addEventListener(eventName, listener) {
    this.circle.addEventListener(eventName, listener);
  }

  updatePosition(x, y) {
    this.x = x;
    this.y = y;
    this.circle.setAttributeNS(null, "cx", this.x);
    this.circle.setAttributeNS(null, "cy", this.y);
    this.flagCircle.setAttributeNS(null, "cx", this.x);
    this.flagCircle.setAttributeNS(null, "cy", this.y);
    this.text.setAttributeNS(null, "x", this.x);
    this.text.setAttributeNS(null, "y", this.y);
  }

  contains(x, y) {
    return Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2) < this.radius;
  }

  removeFromSVG() {
    this.circle.remove();
    this.flagCircle.remove();
    this.text.remove();
  }

  setStrokeColor(color) {
    this.circle.setAttributeNS(null, "stroke", color);
    this.text.setAttributeNS(null, "fill", color);
    this.flagCircle.setAttributeNS(null, "stroke", color);
  }

  setFillColor(color) {
    this.circle.setAttributeNS(null, "fill", color);
  }

  setText(text) {
    // set the text content of the text element to the text argument
    this.text.textContent = text;
  }
  getText() {
    return this.text.textContent;
  }

  setTextVisible(visible) {
    this.text.style.visibility = visible ? "visible" : "hidden";
  }

  getCenter() {
    return { x: this.x, y: this.y };
  }

  toggleFlag() {
    console.log("toggleFlag");
    this.flag = !this.flag;
    this.flagCircle.style.visibility = this.flag ? "visible" : "hidden";
  }

  isFinal() {
    return this.flag;
  }

  toJSON() {
    return {
      x: this.x,
      y: this.y,
      flag: this.flag,
      text: this.text.textContent,
      id: null,
    };
  }
}

export { ControlPoint };
