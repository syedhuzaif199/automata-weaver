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
    this.tape = [];
    this.tapeHead = 0;
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

  writeInput(input) {
    this.tape = [...input];
  }

  next() {
    const symbol = this.tape[this.tapeHead];
    let id = "";
    for (let i = 0; i < this.tape.length; i++) {
      if (i == this.tapeHead) {
        id += `q${String.fromCharCode(
          SUBSCRIPT_ZERO_CODE + this.currentState
        )}`;
      }
      id += this.tape[i];
    }
    console.log("ID: ", id);
    if (this.transitions[[this.currentState, symbol]] === undefined) {
      console.log(
        "No transition found for state",
        this.currentState,
        "and symbol",
        symbol
      );
      console.log("Tape: ", this.tape);
      console.log("TapeHead: ", this.tapeHead);
      return false;
    }

    const [endState, writeSymbol, move] =
      this.transitions[[this.currentState, symbol]];
    // console.log("Tape:", this.tape);
    // console.log("TapeHead:", this.tapeHead);
    // console.log("Next state: ", endState);
    this.currentState = endState;
    this.tape[this.tapeHead] = writeSymbol;
    if (this.tapeHead + move < 0) {
      this.tape.unshift(this.blank);
    } else {
      this.tapeHead += move;
    }
    if (this.tapeHead == this.tape.length) {
      this.tape.push(this.blank);
    }
    if (this.finalStates.includes(this.currentState)) {
      return false;
    }
    return true;
  }

  run() {
    this.currentState = 0;
    while (this.next()) {}
    if (this.finalStates.includes(this.currentState)) {
      return true;
    } else {
      return false;
    }
  }

  reset() {
    this.currentState = 0;
    this.tape = [];
    this.tapeHead = 0;
  }
}
