import { lettersFromRange } from "./utils.js";

export default class BasicSimulator {
  constructor(svgHandler, tape, onPauseCallback = () => {}) {
    this.svgHandler = svgHandler;
    this.tape = tape;
    this.alphabetTextField = document.querySelector("#alphabet-text");
    this.inputIndex = 0;
    this.currentTapeCell = null;
    this.states = [];
    this.initialState = null;
    this.isPlaying = false;
    this.hasStarted = false;
    this.isAnimating = false;
    this.onPauseCallback = onPauseCallback;
    this.inputNode = null;
  }
  getInput() {
    const input = [];
    // const tape = this.tape.tape;
    // for (let i = 0; i < tape.children.length; i++) {
    //   if (tape.children[i].children[0].value === "") {
    //     break;
    //   }
    //   input.push(tape.children[i].children[0].value);
    // }

    // console.log("Input: ", input);

    for (let i = 0; i < this.tape.cellCount; i++) {
      if (this.tape.cells[i].children[0].value === this.tape.blank) {
        break;
      }
      input.push(this.tape.getInputFieldAtIndex(i).value);
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
    this.resetTapePosition();
    this.machine.reset();
    this.svgHandler.unHighlightAllControlPoints();
    this.highlightCurrentStates();
    this.svgHandler.isEditingDisabled = false;
    console.error("who called me?");
    // this.svgHandler.unHighlightAllTransitions();
    // this.svgHandler.highlightControlPoints([this.initialState]);
  }

  /* the commented code below is from the original implementation

    stopSimulation() {
    this.isPlaying = false;
    this.isAnimating = false;
    this.svgHandler.isEditingDisabled = false;
    this.onPauseCallback();
  }

  */

  pauseSimulation() {}

  resetTapePosition() {
    this.tape.moveTapeToStart();
  }

  handlePlayPause() {
    if (this.isPlaying) {
      this.pauseSimulation();
    } else if (this.hasStarted) {
      this.resumeSimulation();
    } else {
      this.startSimulation();
    }
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

    this.tape.moveTapeHead(-1);
    this.highlightCurrentStates();
    this.checkSuccess();
  }

  handleNext() {
    if (this.isPlaying || this.isAnimating) {
      return;
    } else if (this.hasEnded) {
      this.resetSimulation();
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
    const input = this.getInput();
    this.tape.moveTapeHead(input.length - this.inputIndex);
    this.inputIndex = 0;
    this.machine.run(input);
    this.highlightCurrentStates();
    this.inputIndex = input.length;
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
}
