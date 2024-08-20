let scale = 1;

const WIDTH = 800,
  HEIGHT = 800;

let viewbox = {
  x: 0,
  y: 0,
  width: WIDTH,
  height: HEIGHT,
};

function getViewBoxString(viewBox) {
  return `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`;
}

const svg = document.querySelector("svg");
svg.setAttributeNS(null, "viewBox", getViewBoxString(viewbox));

const bezier = new QBezier(svg, 50, 50, 150, 150, 250, 50);

let state = "default";

svg.addEventListener("mousedown", (e) => {
  const { offsetX, offsetY } = e;
  console.log("offsetX", offsetX, "offsetY", offsetY);
  e.preventDefault();
  if (e.button === 1) {
    state = "panning";
    svg.style.cursor = "grab";
  }
});

svg.addEventListener("mousemove", (e) => {
  if (state === "panning") {
    svg.style.cursor = "grabbing";
    viewbox.x -= e.movementX / scale;
    viewbox.y -= e.movementY / scale;
    svg.setAttributeNS(null, "viewBox", getViewBoxString(viewbox));
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
    zoomInOnPoint(e);
  } else {
    zoomOutOnPoint(e);
  }
});

document.querySelector("#home").addEventListener("click", onHomeClick);
document.querySelector("#zoom-in").addEventListener("click", onZoomIn);
document.querySelector("#zoom-out").addEventListener("click", onZoomOut);

function onHomeClick(event) {
  viewbox = {
    x: 0,
    y: 0,
    width: WIDTH,
    height: HEIGHT,
  };
  scale = 1;
  svg.setAttributeNS(null, "viewBox", getViewBoxString(viewbox));
}

function onZoomIn(event) {
  const [offsetX, offsetY] = [WIDTH / 2, HEIGHT / 2];
  viewbox.x += offsetX / scale;
  viewbox.y += offsetY / scale;

  scale += 0.1;

  viewbox.x -= offsetX / scale;
  viewbox.y -= offsetY / scale;
  viewbox.width = WIDTH / scale;
  viewbox.height = HEIGHT / scale;

  svg.setAttributeNS(null, "viewBox", getViewBoxString(viewbox));
}

function onZoomOut(event) {
  const [offsetX, offsetY] = [WIDTH / 2, HEIGHT / 2];
  viewbox.x += offsetX / scale;
  viewbox.y += offsetY / scale;

  scale -= 0.1;

  viewbox.x -= offsetX / scale;
  viewbox.y -= offsetY / scale;
  viewbox.width = WIDTH / scale;
  viewbox.height = HEIGHT / scale;

  svg.setAttributeNS(null, "viewBox", getViewBoxString(viewbox));
}

function zoomInOnPoint(event) {
  const { offsetX, offsetY } = event;
  viewbox.x += offsetX / scale;
  viewbox.y += offsetY / scale;

  scale += 0.1;

  viewbox.x -= offsetX / scale;
  viewbox.y -= offsetY / scale;
  viewbox.width = WIDTH / scale;
  viewbox.height = HEIGHT / scale;

  svg.setAttributeNS(null, "viewBox", getViewBoxString(viewbox));
}

function zoomOutOnPoint(event) {
  const { offsetX, offsetY } = event;
  viewbox.x += offsetX / scale;
  viewbox.y += offsetY / scale;

  scale -= 0.1;

  viewbox.x -= offsetX / scale;
  viewbox.y -= offsetY / scale;
  viewbox.width = WIDTH / scale;
  viewbox.height = HEIGHT / scale;

  svg.setAttributeNS(null, "viewBox", getViewBoxString(viewbox));
}
