import { DANGER_COLOR } from "./constants.js";
import { DFA } from "./dfa.js";

export class DFASimulationHandler {
  constructor(svgHandler) {
    this.svgHandler = svgHandler;
    this.dfa = new DFA();
    this.alphabetTextField = document.querySelector("#alphabet-text");
    this.inputTextField = document.querySelector("#input-text");
    this.inputIndex = 0;
    this.states = [];
    this.initialState = null;
    this.isPlaying = false;
    this.isAnimating = false;
    this.onPauseCallback = () => {};
  }

  retrieveDFA() {
    const controlPoints = this.svgHandler.controlPoints;
    const transitions = this.svgHandler.transitions;

    const numStates = controlPoints.length;
    const alphabet = this.alphabetTextField.value.split(" ");
    const finalStates = [];
    this.states = [];
    const inputNode = this.svgHandler.inputNode;
    this.initialState = null;
    transitions.forEach((transition) => {
      if (transition.startControlPoint === inputNode) {
        this.initialState = transition.endControlPoint;
      }
    });
    if (this.initialState === null) {
      return false;
    }

    this.states[0] = this.initialState;
    let stateIndex = 1;
    controlPoints.forEach((controlPoint) => {
      if (controlPoint !== this.initialState && controlPoint !== inputNode) {
        this.states[stateIndex] = controlPoint;
        if (controlPoint.isFinal()) {
          finalStates.push(stateIndex);
        }
        stateIndex++;
      }
    });

    let symbolsNotInAlpha = new Set();
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
        this.dfa.addTransition(
          this.states.indexOf(originState),
          symbol,
          this.states.indexOf(endState)
        );
      });
    });

    if (symbolsNotInAlpha.size > 0) {
      const symbolsNotInAlphaStr = Array.from(symbolsNotInAlpha).join(", ");
      alert(
        `Transition symbols [${symbolsNotInAlphaStr}] are not in the alphabet. The erroneous transitions are highlighted in red.`
      );
      return false;
    }

    this.dfa.finalStates = finalStates;
    console.log("STATES", this.states);
    return true;
  }

  resetSimulation() {
    this.inputIndex = 0;
    this.dfa.reset();
    this.highlightCurrentState();
    this.svgHandler.isEditingDisabled = false;
    this.svgHandler.unHighlightAllTransitions();
  }

  handlePlayPause() {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      this.svgHandler.isEditingDisabled = true;
      if (this.inputIndex >= this.inputTextField.value.split(" ").length) {
        this.resetSimulation();
      }
      this.next();
    } else {
      this.svgHandler.isEditingDisabled = false;
    }
  }

  handlePrevious() {
    if (this.inputIndex > 0) {
      this.inputIndex--;
    } else {
      return;
    }
    console.log("previous");
    this.retrieveDFA();
    const input = this.inputTextField.value.replaceAll(" ", "");
    this.dfa.run(input.slice(0, this.inputIndex));

    this.highlightCurrentState();
    this.checkSuccess();
  }

  handleNext() {
    if (this.isPlaying || this.isAnimating) {
      return;
    }
    console.log("next");

    this.next();
  }

  getAnimDelay() {
    const speedEle = document.querySelector("#speed");
    return 1000 - speedEle.value + 10;
  }

  next() {
    const input = this.inputTextField.value.split(" ");
    if (this.inputIndex >= input.length) {
      console.log("No more input");
      this.isPlaying = false;
      this.svgHandler.isEditingDisabled = false;
      this.onPauseCallback();
      return;
    }
    if (!this.retrieveDFA()) {
      console.log("No initial state");
      this.isPlaying = false;
      this.onPauseCallback();
      this.resetSimulation();
      return;
    }
    console.log("Input:", input);
    const nextSymbol = input[this.inputIndex];
    const nextStateNumber =
      this.dfa.transitions[[this.dfa.currentState, nextSymbol]];
    const currentState = this.states.find(
      (state, i) => i === this.dfa.currentState
    );
    console.log("Current State:", currentState);
    console.log("DFA transitions:", this.dfa.transitions);
    const nextState = this.states.find((state, i) => i === nextStateNumber);
    console.log("NextSymbol:", nextSymbol);
    console.log("NextStateNumber:", nextStateNumber);
    console.log("Next State:", nextState);
    this.svgHandler.transitions.forEach((transition) => {
      if (
        transition.startControlPoint === currentState &&
        transition.endControlPoint === nextState
      ) {
        this.svgHandler.highlightTransition(transition);
        this.isAnimating = true;
        setTimeout(() => {
          this.svgHandler.unHighlightTransition(transition);
          this.dfa.next(nextSymbol);
          this.inputIndex++;
          console.log("Current State:", this.dfa.currentState);
          this.highlightCurrentState();
          this.checkSuccess();
          this.isAnimating = false;
          setTimeout(() => {
            if (this.isPlaying) {
              this.next();
            }
          }, this.getAnimDelay());
        }, this.getAnimDelay());
        return;
      }
    });
  }

  handleRewind() {
    console.log("rewind");
    this.resetSimulation();
    this.isPlaying = false;
    this.onPauseCallback();
  }

  handleFastForward() {
    if (this.isPlaying || this.isAnimating) {
      return;
    }
    console.log("fast-forward");
    this.retrieveDFA();
    this.inputIndex = 0;
    const input = this.inputTextField.value.replaceAll(" ", "");
    this.dfa.run(input);
    this.highlightCurrentState();
    this.inputIndex = input.length;
    this.checkSuccess();
  }

  highlightCurrentState() {
    const currentState = this.states.find(
      (state, i) => i === this.dfa.currentState
    );
    if (currentState) {
      this.svgHandler.highlightControlPoint(currentState);
    }
  }

  checkSuccess() {
    const input = this.inputTextField.value.replaceAll(" ", "");
    if (this.inputIndex >= input.length) {
      const currentState = this.states.find(
        (state, i) => i === this.dfa.currentState
      );
      if (currentState.isFinal()) {
        this.svgHandler.setSuccessState(currentState);
      } else {
        this.svgHandler.setFailState(currentState);
      }
    }
  }
}
