import BasicSimulator from "./basicSimulator.js";
import { DANGER_COLOR, EPSILON } from "./constants.js";
import NFA from "./nfa.js";

export default class NFASimulator extends BasicSimulator {
  constructor(svgHandler, tape, onNotPlayingCallback = () => {}) {
    super(svgHandler, tape, onNotPlayingCallback);
    this.machine = new NFA();
    this.resetSimulation();
  }

  convertToDFA() {
    if (!this.retrieveMachine()) {
      return;
    }
    console.log("Converting to DFA:", this.machine);
    const dfa = this.machine.generateDFA();
    console.log("DFA:", dfa);
    this.svgHandler.drawDFA(dfa);
  }

  retrieveMachine() {
    super.retrieveMachine();
    const alphabet = this.getAlphabet();
    const inputNode = this.svgHandler.inputNode;

    // add transitions
    let symbolsNotInAlpha = new Set();
    let alertMessage = "";

    this.states.forEach((state, i) => {
      const transitionsFromState = this.transitions.filter(
        (transition) => transition.startControlPoint === state
      );

      alphabet.forEach((symbol) => {
        const transitionsOnSymbol = transitionsFromState.filter((transition) =>
          transition
            .getText()[0]
            .replaceAll(" ", "")
            .split(",")
            .includes(symbol)
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
      const epsilonTransitions = transitionsFromState.filter((transition) =>
        transition.getText()[0].replaceAll(" ", "").includes(EPSILON)
      );
      if (epsilonTransitions.length > 0) {
        console.log("Epsilon transitions:", epsilonTransitions);
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
    this.transitions.forEach((transition) => {
      if (transition.startControlPoint === inputNode) {
        return;
      }
      const symbols = transition.getText()[0].replaceAll(" ", "").split(",");
      console.log("Received symbols:", symbols);
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

    this.machine.finalStates = this.finalStates;
    console.log("NFA:", this.machine);
    return true;
  }

  next() {
    const nextSymbol = this.tape.getSymbolAtHead();
    console.log("Next symbol:", nextSymbol);

    if (nextSymbol === this.tape.blank) {
      return Promise.resolve(true);
    }

    const currentStates = this.states.filter((state, i) =>
      this.machine.nullClosure(this.machine.currentStates).includes(i)
    );

    console.log("Current states:", currentStates);

    const isNext = this.machine.move(
      this.machine.nullClosure(this.machine.currentStates, nextSymbol)
    );
    if (isNext.length === 0) {
      console.log(this.machine);
      console.log("No next states found");
      return Promise.resolve(true);
    }

    this.machine.next(nextSymbol);

    const nextStates = this.states.filter((state, i) =>
      this.machine.currentStates.includes(i)
    );

    console.log("Next states:", nextStates);
    const nextTransitions = this.svgHandler.transitions.filter(
      (transition) =>
        currentStates.includes(transition.startControlPoint) &&
        nextStates.includes(transition.endControlPoint) &&
        (transition
          .getText()[0]
          .replaceAll(" ", "")
          .split(",")
          .includes(nextSymbol) ||
          transition
            .getText()[0]
            .replaceAll(" ", "")
            .split(",")
            .includes(EPSILON))
    );

    console.log("Next transitions:", nextTransitions);

    if (nextTransitions === undefined) {
      console.log("No transitions found");
      return Promise.reject();
    }

    //rework the whole dead state highlighting logic

    // let deadStates = new Set(currentStates);
    // deadStates = deadStates.difference(new Set(nextStates));

    // if (nextStates.length === 0) {
    //   this.highlightDeadStates(currentStates);
    //   this.machine.run(input.slice(0, this.inputIndex));
    //   return Promise.resolve(true);
    // }

    this.svgHandler.highlightControlPoints([]);
    nextTransitions.forEach((transition) => {
      this.svgHandler.highlightTransition(transition);
    });

    return new Promise((resolve) => {
      setTimeout(() => {
        nextTransitions.forEach((transition) => {
          this.svgHandler.unHighlightTransition(transition);
        });
        this.inputIndex++;
        this.tape.moveTape(-1);
        // this.highlightDeadStates(deadStates);
        this.highlightCurrentStates();
        if (this.tape.getSymbolAtHead() === this.tape.blank) {
          resolve(true);
        } else {
          resolve(false);
        }
      }, this.getAnimDelay());
    });
  }

  highlightCurrentStates() {
    const currentStates = this.states.filter((state, i) =>
      this.machine.nullClosure(this.machine.currentStates).includes(i)
    );
    this.svgHandler.highlightControlPoints(currentStates);
  }

  checkSuccess() {
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
    this.svgHandler.setSuccessStates(sucessStates);
    this.svgHandler.setFailStates(failStates);
  }
}
