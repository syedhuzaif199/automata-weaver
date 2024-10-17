import {
  SVG_NAMESPACE,
  CONTROL_POINT_SIZE,
  ARROW_HEAD_WIDTH,
  ARROW_HEAD_HEIGHT,
  TEXT_SIZE,
  TEXT_FONT,
  UNSELECTED_COLOR,
  ARROW_STROKE_WIDTH,
} from "./constants.js";

const debugMode = false;

let id = 0;

class Arrow {
  constructor(svg, x1, y1, x2, y2) {
    this.svg = svg;
    this.arrowBody = document.createElementNS(SVG_NAMESPACE, "path");
    this.arrowBody.setAttribute("fill", "none");
    this.arrowBody.setAttribute("stroke", UNSELECTED_COLOR);
    this.arrowBody.setAttribute("stroke-width", ARROW_STROKE_WIDTH);
    this.id = id;
    id++;
    this.center = null;
    this.text = document.createElementNS(SVG_NAMESPACE, "text");
    this.text.textContent = "";
    this.text.setAttributeNS(null, "text-anchor", "middle");
    this.text.setAttributeNS(null, "dominant-baseline", "middle");
    this.text.style.fontSize = TEXT_SIZE + "px";
    this.text.style.fontFamily = TEXT_FONT;
    this.text.setAttribute("fill", UNSELECTED_COLOR);
    this.svg.appendChild(this.text);
    this.arrowHead = this.createArrowHead();
    this.update(x1, y1, x2, y2, false);
    this.svg.appendChild(this.arrowBody);
    this.svg.appendChild(this.arrowHead);
    this.boundingPoly = null;
  }

  setTextAlignment(align) {
    if (align === "top") {
      this.text.setAttributeNS(null, "dominant-baseline", "middle");
    } else if ((align = "bottom")) {
      this.text.setAttributeNS(null, "dominant-baseline", "text-before-edge");
    }
  }

  setAnchor(anchor) {
    this.text.setAttributeNS(null, "text-anchor", anchor);
  }

  createArrowHead() {
    const defs = document.createElementNS(SVG_NAMESPACE, "defs");
    const marker = document.createElementNS(SVG_NAMESPACE, "marker");
    marker.setAttribute("id", `arrowhead-${this.id}`);
    id++;
    marker.setAttribute("markerWidth", `${ARROW_HEAD_WIDTH}`);
    marker.setAttribute("markerHeight", `${ARROW_HEAD_HEIGHT}`);
    marker.setAttribute("refX", `${ARROW_HEAD_WIDTH}`);
    marker.setAttribute("refY", `${ARROW_HEAD_HEIGHT / 2}`);
    marker.setAttribute("orient", "auto");

    const arrowHead = document.createElementNS(SVG_NAMESPACE, "polygon");
    arrowHead.setAttribute(
      "points",
      `0 0, ${ARROW_HEAD_WIDTH} ${
        ARROW_HEAD_HEIGHT / 2
      }, 0 ${ARROW_HEAD_HEIGHT}`
    );
    arrowHead.setAttribute("fill", UNSELECTED_COLOR);

    marker.appendChild(arrowHead);
    defs.appendChild(marker);
    this.svg.appendChild(defs);

    return defs;
  }

  setStrokeColor(color) {
    this.arrowBody.setAttribute("stroke", color);
    this.arrowHead.children[0].children[0].setAttribute("fill", color);
    this.text.setAttribute("fill", color);
  }

  setText(text) {
    this.text.textContent = text;
  }

  getText() {
    return this.text.textContent;
  }

  setTextVisible(visible) {
    this.text.style.visibility = visible ? "visible" : "hidden";
  }

  update(x1, y1, x2, y2, final = false) {
    const { xm, ym } = this.calculateArrowMid(x1, y1, x2, y2, final);

    const slope = (y2 - y1) / (x2 - x1);
    const theta = Math.atan(slope) || 0;
    const alpha = Math.PI / 6;
    const fact = x1 <= x2 ? 1 : -1;

    const startx = x1 + fact * CONTROL_POINT_SIZE * Math.cos(theta - alpha);
    const starty = y1 + fact * CONTROL_POINT_SIZE * Math.sin(theta - alpha);
    let endx = x2 - fact * CONTROL_POINT_SIZE * Math.cos(theta + alpha);
    let endy = y2 - fact * CONTROL_POINT_SIZE * Math.sin(theta + alpha);

    if (!final) {
      endx = x2;
      endy = y2;
    } else {
      if (this.boundingPoly != null) {
        this.boundingPoly.remove();
      }
      this.boundingPoly = document.createElementNS(SVG_NAMESPACE, "polygon");
      if (x1 == x2 && y1 == y2) {
        this.center = {
          x: (startx + endx) / 2,
          y: starty - 2 * CONTROL_POINT_SIZE,
        };
        this.boundingPoly.setAttribute(
          "points",
          `${startx} ${starty}, ${endx} ${endy}, 
          ${endx - 0.25 * CONTROL_POINT_SIZE} ${endy - CONTROL_POINT_SIZE},
          ${(startx + endx) / 2} ${starty - 2 * CONTROL_POINT_SIZE}, 
          ${startx + 0.25 * CONTROL_POINT_SIZE} ${starty - CONTROL_POINT_SIZE}`
        );
      } else {
        this.center = { x: xm, y: ym };
        this.boundingPoly.setAttribute(
          "points",
          `${startx} ${starty}, ${endx} ${endy}, ${xm} ${ym}`
        );
      }
      this.svg.appendChild(this.boundingPoly);
      this.boundingPoly.setAttribute("fill", "none");
      if (debugMode) {
        this.boundingPoly.setAttribute("stroke", "green");
        this.boundingPoly.setAttribute("stroke-width", "1px");
      }
    }

    if (x1 === x2 && y1 === y2) {
      this.arrowBody.setAttribute(
        "d",
        `M ${endx} ${endy} A ${
          0.5 * CONTROL_POINT_SIZE
        } ${CONTROL_POINT_SIZE} 0 0 1 ${startx} ${starty}`
      );
      this.setTextAlignment("top");
      this.setAnchor("middle");
    } else {
      this.arrowBody.setAttribute(
        "d",
        `M ${startx} ${starty} Q ${xm} ${ym} ${endx} ${endy}`
      );
      if (startx < endx) {
        this.setTextAlignment("top");
      } else {
        this.setTextAlignment("bottom");
      }
      if (starty < endy) {
        this.setAnchor("start");
      } else if (starty > endy) {
        this.setAnchor("end");
      }
    }

    this.arrowBody.setAttribute("marker-end", `url(#arrowhead-${this.id})`);
    const { x, y } = this.getCenter();
    this.text.setAttributeNS(null, "x", x);
    this.text.setAttributeNS(null, "y", y);
  }

  calculateArrowMid(x1, y1, x2, y2, final = false) {
    let d = CONTROL_POINT_SIZE * 1;
    d = d * (x1 <= x2 ? 1 : -1);
    const theta = Math.atan((y2 - y1) / (x2 - x1));
    const xm = (x1 + x2) / 2 + d * Math.sin(theta);
    const ym = (y1 + y2) / 2 - d * Math.cos(theta);
    return { xm, ym };
  }

  remove() {
    this.arrowBody.remove();
    this.arrowHead.remove();
    if (this.boundingPoly) {
      this.boundingPoly.remove();
    }
    this.text.remove();
  }

  contains(x, y) {
    const point = this.svg.createSVGPoint();
    point.x = x;
    point.y = y;
    const isInside =
      this.boundingPoly == null
        ? this.arrowBody.isPointInFill(point)
        : this.boundingPoly.isPointInFill(point);

    const textBBox = this.text.getBBox();

    const isInText =
      textBBox.x < x &&
      textBBox.x + textBBox.width > x &&
      textBBox.y < y &&
      textBBox.y + textBBox.height > y;
    return isInside || isInText;
  }

  getCenter() {
    if (this.center) {
      return this.center;
    } else {
      return { x: (this.x1 + this.x2) / 2, y: (this.y1 + this.y2) / 2 };
    }
  }
}

export { Arrow };
