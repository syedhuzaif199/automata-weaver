const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const CONTROL_POINT_SIZE = 50;
const ARROW_HEAD_WIDTH = 7;
const ARROW_HEAD_HEIGHT = 7;

class Arrow {
  constructor(svg, x1, y1, x2, y2) {
    this.svg = svg;
    this.arrowBody = document.createElementNS(SVG_NAMESPACE, "path");
    this.arrowHead = this.createArrowHead();
    this.update(x1, y1, x2, y2, false);
    this.svg.appendChild(this.arrowBody);
    this.svg.appendChild(this.arrowHead);
  }

  createArrowHead() {
    const defs = document.createElementNS(SVG_NAMESPACE, "defs");
    const marker = document.createElementNS(SVG_NAMESPACE, "marker");
    marker.setAttribute("id", "arrowhead");
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
    arrowHead.setAttribute("fill", "black");

    marker.appendChild(arrowHead);
    defs.appendChild(marker);
    this.svg.appendChild(defs);

    return defs;
  }

  setColor(color) {
    this.arrowBody.setAttribute("stroke", color);
    this.arrowHead.children[0].children[0].setAttribute("fill", color);
  }

  update(x1, y1, x2, y2, final = false) {
    const { xm, ym } = this.calculateArrowMid(x1, y1, x2, y2, final);

    const slope = (y2 - y1) / (x2 - x1);
    const theta = Math.atan(slope) || 0;
    const alpha = Math.PI / 6;
    const fact = x1 < x2 ? 1 : -1;

    const startx = x1 + fact * CONTROL_POINT_SIZE * Math.cos(theta + alpha);
    const starty = y1 + fact * CONTROL_POINT_SIZE * Math.sin(theta + alpha);
    let endx = x2 - fact * CONTROL_POINT_SIZE * Math.cos(theta - alpha);
    let endy = y2 - fact * CONTROL_POINT_SIZE * Math.sin(theta - alpha);

    if (!final) {
      endx = x2;
      endy = y2;
    }

    if (x1 === x2 && y1 === y2) {
      this.arrowBody.setAttribute(
        "d",
        `M ${startx} ${starty} A ${
          0.5 * CONTROL_POINT_SIZE
        } ${CONTROL_POINT_SIZE} 0 0 1 ${endx} ${endy}`
      );
    } else {
      this.arrowBody.setAttribute(
        "d",
        `M ${startx} ${starty} Q ${xm} ${ym} ${endx} ${endy}`
      );
    }

    this.arrowBody.setAttribute("fill", "none");
    this.arrowBody.setAttribute("stroke", "black");
    this.arrowBody.setAttribute("stroke-width", "2px");
    this.arrowBody.setAttribute("marker-end", "url(#arrowhead)");
  }

  calculateArrowMid(x1, y1, x2, y2, final = false) {
    let d = CONTROL_POINT_SIZE * 1;
    d = d * (x1 < x2 ? 1 : -1);
    const theta = Math.atan((y2 - y1) / (x2 - x1));
    const xm = (x1 + x2) / 2 - d * Math.sin(theta);
    const ym = (y1 + y2) / 2 + d * Math.cos(theta);
    return { xm, ym };
  }

  remove() {
    this.arrowBody.remove();
    this.arrowHead.remove();
  }
}

export { Arrow };
