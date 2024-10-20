export default class Stack {
  constructor() {
    this.stackCellSize = 50;
    this.stackCellMargin = 4;
    this.setCSSVariable("--stack-cell-size", `${this.stackCellSize}px`);
    this.setCSSVariable("--stack-cell-margin", `${this.stackCellMargin}px`);

    this.stack = document.getElementById("stack");
  }

  pop() {
    if (this.stack.children.length === 0) {
      return false;
    }
    const popped = this.stack.lastChild.innerHTML;
    this.stack.removeChild(this.stack.lastChild);
    return popped;
  }

  peek() {
    if (this.stack.children.length === 0) {
      return null;
    }
    console.log("Peeking:", this.stack.lastChild.innerHTML);
    return this.stack.lastChild.innerHTML;
  }

  push(symbols) {
    if (!Array.isArray(symbols)) {
      symbols = [symbols];
    }
    console.log("Pushing:", symbols);
    for (let symbol of symbols) {
      const stackCell = document.createElement("div");
      stackCell.classList.add("stack-cell");
      this.stack.appendChild(stackCell);
      stackCell.innerHTML = symbol;
    }
  }

  removeAll() {
    this.stack.innerHTML = "";
  }

  setCSSVariable(name, value) {
    document.documentElement.style.setProperty(name, value);
  }
}
