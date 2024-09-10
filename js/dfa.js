export class FiniteAutomaton {
  constructor(numStates, alphabet, finalStates = []) {
    this.numStates = numStates;
    this.alphabet = alphabet; //string or list of strings
    this.finalStates = finalStates;
    this.states = [];
    this.transitions = {};
    this.currentState = 0;
  }

  addFinalStates(states) {
    this.finalStates = states;
  }

  addTransition(originState, endState, symbol) {
    this.transitions[[originState, symbol]] = endState;
  }

  addTransitions(transitions) {
    for (let transition of transitions) {
      this.addTransition(transition[0], transition[1], transition[2]);
    }
  }
}

export class DFA extends FiniteAutomaton {
  constructor(numStates, alphabet, finalStates = []) {
    super(numStates, alphabet, finalStates);
  }

  //TODO: getMinimized() {}

  next(inString) {
    for (let i = 0; i < inString.length; i++) {
      const symbol = inString[i];
      if ([this.currentState, symbol] in this.transitions) {
        this.currentState = this.transitions[[this.currentState, symbol]];
      } else {
        return -1;
      }
    }

    return this.currentState;
  }

  run(inString) {
    this.currentState = 0;
    let endState = this.next(inString);
    if (this.finalStates.includes(endState)) {
      return true;
    } else {
      return false;
    }
  }

  reset() {
    this.currentState = 0;
  }
}
