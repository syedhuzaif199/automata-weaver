import BasicSimulator from "./basicSimulator.js";
import { BLANK, DANGER_COLOR } from "./constants.js";
import { lettersFromRange } from "./utils.js";
import TM from "./tm.js";
export default class TmSimulator extends BasicSimulator {
  constructor(svgHandler, tape, onPauseCallback = () => {}) {
    super(svgHandler, tape, onPauseCallback);
    this.tape.moveTapeToMiddle();
    this.tape.blank = BLANK;
    this.tape.fillTape(BLANK);
    this.machine = new TM();
    this.machine.blank = BLANK;
    this.tapeAlphabetTextField = document.getElementById("tape-alphabet-text");
    this.simulating = false;
    this.input = [];
  }

  retrieveMachine() {
    this.machine.transitions = {};
    const controlPoints = this.svgHandler.controlPoints;
    const transitions = this.svgHandler.transitions;

    const numStates = controlPoints.length - 1;
    this.machine.numStates = numStates;
    const alphabet = this.getAlphabet();
    const tapeAlphabet = this.getTapeAlphabet();
    tapeAlphabet.push(BLANK);
    this.machine.alphabet = alphabet;
    this.machine.tapeAlphabet = tapeAlphabet;
    this.input = this.getInput();

    console.log("Alphabet:", alphabet);
    console.log("Tape Alphabet:", tapeAlphabet);
    console.log("Input:", this.input);

    for (let symbol of alphabet) {
      if (!tapeAlphabet.includes(symbol)) {
        alert(`Alphabet symbol ${symbol} does not belong to the tape alphabet`);
        return false;
      }
    }

    for (let symbol of this.input) {
      if (!alphabet.includes(symbol) && symbol !== "") {
        alert(`Input symbol ${symbol} does not belong to the alphabet`);
        return false;
      }
    }

    const finalStates = [];
    this.states = [];
    const inputNode = this.svgHandler.inputNode;
    this.initialState = null;

    // find the initial state
    transitions.forEach((transition) => {
      if (transition.startControlPoint === inputNode) {
        this.initialState = transition.endControlPoint;
      }
    });
    if (this.initialState === null) {
      return false;
    }

    // add the initial state
    this.states[0] = this.initialState;
    if (this.initialState.isFinal()) {
      finalStates.push(0);
    }
    let stateIndex = 1;

    // add the rest of the states
    controlPoints.forEach((controlPoint) => {
      if (controlPoint !== this.initialState && controlPoint !== inputNode) {
        this.states[stateIndex] = controlPoint;
        if (controlPoint.isFinal()) {
          finalStates.push(stateIndex);
        }
        stateIndex++;
      }
    });

    // add transitions
    let inputsNotInAlpha = new Set();
    let outputsNotInAlpha = new Set();
    let multipleTransitions = new Set();
    let invalidDirection = false;
    let alertMessage = "";
    transitions.forEach((transition) => {
      if (transition.startControlPoint === inputNode) {
        return;
      }

      const originState = this.states.find(
        (state) => state === transition.startControlPoint
      );

      const endState = this.states.find(
        (state) => state === transition.endControlPoint
      );

      const symbolSets = transition.getText().replaceAll(" ", "").split(";");

      symbolSets.forEach((symbolSet) => {
        const [sym1, sym2, sym3] = symbolSet.split(",");
        let inputSymbol, outputSymbol, direction;
        inputSymbol = sym1;
        if (sym3 === undefined) {
          outputSymbol = null;
          direction = sym2;
        } else {
          outputSymbol = sym2;
          direction = sym3;
        }
        if (!tapeAlphabet.includes(inputSymbol)) {
          inputsNotInAlpha.add(inputSymbol);
          this.svgHandler.highlightTransition(transition, DANGER_COLOR);
          return;
        }
        if (outputSymbol !== null && !tapeAlphabet.includes(outputSymbol)) {
          outputsNotInAlpha.add(outputSymbol);
          this.svgHandler.highlightTransition(transition, DANGER_COLOR);
          return;
        } else if (outputSymbol === null) {
          outputSymbol = inputSymbol;
        }

        if (direction !== "L" && direction !== "R") {
          invalidDirection = true;
          this.svgHandler.highlightTransition(transition, DANGER_COLOR);
          return;
        } else {
          direction = direction === "L" ? -1 : 1;
        }

        if (
          this.machine.transitions[
            [this.states.indexOf(originState), inputSymbol]
          ] !== undefined
        ) {
          multipleTransitions.add([originState, inputSymbol]);
          this.svgHandler.highlightTransition(transition, DANGER_COLOR);
        }
        this.machine.addTransition(
          this.states.indexOf(originState),
          inputSymbol,
          this.states.indexOf(endState),
          outputSymbol,
          direction
        );
      });
    });

    if (inputsNotInAlpha.size > 0) {
      const inputsNotInAlphaStr = Array.from(inputsNotInAlpha).join(", ");
      alertMessage += `Transition input symbols [${inputsNotInAlphaStr}] are not in the tape alphabet.\n`;
    }

    if (outputsNotInAlpha.size > 0) {
      const outputsNotInAlphaStr = Array.from(outputsNotInAlpha).join(", ");
      alertMessage += `Transition output symbols [${outputsNotInAlphaStr}] are not in the tape alphabet.\n`;
    }

    if (multipleTransitions.size > 0) {
      const multipleTransitionsStr = Array.from(multipleTransitions)
        .map(
          ([state, symbol]) =>
            `${
              state.getText() === ""
                ? "(Unnamed state)"
                : "State " + state.getText()
            } on symbol ${symbol}\n`
        )
        .join("");
      alertMessage += `Multiple transitions found for the following state-symbol pairs:\n${multipleTransitionsStr}\n`;
    }

    if (invalidDirection) {
      alertMessage += `Invalid direction found in some transitions. The direction must be either 'L' or 'R'.\n`;
    }

    if (alertMessage !== "") {
      alertMessage += "The erroneous transitions are highlighted in red.";
      alert(alertMessage);
      return false;
    }

    this.machine.finalStates = finalStates;
    this.machine.writeInput(this.input);
    return true;
  }

  handlePlayPause() {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      this.svgHandler.isEditingDisabled = true;
      if (!this.simulating) {
        const input = this.input;
        this.resetSimulation();
        this.input = input;
      }
      this.next();
    } else {
      this.svgHandler.isEditingDisabled = false;
    }
  }

  next() {
    if (!this.simulating) {
      if (!this.retrieveMachine()) {
        console.log("Error in retrieving Turing machine");
        this.resetSimulation();
        return;
      }
      console.log("Machine:", this.machine);
      this.startSimulation();
    }
    // if (this.inputIndex >= input.length) {
    //   this.checkSuccess();
    //   this.stopSimulation();
    //   console.log("No more input");
    //   return;
    // }
    const input = this.input;

    console.log("Input:", input);
    const nextSymbol = this.tape.getSymbolAtHead();
    const machineTransition =
      this.machine.transitions[[this.machine.currentState, nextSymbol]];
    if (machineTransition === undefined) {
      console.log("No transition found");
      this.checkSuccess();
      this.stopSimulation();
      return;
    }
    const [nextStateNumber, outputSymbol, direction] = machineTransition;
    const currentState = this.states.find(
      (state, i) => i === this.machine.currentState
    );
    const nextState = this.states.find((state, i) => i === nextStateNumber);
    console.log("CurrentStateNumber:", this.machine.currentState);
    console.log("NextStateNumber:", nextStateNumber);
    const transition = this.svgHandler.transitions.find(
      (transition) =>
        transition.startControlPoint === currentState &&
        transition.endControlPoint === nextState
    );
    if (transition === undefined) {
      console.log("No transition found");
      this.resetSimulation();
      return;
    }
    this.svgHandler.highlightControlPoints([]);
    this.svgHandler.highlightTransition(transition);
    this.isAnimating = true;
    setTimeout(() => {
      this.svgHandler.unHighlightTransition(transition);
      const continueNext = this.machine.next(nextSymbol);

      this.tape.writeAtHead(outputSymbol);
      this.inputIndex += direction;
      this.tape.moveTape(-direction);
      this.highlightCurrentStates();
      // this.checkSuccess();
      this.isAnimating = false;
      if (!continueNext) {
        this.checkSuccess();
        this.stopSimulation();
        return;
      }
      setTimeout(() => {
        if (this.isPlaying) {
          this.next();
        }
      }, this.getAnimDelay());
    }, this.getAnimDelay());
  }

  getTapeAlphabet() {
    const tapeAlphabet = this.tapeAlphabetTextField.value.split(" ");
    console.log("Tape alphabet before regex resolution:", tapeAlphabet);
    const resolvedAlphabet = tapeAlphabet
      .map((val) => {
        const letters = lettersFromRange(val);
        if (letters) {
          return letters;
        } else {
          return val;
        }
      })
      .flat();
    console.log("Tape alphabet after regex resolution:", resolvedAlphabet);
    return resolvedAlphabet;
  }

  getInput() {
    if (this.input.length > 0) {
      return this.input;
    }
    const input = [];
    const startIndex = parseInt(this.tape.cellCount / 2);
    let endIndex = startIndex;
    for (let i = startIndex; i < this.tape.cells.length; i++) {
      if (this.tape.getInputFieldAtIndex(i).value === this.tape.blank) {
        endIndex = i;
        break;
      }
      input.push(this.tape.getInputFieldAtIndex(i).value);
    }
    this.tape.fillTape(this.tape.blank);
    for (let i = startIndex; i < endIndex; i++) {
      this.tape.getInputFieldAtIndex(i).value = input[i - startIndex];
    }
    return input;
  }

  resetTapePosition() {
    this.tape.moveTapeToMiddle();
  }

  startSimulation() {
    this.simulating = true;
  }

  resetSimulation() {
    super.resetSimulation();
    this.tape.fillTape(BLANK);
    const startIdx = this.tape.getHeadIndex();
    this.input.forEach((symbol, i) => {
      this.tape.getInputFieldAtIndex(startIdx + i).value = symbol;
    });
    this.input = [];
  }

  stopSimulation() {
    super.stopSimulation();
    this.simulating = false;
  }

  highlightCurrentStates() {
    this.svgHandler.highlightControlPoints(
      this.states.filter((state, i) => i === this.machine.currentState)
    );
  }

  checkSuccess() {
    if (this.machine.finalStates.includes(this.machine.currentState)) {
      this.svgHandler.setSuccessStates(
        this.states.filter((state, i) => i === this.machine.currentState)
      );
    } else {
      this.svgHandler.setFailStates(
        this.states.filter((state, i) => i === this.machine.currentState)
      );
    }
  }
}
