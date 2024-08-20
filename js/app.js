function getViewBoxString(viewBox) {
  return `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`;
}

let panOffY = 0;
let panOffX = 0;

const svg = document.querySelector("svg");
svg.setAttributeNS(
  null,
  "viewBox",
  getViewBoxString({ x: 0, y: 0, width: 800, height: 800 })
);

const bezier = new QBezier(svg, 50, 50, 150, 150, 250, 50);

let state = "default";

svg.addEventListener("mousedown", (e) => {
  e.preventDefault();
  if (e.button === 1) {
    state = "panning";
    svg.style.cursor = "grab";
  }
});

svg.addEventListener("mousemove", (e) => {
  if (state === "panning") {
    svg.style.cursor = "grabbing";
    panOffX -= e.movementX;
    panOffY -= e.movementY;
    svg.setAttributeNS(
      null,
      "viewBox",
      getViewBoxString({
        x: panOffX,
        y: panOffY,
        width: 800,
        height: 800,
      })
    );
  }
});

svg.addEventListener("mouseup", () => {
  svg.style.cursor = "default";
  state = "default";
});

svg.addEventListener("mouseleave", () => {
  svg.style.cursor = "default";
  state = "default";
});

svg.addEventListener("wheel", (e) => {
  e.preventDefault();
  if (e.deltaY < 0) {
    onZoomIn(e);
  } else {
    onZoomOut(e);
  }
});

document.querySelector("#home").addEventListener("click", onHomeClick);
document.querySelector("#zoom-in").addEventListener("click", onZoomIn);
document.querySelector("#zoom-out").addEventListener("click", onZoomOut);

function onHomeClick(event) {
  panOffX = 0;
  panOffY = 0;
  svg.setAttributeNS(
    null,
    "viewBox",
    getViewBoxString({
      x: panOffX,
      y: panOffY,
      width: 800,
      height: 800,
    })
  );
}

function onZoomIn(event) {
  const viewBox = svg.getAttribute("viewBox").split(" ");
  const width = parseInt(viewBox[2]);
  const height = parseInt(viewBox[3]);
  svg.setAttributeNS(
    null,
    "viewBox",
    getViewBoxString({
      x: panOffX,
      y: panOffY,
      width: width - 50,
      height: height - 50,
    })
  );
}

function onZoomOut(event) {
  const viewBox = svg.getAttribute("viewBox").split(" ");
  const width = parseInt(viewBox[2]);
  const height = parseInt(viewBox[3]);
  svg.setAttributeNS(
    null,
    "viewBox",
    getViewBoxString({
      x: panOffX,
      y: panOffY,
      width: width + 50,
      height: height + 50,
    })
  );
}
