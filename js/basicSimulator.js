import { lettersFromRange } from "./utils.js";

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
    this.inputNode = null;
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

  getAnimDelay() {
    const speedEle = document.querySelector("#speed");
    return 1000 - speedEle.value + 10;
  }

  resetSimulation() {
    this.stopSimulation();
    this.inputIndex = 0;
    this.highlightCurrentInput();
    this.machine.reset();
    this.highlightCurrentStates();
    this.svgHandler.isEditingDisabled = false;
    // this.svgHandler.unHighlightAllTransitions();
    this.svgHandler.unHighlightAllControlPoints();
    // this.svgHandler.highlightControlPoints([this.initialState]);
  }

  handlePlayPause() {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      this.svgHandler.isEditingDisabled = true;
      if (this.inputIndex >= this.getInput().length) {
        this.resetSimulation();
      }
      this.next();
    } else {
      this.svgHandler.isEditingDisabled = false;
    }
  }

  getAlphabet() {
    const alphabet = this.alphabetTextField.value.split(" ");
    console.log("Alphabet before regex resolution:", alphabet);
    const resolvedAlphabet = alphabet
      .map((val) => {
        const letters = lettersFromRange(val);
        if (letters) {
          return letters;
        } else {
          return val;
        }
      })
      .flat();
    console.log("Alphabet after regex resolution:", resolvedAlphabet);
    return resolvedAlphabet;
  }

  stopSimulation() {
    this.isPlaying = false;
    this.isAnimating = false;
    this.svgHandler.isEditingDisabled = false;
    this.onPauseCallback();
  }

  handlePrevious() {
    if (this.inputIndex > 0) {
      this.inputIndex--;
    } else {
      return;
    }
    console.log("previous");
    this.retrieveMachine();
    const input = this.getInput();

    this.machine.run(input.slice(0, this.inputIndex));

    this.highlightCurrentInput();
    this.highlightCurrentStates();
    this.checkSuccess();
  }

  handleNext() {
    if (this.isPlaying || this.isAnimating) {
      return;
    }
    console.log("next");

    this.next();
  }

  handleFastForward() {
    if (this.isPlaying || this.isAnimating) {
      return;
    }
    console.log("fast-forward");
    this.retrieveMachine();
    this.inputIndex = 0;
    const input = this.getInput();
    this.machine.run(input);
    this.highlightCurrentStates();
    this.inputIndex = input.length;
    this.highlightCurrentInput();
    this.checkSuccess();
  }

  handleRewind() {
    console.log("rewind");
    this.resetSimulation();
    this.isPlaying = false;
    this.onPauseCallback();
  }

  highlightCurrentStates() {
    const currentStates = this.states.filter((state, i) =>
      this.machine.currentStates.includes(i)
    );
    if (currentStates) {
      this.svgHandler.highlightControlPoints(currentStates);
    }
  }

  highlightCurrentInput() {
    const input = document.querySelector("#input");
    if (this.currentInputField) {
      this.currentInputField.classList.remove("highlighted-input-field");
    }
    if (this.inputIndex >= input.children.length) {
      return;
    }
    this.currentInputField = input.children[this.inputIndex];
    this.currentInputField.classList.add("highlighted-input-field");
  }
}
