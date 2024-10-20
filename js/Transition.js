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

  setText(text) {
    this.arrow.setText(text);
  }

  setTextVisible(visible) {
    this.arrow.setTextVisible(visible);
  }
  getCenter() {
    return this.arrow.getCenter();
  }

  getText() {
    return this.arrow.getText();
  }

  toJSON() {
    return {
      text: this.getText(),
      id1: null,
      id2: null,
    };
  }
}

export { Transition };
