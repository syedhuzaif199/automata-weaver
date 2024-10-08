import { lettersFromRange } from "./utils.js";

export default class BasicSimulator {
  constructor(svgHandler, tape, onNotPlayingCallback = () => {}) {
    this.svgHandler = svgHandler;
    this.tape = tape;
    this.tape.blank = "";
    this.tape.fillTapeWithBlanks();
    this.tape.moveTapeToStart();
    this.alphabetTextField = document.querySelector("#alphabet-text");
    this.states = [];
    this.initialState = null;
    this.onNotPlayingCallback = onNotPlayingCallback;
    this.inputNode = null;
    this.states = [];
    this.finalStates = [];
    this.simulationStates = Object.freeze({
      PLAYING: 0,
      PAUSED: 1,
      ENDED: 2,
      RESET: 3,
    });
    this.simulationState = this.simulationStates.RESET;
    this.controlPoints = this.svgHandler.controlPoints;
    this.transitions = this.svgHandler.transitions;
    this.isAnimating = false;
  }

  getInput() {
    const input = [];
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
    this.simulationState = this.simulationStates.RESET;
    console.log("Reset simulation");
    this.resetTape();
    this.svgHandler.setFailStates([]);
    this.svgHandler.setSuccessStates([]);
    this.svgHandler.highlightControlPoints([this.initialState]);
    this.svgHandler.unHighlightAllTransitions();
    this.machine.reset();

    this.svgHandler.isEditingDisabled = false;
  }
  playSimulation() {
    this.simulationState = this.simulationStates.PLAYING;
    this.svgHandler.isEditingDisabled = true;
    console.log("Playing simulation");
    this.loopSimulation();
  }

  loopSimulation() {
    console.log("Looping");
    if (this.simulationState === this.simulationStates.PLAYING) {
      this.next().then((ended) => {
        if (!ended) {
          setTimeout(() => {
            if (this.simulationState === this.simulationStates.PLAYING) {
              this.loopSimulation();
            }
          }, this.getAnimDelay());
        } else {
          this.endSimulation();
          this.onNotPlayingCallback();
        }
      });
    }
  }

  pauseSimulation() {
    this.simulationState = this.simulationStates.PAUSED;
    console.log("Paused simulation");
  }

  endSimulation() {
    this.simulationState = this.simulationStates.ENDED;
    this.svgHandler.isEditingDisabled = false;
    console.log("Ended simulation");
    this.checkSuccess();
  }

  // override for Turing machines
  resetTape() {
    this.tape.moveTapeToStart();
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

  handlePlayPause() {
    switch (this.simulationState) {
      case this.simulationStates.PLAYING:
        this.pauseSimulation();
        this.onNotPlayingCallback();
        break;
      case this.simulationStates.RESET:
        this.onMoveOutOfResetState();
        if (!this.retrieveMachine()) {
          break;
        }
      case this.simulationStates.PAUSED:
        this.playSimulation();
        break;
      case this.simulationStates.ENDED:
        // should move to playing state but has to go through reset first
        // this will possibly have to change in the future as resetSimulation can be thought of as exclusively for moving into the reset state
        this.resetSimulation();
        if (!this.retrieveMachine()) {
          break;
        }
        this.playSimulation();
        break;
    }
  }

  handlePrevious() {
    console.log("Simulation state:", this.simulationState);
    switch (this.simulationState) {
      case this.simulationStates.ENDED:
        if (!this.retrieveMachine()) {
          break;
        }
        this.pauseSimulation();
      case this.simulationStates.PAUSED:
        if (!this.retrieveMachine()) {
          break;
        }
        this.previous();
        break;
      case this.simulationStates.PLAYING:
        break;
      case this.simulationStates.RESET:
        break;
    }
  }

  handleNext() {
    switch (this.simulationState) {
      case this.simulationStates.PLAYING:
        break;
      case this.simulationStates.ENDED:
        break;

      case this.simulationStates.RESET:
        this.onMoveOutOfResetState();
        if (!this.retrieveMachine()) {
          break;
        }
        if (!this.isAnimating) {
          this.isAnimating = true;
          this.next().then((ended) => {
            this.isAnimating = false;
            if (ended) {
              this.endSimulation();
            } else {
              this.pauseSimulation();
            }
          });
        }
        break;
      case this.simulationStates.PAUSED:
        if (!this.retrieveMachine()) {
          break;
        }
        if (!this.isAnimating) {
          this.isAnimating = true;
          this.next().then((ended) => {
            this.isAnimating = false;
            if (ended) {
              this.endSimulation();
            }
          });
        }
        break;
    }
  }

  handleFastForward() {
    if (this.simulationState === this.simulationStates.RESET) {
      this.onMoveOutOfResetState();
    }
    switch (this.simulationState) {
      case this.simulationStates.PLAYING:
        this.onNotPlayingCallback();
      case this.simulationStates.RESET:
      case this.simulationStates.PAUSED:
        if (!this.retrieveMachine()) {
          break;
        }
        this.runMachine();
        this.endSimulation();
        break;
      case this.simulationStates.ENDED:
        break;
    }
  }

  handleRewind() {
    switch (this.simulationState) {
      case this.simulationStates.PLAYING:
        this.onNotPlayingCallback();
      case this.simulationStates.PAUSED:
      case this.simulationStates.ENDED:
        this.resetSimulation();
        break;
      case this.simulationStates.RESET:
        break;
    }
  }

  checkSymbolsInAlphabet() {
    const input = this.getInput();
    for (let symbol of input) {
      if (!this.machine.alphabet.includes(symbol) && symbol !== "") {
        alert(`Input symbol ${symbol} does not belong to the alphabet`);
        return false;
      }
    }
  }

  retrieveMachine() {
    this.transitions = this.svgHandler.transitions;
    this.controlPoints = this.svgHandler.controlPoints;
    this.machine.transitions = {};

    const numStates = this.controlPoints.length - 1;
    this.machine.numStates = numStates;
    const alphabet = this.getAlphabet();
    this.machine.alphabet = alphabet;

    this.checkSymbolsInAlphabet();

    this.states = [];
    this.finalStates = [];
    const inputNode = this.svgHandler.inputNode;
    this.initialState = null;

    // find the initial state
    this.transitions.forEach((transition) => {
      if (transition.startControlPoint === inputNode) {
        this.initialState = transition.endControlPoint;
      }
    });
    if (this.initialState === null) {
      console.error("Initial state not found");
      return false;
    }

    // add the initial state
    this.states[0] = this.initialState;
    if (this.initialState.isFinal()) {
      this.finalStates.push(0);
    }
    let stateIndex = 1;

    // add the rest of the states
    this.controlPoints.forEach((controlPoint) => {
      if (controlPoint !== this.initialState && controlPoint !== inputNode) {
        this.states[stateIndex] = controlPoint;
        if (controlPoint.isFinal()) {
          this.finalStates.push(stateIndex);
        }
        stateIndex++;
      }
    });
  }

  // only Turing machines override to provide an implementations
  onMoveOutOfResetState() {}

  // override for Turing machines
  runMachine() {
    this.svgHandler.highlightControlPoints([]);
    this.svgHandler.unHighlightAllTransitions();
    const input = [];
    const startIdx = this.tape.headIndex;
    for (let i = startIdx; i < this.tape.cellCount; i++) {
      if (this.tape.getInputFieldAtIndex(i).value === this.tape.blank) {
        break;
      }
      input.push(this.tape.getInputFieldAtIndex(i).value);
    }
    console.error("Input:", input);
    this.machine.run(input);
    this.tape.moveTapeHead(input.length);
    this.endSimulation();
  }

  //override for Turing machines
  previous() {
    if (this.tape.headIndex > 0) {
      this.machine.reset();
      this.tape.moveTapeHead(-1);
      const input = [];
      for (let i = 0; i < this.tape.headIndex; i++) {
        input.push(this.tape.getInputFieldAtIndex(i).value);
      }
      console.log("Input:", input);
      this.machine.run(input);
      this.highlightCurrentStates();
      this.svgHandler.unHighlightAllTransitions();
    }
  }
}
