import { DFA } from "./dfa.js";

export class NFA {
  constructor(numStates, alphabet = [], finalStates = []) {
    this.numStates = numStates;
    this.alphabet = alphabet; //string or list of strings
    this.finalStates = finalStates;
    this.states = [];
    this.transitions = {};
    this.currentStates = [0];
    this.alphabet.push(null);
  }

  addFinalStates(states) {
    this.finalStates = states;
  }

  addAlphabet(alphabet) {
    this.alphabet = alphabet;
    this.alphabet.push(null);
  }

  addTransition(originState, symbol, endStates) {
    this.transitions[[originState, symbol]] = endStates;
  }

  addTransitions(transitions) {
    for (let transition of transitions) {
      this.addTransition(transition[0], transition[1], transition[2]);
    }
  }

  nullClosure(states) {
    let stack = [...states];
    let closure = new Set(states);
    while (stack.length > 0) {
      let currentState = stack.pop();
      if ([currentState, null] in this.transitions) {
        this.transitions[[currentState, null]].forEach((state) => {
          if (!closure.has(state)) {
            closure.add(state);
            stack.push(state);
          }
        });
      }
    }
    return Array.from(closure);
  }

  move(states, symbol) {
    let moveStates = new Set();
    for (let state of states) {
      if ([state, symbol] in this.transitions) {
        this.transitions[[state, symbol]].forEach((s) => {
          moveStates.add(s);
        });
      }
    }
    return Array.from(moveStates);
  }

  generateDFA() {
    const dfaAlphabet = this.alphabet.filter((symbol) => symbol !== null);
    const dfaStates = [];
    dfaStates.push(this.nullClosure([0]));
    const dfaTransitions = {};

    function compareArrays(arr1, arr2) {
      return JSON.stringify(arr1.sort()) === JSON.stringify(arr2.sort());
    }

    function getIndex(arr, ele) {
      for (let i = 0; i < arr.length; i++) {
        if (compareArrays(arr[i], ele)) {
          return i;
        }
      }
      return -1;
    }

    for (let dfaState of dfaStates) {
      for (let symbol of dfaAlphabet) {
        const newDfaState = this.nullClosure(this.move(dfaState, symbol));
        if (getIndex(dfaStates, newDfaState) === -1) {
          console.log("New DFA State:", newDfaState);
          dfaStates.push(newDfaState);
          console.log("DFA States:", dfaStates);
        }
        dfaTransitions[[getIndex(dfaStates, dfaState), symbol]] = getIndex(
          dfaStates,
          newDfaState
        );
      }
    }

    const dfaFinalStates = [];
    dfaStates.forEach((state, i) => {
      if (state.some((subState) => this.finalStates.includes(subState))) {
        dfaFinalStates.push(i);
      }
    });

    let dfa = new DFA(dfaStates.length, dfaAlphabet, dfaFinalStates);
    dfa.transitions = dfaTransitions;
    return dfa;
  }

  next(symbol) {
    if (this.currentStates.length === 1 && this.currentStates[0] === 0) {
      //reset the value of current states to the null closure of initial state
      this.currentStates = this.nullClosure(this.currentStates);
    }
    this.currentStates = this.move(this.currentStates, symbol);
    this.currentStates = this.nullClosure(this.currentStates);
  }

  run(input) {
    this.currentStates = [0];
    for (let inSymbol of input) {
      this.next(inSymbol);
    }
    return this.currentStates.some((state) => this.finalStates.includes(state));
  }

  reset() {
    this.currentStates = [0];
  }
}
