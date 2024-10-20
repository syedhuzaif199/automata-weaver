import BasicSimulator from "./basicSimulator.js";
import { BLANK, DANGER_COLOR } from "./constants.js";
import { lettersFromRange } from "./utils.js";
import TM from "./tm.js";
export default class TmSimulator extends BasicSimulator {
  constructor(svgHandler, tape, onNotPlayingCallback = () => {}) {
    super(svgHandler, tape, onNotPlayingCallback);
    this.tape.moveTapeToMiddle();
    this.tape.blank = BLANK;
    this.tape.fillTapeWithBlanks();
    this.machine = new TM();
    this.machine.blank = BLANK;
    this.tapeAlphabetTextField = document.getElementById("tape-alphabet-text");
    this.input = [];
    this.previousStates = [];
  }

  retrieveMachine() {
    super.retrieveMachine();
    console.error("Retrieve machine called");
    const alphabet = this.getAlphabet();
    const tapeAlphabet = this.getTapeAlphabet();
    tapeAlphabet.push(BLANK);
    this.machine.alphabet = alphabet;
    this.machine.tapeAlphabet = tapeAlphabet;

    console.log("Alphabet:", alphabet);
    console.log("Tape Alphabet:", tapeAlphabet);
    console.log("Input:", this.input);

    for (let symbol of alphabet) {
      if (!tapeAlphabet.includes(symbol)) {
        alert(`Alphabet symbol ${symbol} does not belong to the tape alphabet`);
        return false;
      }
    }

    const inputNode = this.svgHandler.inputNode;

    // add transitions
    let inputsNotInAlpha = new Set();
    let outputsNotInAlpha = new Set();
    let multipleTransitions = new Set();
    let invalidDirection = false;
    let alertMessage = "";
    this.transitions.forEach((transition) => {
      if (transition.startControlPoint === inputNode) {
        return;
      }

      const originState = this.states.find(
        (state) => state === transition.startControlPoint
      );

      const endState = this.states.find(
        (state) => state === transition.endControlPoint
      );

      const symbolSets = transition.getText();

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

    this.machine.finalStates = this.finalStates;
    return true;
  }

  next() {
    console.log("Machine:", this.machine);
    const nextSymbol = this.tape.getSymbolAtHead();

    //if no input is present at all
    const machineTransition =
      this.machine.transitions[[this.machine.currentState, nextSymbol]];
    if (machineTransition === undefined) {
      console.log("No transition found");
      return Promise.resolve(true);
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
      return Promise.reject();
    }
    this.svgHandler.highlightTransition(transition);
    return new Promise((resolve) => {
      setTimeout(() => {
        this.svgHandler.unHighlightTransition(transition);
        this.previousStates.push({
          state: this.machine.currentState,
          headSymbol: nextSymbol,
          headIndex: this.tape.headIndex,
        });
        const continueNext = this.machine.next(nextSymbol);

        this.tape.writeAtHead(outputSymbol);
        this.tape.moveTape(-direction);
        this.highlightCurrentStates();
        if (!continueNext) {
          resolve(true);
        } else {
          resolve(false);
        }
      }, this.getAnimDelay());
    });
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
    console.error("Tape alphabet after regex resolution:", resolvedAlphabet);
    return resolvedAlphabet;
  }

  getInput() {
    const input = [];
    const startIndex = this.tape.getTapeMiddleIndex();
    let endIndex = startIndex;
    for (let i = startIndex; i < this.tape.cells.length; i++) {
      if (this.tape.getInputFieldAtIndex(i).value === this.tape.blank) {
        endIndex = i;
        break;
      }
      input.push(this.tape.getInputFieldAtIndex(i).value);
    }
    this.tape.fillTapeWithBlanks();
    for (let i = startIndex; i < endIndex; i++) {
      this.tape.getInputFieldAtIndex(i).value = input[i - startIndex];
    }
    return input;
  }

  checkSymbolsInAlphabet() {
    for (let symbol of this.input) {
      if (!this.machine.alphabet.includes(symbol) && symbol !== "") {
        alert(`Input symbol ${symbol} does not belong to the alphabet`);
        return false;
      }
    }
  }

  // this is called after reset
  onMoveOutOfResetState() {
    console.log("Moved out of reset state");
    this.input = this.getInput();
    this.previousStates = [];
  }

  resetTape() {
    this.tape.moveTapeToMiddle();
    this.tape.fillTapeWithBlanks();
    const startIdx = this.tape.headIndex;
    this.input.forEach((symbol, i) => {
      this.tape.getInputFieldAtIndex(startIdx + i).value = symbol;
    });
  }

  runMachine() {
    let tapeShifts = 0;
    let symbol = this.tape.getSymbolAtHead();
    let i = this.tape.headIndex;
    while (true) {
      if (
        this.machine.transitions[[this.machine.currentState, symbol]] ===
        undefined
      ) {
        break;
      }
      const [nextState, outputSymbol, direction] =
        this.machine.transitions[[this.machine.currentState, symbol]];
      this.machine.next(symbol);
      tapeShifts -= direction;
      this.tape.getInputFieldAtIndex(i).value = outputSymbol;
      i += direction;
      symbol = this.tape.getInputFieldAtIndex(i).value;
    }
    this.tape.moveTape(tapeShifts);
    this.endSimulation();
  }
  previous() {
    const prevState = this.previousStates.pop();

    if (prevState === undefined) {
      return;
    }
    this.machine.currentState = prevState.state;
    this.tape.moveTapeHead(prevState.headIndex - this.tape.headIndex);
    this.tape.getInputFieldAtIndex(prevState.headIndex).value =
      prevState.headSymbol;
    this.highlightCurrentStates();
  }

  highlightCurrentStates() {
    this.svgHandler.highlightControlPoints(
      this.states.filter((state, i) => i === this.machine.currentState)
    );
  }

  getInstantaneoudDescription() {
    let id = "";
    for (let i = this.tape.getTapeMiddleIndex(); i < this.input.length; i++) {
      if (i == this.tape.headIndex) {
        id += `q${String.fromCharCode(
          SUBSCRIPT_ZERO_CODE + this.currentState
        )}`;
      }
      id += this.tape[i];
    }
    return id;
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
