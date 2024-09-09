import { SVGHandler } from "./SVGHandler.js";
import { DFA } from "./dfa.js";

export class SimulationHandler {
  constructor(svgHandler) {
    this.svgHandler = svgHandler;
    this.dfa = new DFA();
    this.alphabetTextField = document.querySelector("#alphabet-text");
    this.inputTextField = document.querySelector("#input-text");
    this.inputIndex = 0;
    this.states = [];
    this.initialState = null;
    this.paused = true;
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

    this.states.push({ state: this.initialState, stateNumber: 0 });
    let stateIndex = 1;
    controlPoints.forEach((controlPoint) => {
      if (controlPoint !== this.initialState && controlPoint !== inputNode) {
        this.states.push({ state: controlPoint, stateNumber: stateIndex });
        stateIndex++;
      }
    });

    transitions.forEach((transition) => {
      if (transition.startControlPoint === inputNode) {
        return;
      }
      const originState = this.states.find(
        (state) => state.state === transition.startControlPoint
      );

      const endState = this.states.find(
        (state) => state.state === transition.endControlPoint
      );

      const symbol = transition.getText();
      this.dfa.addTransition(
        originState.stateNumber,
        endState.stateNumber,
        symbol
      );
    });
  }

  handlePlayPause() {
    this.paused = !this.paused;
    if (!this.paused) {
      this.handleNext();
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
    const input = this.inputTextField.value.split(" ");
    if (this.inputIndex >= input.length) {
      console.log("No more input");
      this.paused = true;
      return;
    }
    console.log("next");
    this.retrieveDFA();
    console.log("Input:", input);
    const nextSymbol = input[this.inputIndex];
    const nextStateNumber =
      this.dfa.transitions[[this.dfa.currentState, nextSymbol]];
    this.svgHandler.transitions.forEach((transition) => {
      const currentState = this.states.find(
        (state) => state.stateNumber === this.dfa.currentState
      );
      const nextState = this.states.find(
        (state) => state.stateNumber === nextStateNumber
      );

      if (
        transition.startControlPoint === currentState.state &&
        transition.endControlPoint === nextState.state
      ) {
        this.svgHandler.highlightTransition(transition).then(() => {
          this.dfa.next(nextSymbol);

          this.inputIndex++;
          console.log("Current State:", this.dfa.currentState);
          this.highlightCurrentState();
          this.checkSuccess();
          if (!this.paused) {
		setTimeout(() => {
		    this.handleNext();
		}, 1000);
            //this.handleNext();
          }
        });
      }
    });
  }

  handleRewind() {
    console.log("rewind");
    this.retrieveDFA();
    this.inputIndex = 0;
    this.dfa.reset();
    this.highlightCurrentState();
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
      (state) => state.stateNumber === this.dfa.currentState
    ).state;
    this.svgHandler.highlightControlPoint(currentState);
  }

  checkSuccess() {
    const input = this.inputTextField.value.replaceAll(" ", "");
    if (this.inputIndex >= input.length) {
      const currentState = this.states.find(
        (state) => state.stateNumber === this.dfa.currentState
      ).state;
      if (currentState.isFinal()) {
        this.svgHandler.setSuccessState(currentState);
      } else {
        this.svgHandler.setFailState(currentState);
      }
    }
  }
}
