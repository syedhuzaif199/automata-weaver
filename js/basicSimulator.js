export class BasicSimulator {
  constructor(svgHandler, onPauseCallback = () => {}) {
    this.svgHandler = svgHandler;
    this.alphabetTextField = document.querySelector("#alphabet-text");
    this.inputIndex = 0;
    this.currentInputField = null;
    this.highlightCurrentInput();
    this.states = [];
    this.initialState = null;
    this.isPlaying = false;
    this.isAnimating = false;
    this.onPauseCallback = onPauseCallback;
  }
  getInput() {
    const inputbox = document.querySelector("#input");
    const input = [];
    for (let i = 0; i < inputbox.children.length; i++) {
      if (inputbox.children[i].value === "") {
        break;
      }
      input.push(inputbox.children[i].value);
    }

    return input;
  }

  resetSimulation() {
    this.inputIndex = 0;
    this.highlightCurrentInput();
    this.machine.reset();
    this.highlightCurrentStates();
    this.svgHandler.isEditingDisabled = false;
    // this.svgHandler.unHighlightAllTransitions();
  }
}
