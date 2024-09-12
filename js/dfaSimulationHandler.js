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
    this.animationDelayMS = 500;
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
        this.dfa.addTransition(
          this.states.indexOf(originState),
          this.states.indexOf(endState),
          symbol
        );
      });
    });

    this.dfa.finalStates = finalStates;
    console.log("STATES", this.states);
    return true;
  }

  resetDFA() {
    this.inputIndex = 0;
    this.dfa.reset();
    this.highlightCurrentState();
  }

  handlePlayPause() {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      if (this.inputIndex >= this.inputTextField.value.split(" ").length) {
        this.resetDFA();
      }
      this.next();
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

  next() {
    const input = this.inputTextField.value.split(" ");
    if (this.inputIndex >= input.length) {
      console.log("No more input");
      this.isPlaying = false;
      this.onPauseCallback();
      return;
    }
    if (!this.retrieveDFA()) {
      console.log("No initial state");
      this.isPlaying = false;
      this.onPauseCallback();
      this.resetDFA();
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
          }, this.animationDelayMS);
        }, this.animationDelayMS);
        return;
      }
    });
  }

  handleRewind() {
    console.log("rewind");
    this.resetDFA();
    this.isPlaying = false;
    this.onPauseCallback();
  }

  handleFastForward() {
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
    this.svgHandler.highlightControlPoint(currentState);
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
