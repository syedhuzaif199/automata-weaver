import { SUBSCRIPT_ZERO_CODE } from "./constants.js";

export default class TM {
  constructor(numStates, alphabet, tapeAlphabet, blank, finalStates = []) {
    this.numStates = numStates;
    this.alphabet = alphabet;
    this.tapeAlphabet = tapeAlphabet;
    this.finalStates = finalStates;
    this.transitions = {};
    this.currentState = 0;
    this.blank = blank;
  }

  addFinalStates(states) {
    this.finalStates = states;
  }

  addTransition(originState, symbol, endState, writeSymbol, move) {
    this.transitions[[originState, symbol]] = [endState, writeSymbol, move];
  }

  addTransitions(transitions) {
    for (let transition of transitions) {
      this.addTransition(...transition);
    }
  }

  // returns true if the machine hasn't halted, else returns false
  next(symbol) {
    if (this.transitions[[this.currentState, symbol]] === undefined) {
      console.log(
        "No transition found for state",
        this.currentState,
        "and symbol",
        symbol
      );
      return false;
    }

    const [endState, writeSymbol, move] =
      this.transitions[[this.currentState, symbol]];
    this.currentState = endState;
    if (this.finalStates.includes(this.currentState)) {
      return false;
    }
    return true;
  }

  reset() {
    this.currentState = 0;
  }
}
