import BasicSimulator from "./basicSimulator.js";
import { DANGER_COLOR } from "./constants.js";
import DFA from "./dfa.js";

export default class DFASimulator extends BasicSimulator {
  constructor(svgHandler, onPauseCallback = () => {}) {
    super(svgHandler, onPauseCallback);
    this.machine = new DFA();
  }
  retrieveMachine() {
    this.machine.transitions = {};
    const controlPoints = this.svgHandler.controlPoints;
    const transitions = this.svgHandler.transitions;

    const numStates = controlPoints.length - 1;
    this.machine.numStates = numStates;
    const alphabet = this.getAlphabet();
    this.machine.alphabet = alphabet;
    const input = this.getInput();

    // check if input symbols are in the alphabet
    for (let symbol of input) {
      if (!this.machine.alphabet.includes(symbol) && symbol !== "") {
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
    let symbolsNotInAlpha = new Set();
    let multipleTransitions = new Set();
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

      const symbols = transition.getText().replaceAll(" ", "").split(",");

      symbols.forEach((symbol) => {
        if (!alphabet.includes(symbol)) {
          symbolsNotInAlpha.add(symbol);
          this.svgHandler.highlightTransition(transition, DANGER_COLOR);
          return;
        }
        if (
          this.machine.transitions[
            [this.states.indexOf(originState), symbol]
          ] !== undefined
        ) {
          multipleTransitions.add([originState, symbol]);
          this.svgHandler.highlightTransition(transition, DANGER_COLOR);
        }
        this.machine.addTransition(
          this.states.indexOf(originState),
          symbol,
          this.states.indexOf(endState)
        );
      });
    });

    if (symbolsNotInAlpha.size > 0) {
      const symbolsNotInAlphaStr = Array.from(symbolsNotInAlpha).join(", ");
      alertMessage += `Transition symbols [${symbolsNotInAlphaStr}] are not in the alphabet. The erroneous transitions are highlighted in red.\n`;
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
      alertMessage += `Multiple transitions found for the following state-symbol pairs:\n${multipleTransitionsStr}The erroneous transitions are highlighted in red.\n`;
    }

    //check if each state has a transition for each symbol in the alphabet
    const missedSymbols = new Set();
    for (let i = 0; i < this.machine.numStates; i++) {
      for (let symbol of this.machine.alphabet) {
        if (this.machine.transitions[[i, symbol]] === undefined) {
          missedSymbols.add([i, symbol]);
        }
      }
    }

    if (missedSymbols.size > 0) {
      console.log("States:", this.states);
      console.log("States?:", this.machine.numStates);
      console.log("Well, NumStates?:", numStates);
      let missedSymbolsStr = "";
      for (let [state, symbol] of missedSymbols) {
        missedSymbolsStr += `${
          this.states[state].getText() === ""
            ? "(Unnamed state)"
            : "State " + this.states[state].getText()
        } on symbol ${symbol}, \n`;
      }
      alertMessage += `The following states are missing transitions on the following symbols: \n${missedSymbolsStr}\n`;
    }

    if (alertMessage !== "") {
      alert(alertMessage);
      return false;
    }

    this.machine.finalStates = finalStates;
    return true;
  }
  next() {
    const input = this.getInput();
    if (!this.retrieveMachine()) {
      console.log("Error in retrieving DFA");
      this.resetSimulation();
      return;
    }
    if (this.inputIndex >= input.length) {
      console.log("No more input");
      this.checkSuccess();
      this.stopSimulation();
      return;
    }
    console.log("Input:", input);
    const nextSymbol = input[this.inputIndex];
    const nextStateNumber =
      this.machine.transitions[[this.machine.currentState, nextSymbol]];
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
      this.machine.next(nextSymbol);
      this.inputIndex++;
      this.highlightCurrentInput();
      this.highlightCurrentStates();
      this.checkSuccess();
      this.isAnimating = false;
      setTimeout(() => {
        if (this.isPlaying) {
          this.next();
        }
      }, this.getAnimDelay());
    }, this.getAnimDelay());
  }

  drawMinimizedDFA() {
    if (!this.retrieveMachine()) {
      return;
    }

    const minDfa = this.machine.getMinimized();
    this.svgHandler.drawDFA(minDfa);
  }

  highlightCurrentStates() {
    const currentState = this.states.find(
      (state, i) => i === this.machine.currentState
    );
    if (currentState) {
      this.svgHandler.highlightControlPoints([currentState]);
    }
  }

  checkSuccess() {
    const input = this.getInput();
    if (this.inputIndex >= input.length) {
      const currentState = this.states.find(
        (state, i) => i === this.machine.currentState
      );
      if (currentState.isFinal()) {
        this.svgHandler.setSuccessStates([currentState]);
      } else {
        this.svgHandler.setFailStates([currentState]);
      }
    }
  }
}
