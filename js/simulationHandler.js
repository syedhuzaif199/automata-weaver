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
    console.log("play-pause");
    this.retrieveDFA();
  }

  handlePrevious() {
    console.log("previous");
    this.retrieveDFA();
  }

  handleNext() {
    const input = this.inputTextField.value.split(" ");
    if (this.inputIndex >= input.length) {
      console.log("No more input");
      return;
    }
    console.log("next");
    this.retrieveDFA();
    console.log("Input:", input);
    this.dfa.next(input[this.inputIndex]);
    this.inputIndex++;
    console.log("Current State:", this.dfa.currentState);
    this.svgHandler.highlightControlPoint(
      this.states.find((state) => state.stateNumber === this.dfa.currentState)
        .state
    );
    this.checkSuccess();
  }

  handleRewind() {
    console.log("rewind");
    this.retrieveDFA();
    this.inputIndex = 0;
    this.dfa.reset();
    this.svgHandler.highlightControlPoint(this.initialState);
  }

  handleFastForward() {
    console.log("fast-forward");
    this.retrieveDFA();
    this.inputIndex = 0;
    const input = this.inputTextField.value.replaceAll(" ", "");
    this.dfa.run(input);
    const state = this.states.find(
      (state) => state.stateNumber === this.dfa.currentState
    ).state;
    this.svgHandler.highlightControlPoint(state);
    this.inputIndex = input.length;
    this.checkSuccess();
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
