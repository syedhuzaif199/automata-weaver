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
      if (svg.getAttribute("viewBox")) {
        [x, y] = svg.getAttribute("viewBox").split(" ").map(parseFloat);
      }
      this.dragging.updatePosition(offsetX + x, offsetY + y);
      this.updatePath();
    }
  }

  onMouseUp() {
    this.dragging = null;
  }
}
