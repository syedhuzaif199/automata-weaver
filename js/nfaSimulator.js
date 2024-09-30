import { BasicSimulator } from "./basicSimulator.js";
import { DANGER_COLOR } from "./constants.js";
import { NFA } from "./nfa.js";

export class NFASimulationHandler extends BasicSimulator {
  constructor(svgHandler, onPauseCallback = () => {}) {
    super(svgHandler, onPauseCallback);
    this.machine = new NFA();
  }

  retrieveMachine() {
    super.retrieveMachine();

    // add transitions
    let symbolsNotInAlpha = new Set();
    let alertMessage = "";

    this.states.forEach((state, i) => {
      const transitionsFromState = this.svgHandler.transitions.filter(
        (transition) => transition.startControlPoint === state
      );

      this.alphabet.forEach((symbol) => {
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
        (transition) => transition.getText().replaceAll(" ", "") === ""
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

    this.svgHandler.transitions.forEach((transition) => {
      if (transition.startControlPoint === this.inputNode) {
        return;
      }
      const symbols = transition.getText().replaceAll(" ", "").split(",");
      symbols.forEach((symbol) => {
        if (!this.alphabet.includes(symbol) && symbol !== "") {
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
      return;
    }

    this.machine.finalStates = this.finalStates;
    console.log("NFA:", this.machine);
    return true;
  }

  convertToDFA() {
    this.retrieveMachine();
    const dfa = this.machine.generateDFA();
    this.svgHandler.drawDFA(dfa);
  }

  retrieveMachine() {
    console.log("Retrieving NFA");
    this.machine.transitions = {};
    const controlPoints = this.svgHandler.controlPoints;
    const transitions = this.svgHandler.transitions;

    const numStates = controlPoints.length - 1;
    this.machine.numStates = numStates;
    const alphabet = this.alphabetTextField.value.split(" ");
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
        (transition) => transition.getText().replaceAll(" ", "") === ""
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

    // transitions.forEach((transition) => {
    //   if (transition.startControlPoint === inputNode) {
    //     return;
    //   }

    //   const originState = this.states.find(
    //     (state) => state === transition.startControlPoint
    //   );

    //   const endState = this.states.find(
    //     (state) => state === transition.endControlPoint
    //   );

    //   const symbols = transition.getText().replaceAll(" ", "").split(",");

    //   symbols.forEach((symbol) => {
    //     if (!alphabet.includes(symbol)) {
    //       symbolsNotInAlpha.add(symbol);
    //       this.svgHandler.highlightTransition(transition, DANGER_COLOR);
    //       return;
    //     }
    //     if (
    //       this.nfa.transitions[[this.states.indexOf(originState), symbol]] !==
    //       undefined
    //     ) {
    //       // ?
    //     }
    //     this.nfa.addTransition(
    //       this.states.indexOf(originState),
    //       symbol,
    //       this.states.indexOf(endState)
    //     );
    //   });
    // });

    transitions.forEach((transition) => {
      if (transition.startControlPoint === inputNode) {
        return;
      }
      const symbols = transition.getText().replaceAll(" ", "").split(",");
      symbols.forEach((symbol) => {
        if (!alphabet.includes(symbol) && symbol !== "") {
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
      return;
    }

    this.machine.finalStates = finalStates;
    console.log("NFA:", this.machine);
    return true;
  }

  next() {
    const input = this.getInput();
    if (this.inputIndex >= input.length) {
      console.log("No more input");
      this.isPlaying = false;
      this.svgHandler.isEditingDisabled = false;
      this.onPauseCallback();
      return;
    }
    if (!this.retrieveMachine()) {
      console.log("Error in retrieving NFA");
      this.isPlaying = false;
      this.onPauseCallback();
      this.resetSimulation();
      return;
    }
    console.log("Input:", input);
    const nextSymbol = input[this.inputIndex];
    let nextStateNumbers = new Set();
    this.machine.currentStates.forEach((currentState) => {
      const nextStates = this.machine.transitions[[currentState, nextSymbol]];
      if (nextStates !== undefined) {
        nextStates.forEach((nextState) => {
          nextStateNumbers.add(nextState);
        });
      }
    });
    nextStateNumbers = Array.from(nextStateNumbers);
    const currentStates = this.states.filter((state, i) =>
      this.machine.currentStates.includes(i)
    );
    const nextStates = nextStateNumbers.map(
      (nextState) => this.states[nextState]
    );
    console.log("CurrentStateNumbers:", this.machine.currentStates);
    console.log("NextStateNumbers:", nextStateNumbers);
    const nextTransitions = this.svgHandler.transitions.filter(
      (transition) =>
        currentStates.includes(transition.startControlPoint) &&
        nextStates.includes(transition.endControlPoint)
    );
    if (nextTransitions === undefined) {
      console.log("No transitions found");
      this.isPlaying = false;
      this.onPauseCallback();
      this.resetSimulation();
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

  checkSuccess() {
    const input = this.getInput();
    if (this.inputIndex >= input.length) {
      const currentStates = this.states.filter((state, i) =>
        this.machine.currentStates.includes(i)
      );
      const sucessStates = [];
      const failStates = [];
      currentStates.forEach((currentState) => {
        if (currentState.isFinal()) {
          sucessStates.push(currentState);
        } else {
          failStates.push(currentState);
        }
      });
      this.svgHandler.setFailStates(failStates);
      this.svgHandler.setSuccessStates(sucessStates);
    }
  }
}
