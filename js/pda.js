export default class PDA {
  constructor(numStates, alphabet, stackAlphabet, finalStates = []) {
    this.numStates = numStates;
    this.alphabet = alphabet;
    this.stackAlphabet = stackAlphabet;
    this.finalStates = finalStates;
    this.transitions = {};
    this.currentState = 0;
    this.stack = [];
  }

  addFinalStates(states) {
    this.finalStates = states;
  }

  addTransition(
    originState,
    symbol,
    stackSymbol,
    endState,
    stackSymbolsToPush
  ) {
    this.transitions[[originState, symbol, stackSymbol]] = [
      endState,
      stackSymbolsToPush,
    ];
  }

  addTransitions(transitions) {
    for (let transition of transitions) {
      this.addTransition(...transition);
    }
  }

  next(symbol, stackSymbol) {
    console.log("Symbol:", symbol);
    const transition =
      this.transitions[[this.currentState, symbol, stackSymbol]];
    if (transition === undefined) {
      return null;
    }
    this.currentState = transition[0];

    const reversedStackSymbols = [...transition[1]].reverse();
    return reversedStackSymbols;
  }

  run(input) {
    throw new Error("Method not implemented.");
  }

  reset() {
    this.currentState = 0;
    this.stack = [];
  }
}
