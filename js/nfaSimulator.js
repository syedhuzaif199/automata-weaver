import BasicSimulator from "./basicSimulator.js";
import { DANGER_COLOR, EPSILON } from "./constants.js";
import NFA from "./nfa.js";

export default class NFASimulator extends BasicSimulator {
  constructor(svgHandler, tape, onPauseCallback = () => {}) {
    super(svgHandler, tape, onPauseCallback);
    this.machine = new NFA();
  }

  convertToDFA() {
    if (!this.retrieveMachine()) {
      return;
    }
    const dfa = this.machine.generateDFA();
    this.svgHandler.drawDFA(dfa);
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
    let alertMessage = "";

    this.states.forEach((state, i) => {
      const transitionsFromState = transitions.filter(
        (transition) => transition.startControlPoint === state
      );

      alphabet.forEach((symbol) => {
        const transitionsOnSymbol = transitionsFromState.filter((transition) =>
          transition.getText().replaceAll(" ", "").split(",").includes(symbol)
        );
        this.machine.addTransition(
          i,
          symbol === "" ? null : symbol,
          transitionsOnSymbol.map((transition) =>
            this.states.indexOf(transition.endControlPoint)
          )
        );
      });

      // handling epsilon transitions
      const epsilonTransitions = transitionsFromState.filter(
        (transition) => transition.getText().replaceAll(" ", "") === EPSILON
      );
      if (epsilonTransitions.length > 0) {
        this.machine.addTransition(
          i,
          null,
          epsilonTransitions.map((transition) =>
            this.states.indexOf(transition.endControlPoint)
          )
        );
      }
    });

    //check if all the transition symbols belong to the alphabet
    transitions.forEach((transition) => {
      if (transition.startControlPoint === inputNode) {
        return;
      }
      const symbols = transition.getText().replaceAll(" ", "").split(",");
      symbols.forEach((symbol) => {
        if (!alphabet.includes(symbol) && symbol !== EPSILON) {
          symbolsNotInAlpha.add(symbol);
          this.svgHandler.highlightTransition(transition, DANGER_COLOR);
        }
      });
    });
    if (symbolsNotInAlpha.size > 0) {
      const symbolsNotInAlphaStr = Array.from(symbolsNotInAlpha).join(", ");
      alertMessage += `Transition symbols [${symbolsNotInAlphaStr}] are not in the alphabet. The erroneous transitions are highlighted in red.\n`;
    }

    if (alertMessage !== "") {
      alert(alertMessage);
      return false;
    }

    this.machine.finalStates = finalStates;
    console.log("NFA:", this.machine);
    return true;
  }

  next() {
    const input = this.getInput();
    if (!this.retrieveMachine()) {
      console.log("Error in retrieving NFA");
      this.resetSimulation();
      return;
    }
    if (this.inputIndex >= input.length) {
      this.checkSuccess();
      this.stopSimulation();
      console.log("No more input");
      return;
    }
    console.log("Input:", input);
    const nextSymbol = input[this.inputIndex];

    const currentStates = this.states.filter((state, i) =>
      this.machine.currentStates.includes(i)
    );

    this.machine.next(nextSymbol);

    const nextStates = this.states.filter((state, i) =>
      this.machine.currentStates.includes(i)
    );

    const nextTransitions = this.svgHandler.transitions.filter(
      (transition) =>
        currentStates.includes(transition.startControlPoint) &&
        nextStates.includes(transition.endControlPoint) &&
        (transition
          .getText()
          .replaceAll(" ", "")
          .split(",")
          .includes(nextSymbol) ||
          transition.getText().replaceAll(" ", "").split(",").includes(EPSILON))
    );

    if (nextTransitions === undefined) {
      console.log("No transitions found");
      this.resetSimulation();
      return;
    }

    let deadStates = new Set(currentStates);
    deadStates = deadStates.difference(new Set(nextStates));

    //rework the whole thing
    if (nextStates.length === 0) {
      this.highlightDeadStates(currentStates);
      this.machine.run(input.slice(0, this.inputIndex));
      this.stopSimulation();
      return;
    }

    this.svgHandler.highlightControlPoints([]);
    nextTransitions.forEach((transition) => {
      this.svgHandler.highlightTransition(transition);
    });
    this.isAnimating = true;
    setTimeout(() => {
      nextTransitions.forEach((transition) => {
        this.svgHandler.unHighlightTransition(transition);
      });
      this.inputIndex++;
      this.tape.moveTapeHead(1);
      this.checkSuccess();
      this.highlightDeadStates(deadStates);
      this.highlightCurrentStates();
      this.isAnimating = false;
      setTimeout(() => {
        if (this.isPlaying) {
          this.next();
        }
      }, this.getAnimDelay());
    }, this.getAnimDelay());
  }

  highlightDeadStates(deadStates) {
    this.svgHandler.setFailStates(deadStates);
  }

  checkSuccess() {
    const input = this.getInput();
    if (this.inputIndex >= input.length) {
      const currentStates = this.states.filter((state, i) =>
        this.machine.currentStates.includes(i)
      );
      const sucessStates = [];
      currentStates.forEach((currentState) => {
        if (currentState.isFinal()) {
          sucessStates.push(currentState);
        }
      });
      this.svgHandler.setSuccessStates(sucessStates);
    }
  }
}
