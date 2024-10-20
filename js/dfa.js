export default class DFA {
  constructor(numStates, alphabet, finalStates = []) {
    this.numStates = numStates;
    this.alphabet = alphabet;
    this.finalStates = finalStates;
    this.states = [];
    this.transitions = {};
    this.currentState = 0;
  }

  addFinalStates(states) {
    this.finalStates = states;
  }

  addTransition(originState, symbol, endState) {
    this.transitions[[originState, symbol]] = endState;
  }

  addTransitions(transitions) {
    for (let transition of transitions) {
      this.addTransition(transition[0], transition[1], transition[2]);
    }
  }

  enumerateAccStates(state, accessibleStates) {
    if (accessibleStates.includes(state)) {
      return;
    }
    accessibleStates.push(state);
    for (let symbol of this.alphabet) {
      this.enumerateAccStates(
        this.transitions[[state, symbol]],
        accessibleStates
      );
    }
  }

  getMinimized() {
    let accessibleStates = [];

    this.enumerateAccStates(0, accessibleStates);
    let finalStates = this.finalStates.filter((state) =>
      accessibleStates.includes(state)
    );

    let distinguisherTable = [];
    for (let i = 0; i < this.numStates; i++) {
      distinguisherTable.push([]);
      for (let j = i + 1; j < this.numStates; j++) {
        distinguisherTable[i].push(false);
      }
    }

    finalStates.forEach((state) => {
      accessibleStates.forEach((accState) => {
        if (finalStates.includes(accState)) {
          return;
        }
        distinguisherTable[state][accState] = distinguisherTable[accState][
          state
        ] = true;
      });
    });

    while (true) {
      let terminate = true;
      for (let i = 0; i < accessibleStates.length - 1; i++) {
        for (let j = i + 1; j < accessibleStates.length; j++) {
          const a = accessibleStates[i];
          const b = accessibleStates[j];
          if (distinguisherTable[a][b]) {
            continue;
          }
          for (let symbol of this.alphabet) {
            let nextState1 = this.transitions[[a, symbol]];
            let nextState2 = this.transitions[[b, symbol]];
            if (distinguisherTable[nextState1][nextState2]) {
              distinguisherTable[a][b] = distinguisherTable[b][a] = true;
              terminate = false;
            }
          }
        }
      }
      if (terminate) {
        break;
      }
    }

    let eq_classes = accessibleStates.map((state) => [state]);
    console.log("Eq class before:\n", eq_classes);
    for (let i = 0; i < accessibleStates.length - 1; i++) {
      for (let j = i + 1; j < accessibleStates.length; j++) {
        const a = accessibleStates[i];
        const b = accessibleStates[j];
        if (!distinguisherTable[a][b] && a !== b) {
          eq_classes.forEach((ele, idx) => {
            if (ele.includes(b) && ele.length === 1) {
              eq_classes.splice(idx, 1);
              console.log("Removed:", [b]);
            }
          });
          let tempIdx = 0;

          for (let idx = 0; i < eq_classes.length; i++) {
            const eq_class = eq_classes[i];
            if (eq_class.includes(a)) {
              tempIdx = idx;
              break;
            }
          }
          eq_classes[tempIdx].push(b);
        }
      }
    }

    console.log("Eq classes:", eq_classes);
    let transitions = {};
    let initialState = null;
    eq_classes.forEach((eq_class, i) => {
      if (eq_class.includes(0)) {
        initialState = i;
      }
    });

    if (initialState === null) {
      console.error("Initial state is null");
    }

    let indexes = [];
    for (let i = 0; i < eq_classes.length; i++) {
      indexes.push((i - initialState) % eq_classes.length);
    }

    console.log("Accessible states:", accessibleStates);
    for (let key in this.transitions) {
      let [state, symbol] = key.split(",");
      state = parseInt(state);
      const trans = this.transitions[key];

      if (!accessibleStates.includes(state)) {
        continue;
      }
      let originState = null;
      let endState = null;
      for (let i = 0; i < eq_classes.length; i++) {
        if (eq_classes[i].includes(state)) {
          originState = indexes[i];
        }
        if (eq_classes[i].includes(trans)) {
          endState = indexes[i];
        }
      }

      if (originState === null || endState === null) {
        console.error("Origin or end state is null");
      }

      console.log("Origin state:", originState);
      console.log("Symbol:", symbol);
      console.log("End state:", endState);
      transitions[[originState, symbol]] = endState;
    }

    finalStates = [];
    for (let i = 0; i < eq_classes.length; i++) {
      const isFinal = this.finalStates.find((state) =>
        eq_classes[i].includes(state)
      );

      if (isFinal !== undefined) {
        console.log("Pushed final state", indexes[i]);
        finalStates.push(indexes[i]);
      }
    }

    const minimizedDFA = new DFA(
      eq_classes.length,
      [...this.alphabet],
      finalStates
    );
    minimizedDFA.transitions = transitions;
    return minimizedDFA;
  }

  next(symbol) {
    if ([this.currentState, symbol] in this.transitions) {
      this.currentState = this.transitions[[this.currentState, symbol]];
    } else {
      return -1;
    }

    return this.currentState;
  }

  run(input) {
    this.currentState = 0;
    for (let inSymbol of input) {
      this.currentState = this.next(inSymbol);
    }
    if (this.finalStates.includes(this.currentState)) {
      return true;
    } else {
      return false;
    }
  }

  reset() {
    this.currentState = 0;
  }
}
