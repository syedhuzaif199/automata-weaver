import { BLANK } from "./constants.js";

export default class Tape {
  constructor(cellCount) {
    this.cellSize = 50;
    this.cellMargin = 4;
    this.setCSSVariable("--cell-size", `${this.cellSize}px`);
    this.setCSSVariable("--cell-margin", `${this.cellMargin}px`);

    this.blank = "";
    this.tape = document.getElementById("tape");
    const resizeObserver = new ResizeObserver((entries) => {
      this.onTapeResize(entries);
    });

    // Start observing the element
    resizeObserver.observe(tape);
    this.cellCount = (cellCount & 1) == 0 ? cellCount + 1 : cellCount;
    // this.maxCellDisplay =
    //   (maxCellDisplay & 1) == 0 ? maxCellDisplay + 1 : maxCellDisplay;
    // this.tape.style.width = `${
    //   this.maxCellDisplay * (this.cellSize + 2 * this.cellMargin) +
    //   this.cellMargin
    // }px`;

    this.maxCellDisplay =
      this.tape.clientWidth / (this.cellSize + 2 * this.cellMargin);
    this.cells = [];
    for (let i = 0; i < this.cellCount; i++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      this.cells.push(cell);
      cell.style.left = `${
        (this.maxCellDisplay / 2 - this.cellCount / 2 + i) *
        (this.cellSize + 2 * this.cellMargin)
      }px`;
      this.tape.appendChild(cell);
      const inputField = document.createElement("input");
      inputField.type = "text";
      cell.appendChild(inputField);
      inputField.addEventListener("change", (e) => {
        if (e.target.value === "" || e.target.value === " ") {
          e.target.value = this.blank;
        }
      });
    }

    this.fillTapeWithBlanks();

    this.tapeHead = document.createElement("div");
    this.tapeHead.id = "tape-head";
    this.tape.appendChild(this.tapeHead);
    this.tapeHead.style.left = `${
      this.cells[this.getTapeMiddleIndex()].style.left
    }`;

    this.headIndex = this.getTapeMiddleIndex();

    this.shifts = 0;
  }

  onTapeResize(entries) {
    for (let entry of entries) {
      const { width, height } = entry.contentRect;
      this.maxCellDisplay = width / (this.cellSize + 2 * this.cellMargin);
      for (let i = 0; i < this.cellCount; i++) {
        const cell = this.cells[i];
        cell.style.left = `${
          (this.maxCellDisplay / 2 - this.cellCount / 2 + i) *
          (this.cellSize + 2 * this.cellMargin)
        }px`;
      }
      this.tapeHead.style.left = `${
        this.cells[this.getTapeMiddleIndex()].style.left
      }`;
    }
  }

  setCSSVariable(name, value) {
    document.documentElement.style.setProperty(name, value);
  }

  moveTapeHead(dir) {
    this.headIndex += dir;
    this.tapeHead.style.left = `${
      parseInt(this.tapeHead.style.left) +
      dir * (this.cellSize + 2 * this.cellMargin)
    }px`;
    console.log("Head moved");
  }

  moveTape(dir) {
    this.shifts -= dir;
    this.headIndex -= dir;
    this.cells.forEach((cell) => {
      if (cell == this.tapeHead) {
        return;
      }
      cell.style.left = `${
        parseInt(cell.style.left) + dir * (this.cellSize + 2 * this.cellMargin)
      }px`;
    });
  }

  writeAtHead(symbol) {
    this.getInputFieldAtIndex(this.headIndex).value = symbol;
  }

  getSymbolAtHead() {
    const sym = this.getInputFieldAtIndex(this.headIndex).value;
    console.log("Symbol:", sym);
    return sym;
  }

  getInputFieldAtIndex(index) {
    return this.cells[index].childNodes[0];
  }

  moveHeadToStart() {
    this.tapeHead.style.left =
      this.cells[
        this.cellCount / 2 - this.maxCellDisplay / 2 + this.shifts
      ].style.left;
    this.headIndex = this.cellCount / 2 - this.maxCellDisplay / 2 + this.shifts;
  }

  //change this
  moveHeadToMiddle() {
    this.tapeHead.style.left =
      this.cells[this.getTapeMiddleIndex() + this.shifts].style.left;
    this.headIndex = this.getTapeMiddleIndex() + this.shifts;
  }

  moveTapeToStart() {
    this.moveTape(this.cellCount / 2 - this.maxCellDisplay / 2 + this.shifts);
    this.moveHeadToStart();
  }

  moveTapeToEnd() {
    this.moveTape(-this.cellCount / 2 + this.maxCellDisplay / 2 + this.shifts);
    this.moveHeadToStart();
  }

  moveTapeToMiddle() {
    this.moveTape(this.shifts);
    this.moveHeadToMiddle();
  }

  getTapeMiddleIndex() {
    return Math.floor(this.cellCount / 2);
  }

  setTransitionDurationMS(durationMS) {
    this.setCSSVariable("--duration", `${durationMS}ms`);
  }

  fillTapeWithBlanks() {
    this.cells.forEach((cell) => {
      cell.childNodes[0].value = this.blank;
    });
  }
}
