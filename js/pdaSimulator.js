import BasicSimulator from "./basicSimulator.js";
import { DANGER_COLOR, EPSILON } from "./constants.js";
import PDA from "./pda.js";
import { lettersFromRange } from "./utils.js";

export default class PDASimulator extends BasicSimulator {
  constructor(svgHandler, tape, stack, onNotPlayingCallback = () => {}) {
    super(svgHandler, tape, onNotPlayingCallback);
    this.stackAlphabetTextField = document.querySelector(
      "#stack-alphabet-text"
    );
    this.machine = new PDA();
    this.stack = stack;
    this.previousStates = [];
    this.stack.removeAll();
    this.resetSimulation();
  }

  retrieveMachine() {
    super.retrieveMachine();
    const alphabet = this.getAlphabet();
    const stackAlphabet = this.getStackAlphabet();
    const inputNode = this.svgHandler.inputNode;
    console.log("Retrieve machine called");

    this.machine.alphabet = alphabet;
    this.machine.stackAlphabet = stackAlphabet;

    // add transitions
    let inputsNotInAlpha = new Set();
    let popsNotInStackAlpha = new Set();
    let pushesNotInStackAlpha = new Set();
    let multipleTransitions = new Set();

    let alertMessage = "";

    this.transitions.forEach((transition) => {
      if (transition.startControlPoint === inputNode) {
        return;
      }

      const originState = this.states.find(
        (state) => state === transition.startControlPoint
      );

      const endState = this.states.find(
        (state) => state === transition.endControlPoint
      );

      const symbolSets = transition.getText();
      console.log("Received symbol sets:", symbolSets);

      symbolSets.forEach((symbolSet) => {
        const [symbol, stackSymbol, stackSymbolsToPush] = symbolSet.split(",");
        console.log("Symbol set:", symbolSet);

        if (!alphabet.includes(symbol) && symbol !== EPSILON) {
          inputsNotInAlpha.add(symbol);
          this.svgHandler.highlightTransition(transition, DANGER_COLOR);
          return;
        }

        if (!stackAlphabet.includes(stackSymbol) && stackSymbol !== EPSILON) {
          popsNotInStackAlpha.add(stackSymbol);
          this.svgHandler.highlightTransition(transition, DANGER_COLOR);
          return;
        }

        stackSymbolsToPush.split("").forEach((s) => {
          if (!stackAlphabet.includes(s) && s !== EPSILON) {
            pushesNotInStackAlpha.add(s);
            this.svgHandler.highlightTransition(transition, DANGER_COLOR);
            return;
          }
        });

        if (
          this.machine.transitions[
            [
              this.states.indexOf(originState),
              symbol === EPSILON ? null : symbol,
              stackSymbol === EPSILON ? null : stackSymbol,
            ]
          ] !== undefined
        ) {
          multipleTransitions.add([originState, symbol, stackSymbol]);
          this.svgHandler.highlightTransition(transition, DANGER_COLOR);
        }
        this.machine.addTransition(
          this.states.indexOf(originState),
          symbol === EPSILON ? null : symbol,
          stackSymbol === EPSILON ? null : stackSymbol,
          this.states.indexOf(endState),
          stackSymbolsToPush === EPSILON ? [] : Array.from(stackSymbolsToPush)
        );
      });
    });

    if (inputsNotInAlpha.size > 0) {
      const symbolsNotInAlphaStr = Array.from(inputsNotInAlpha).join(", ");
      alertMessage += `Transition symbols [${symbolsNotInAlphaStr}] are not in the alphabet. The erroneous transitions are highlighted in red.\n`;
    }

    if (popsNotInStackAlpha.size > 0) {
      const symbolsNotInStackAlphaStr =
        Array.from(popsNotInStackAlpha).join(", ");
      alertMessage += `Stack symbols [${symbolsNotInStackAlphaStr}] are not in the stack alphabet. The erroneous transitions are highlighted in red.\n`;
    }

    if (pushesNotInStackAlpha.size > 0) {
      const symbolsNotInStackAlphaStr = Array.from(pushesNotInStackAlpha).join(
        ", "
      );
      alertMessage += `Stack symbols [${symbolsNotInStackAlphaStr}] to push are not in the stack alphabet. The erroneous transitions are highlighted in red.\n`;
    }

    if (multipleTransitions.size > 0) {
      const multipleTransitionsStr = Array.from(multipleTransitions)
        .map(
          ([state, symbol, stackSymbol]) =>
            `${
              state.getText() === ""
                ? "(Unnamed state)"
                : "State " + state.getText()
            } on input symbol ${symbol} and stack symbol ${stackSymbol}\n`
        )
        .join("");
      alertMessage += `Multiple transitions for the following state-inputSymbol-stackSymbol triples:\n${multipleTransitionsStr}\n`;
    }

    const mixedTransitions = new Set();
    this.transitions.forEach((transition) => {
      const originState = transition.startControlPoint;
      const symbolSets = transition.getText();
      symbolSets.forEach((symbolSet) => {
        const [symbol, stackSymbol, stackSymbolsToPush] = symbolSet.split(",");

        if (symbol === EPSILON) {
          let found = this.transitions.find((t) => {
            return (
              t.startControlPoint === originState &&
              t.getText().some((s) => {
                const [a, b, c] = s.split(",");
                return (
                  (a !== EPSILON && b === stackSymbol) ||
                  (a !== EPSILON &&
                    ((b === EPSILON && stackSymbol !== EPSILON) ||
                      (b !== EPSILON && stackSymbol === EPSILON)))
                );
              })
            );
          });
          if (found) {
            mixedTransitions.add([originState, symbol, stackSymbol]);
            this.svgHandler.highlightTransition(transition, DANGER_COLOR);
          }
          found = this.transitions.find((t) => {
            return (
              t.startControlPoint === originState &&
              t.getText().some((s) => {
                const [a, b, c] = s.split(",");
                return (
                  a === EPSILON &&
                  ((b === EPSILON && stackSymbol !== EPSILON) ||
                    (b !== EPSILON && stackSymbol === EPSILON))
                );
              })
            );
          });
          if (found) {
            mixedTransitions.add([originState, symbol, stackSymbol]);
            this.svgHandler.highlightTransition(transition, DANGER_COLOR);
          }
        } else {
          let found = this.transitions.find((t) => {
            return (
              t.startControlPoint === originState &&
              t.getText().some((s) => {
                const [a, b, c] = s.split(",");
                return (
                  (a === EPSILON && b === stackSymbol) ||
                  (a === EPSILON &&
                    ((b === EPSILON && stackSymbol !== EPSILON) ||
                      (b !== EPSILON && stackSymbol === EPSILON)))
                );
              })
            );
          });
          if (found) {
            mixedTransitions.add([originState, symbol, stackSymbol]);
            this.svgHandler.highlightTransition(transition, DANGER_COLOR);
          }
          found = this.transitions.find((t) => {
            return (
              t.startControlPoint === originState &&
              t.getText().some((s) => {
                const [a, b, c] = s.split(",");
                return (
                  a !== EPSILON &&
                  ((b === EPSILON && stackSymbol !== EPSILON) ||
                    (b !== EPSILON && stackSymbol === EPSILON))
                );
              })
            );
          });
          if (found) {
            mixedTransitions.add([originState, symbol, stackSymbol]);
            this.svgHandler.highlightTransition(transition, DANGER_COLOR);
          }
        }
      });
    });

    if (mixedTransitions.size > 0) {
      const mixedTransitionsStr = Array.from(mixedTransitions)
        .map(
          ([state, symbol, stackSymbol]) =>
            `${
              state.getText() === ""
                ? "(Unnamed state)"
                : "State " + state.getText()
            } on input symbol ${symbol} and stack symbol ${stackSymbol}\n`
        )
        .join("");
      alertMessage += `Mixed transitions found for the following state-inputSymbol-stackSymbol triples:\n${mixedTransitionsStr}.\n`;
    }

    if (alertMessage !== "") {
      alertPopup(alertMessage);
      return false;
    }

    this.machine.finalStates = this.finalStates;
    return true;
  }

  next() {
    console.log("Machine:", this.machine);
    let nextSymbol = this.tape.getSymbolAtHead();
    const machineTransition =
      this.machine.transitions[
        [this.machine.currentState, nextSymbol, this.stack.peek()]
      ];
    if (machineTransition === undefined) {
      if (
        this.machine.transitions[
          [this.machine.currentState, null, this.stack.peek()]
        ] === undefined
      ) {
        console.log("No transition found");
        return Promise.resolve(true);
      } else {
        nextSymbol = null;
      }
    }

    const currentState = this.states.find(
      (state, i) => i === this.machine.currentState
    );
    console.log("Current state number:", this.machine.currentState);

    const stackSymbol = this.stack.peek() === null ? null : this.stack.pop();
    console.log("Stack symbol:", stackSymbol);

    const prevSimState = {
      state: this.machine.currentState,
      toPush: stackSymbol === null ? [] : [stackSymbol],
      headIndex: this.tape.headIndex,
    };
    const symbolsToPush = this.machine.next(nextSymbol, stackSymbol);
    console.log("Symbols to push:", symbolsToPush);

    prevSimState.popLength = symbolsToPush.length;

    const nextState = this.states.find(
      (state, i) => i === this.machine.currentState
    );
    console.log("Next state number:", this.machine.currentState);
    const transition = this.transitions.find(
      (transition) =>
        transition.startControlPoint === currentState &&
        transition.endControlPoint === nextState
    );

    if (transition === undefined) {
      console.error("No transition found");
      return Promise.reject();
    }
    this.svgHandler.highlightTransition(transition);
    return new Promise((resolve) => {
      setTimeout(() => {
        this.svgHandler.unHighlightTransition(transition);
        if (nextSymbol !== null) {
          this.tape.moveTape(-1);
        }
        this.stack.push(symbolsToPush);
        this.previousStates.push(prevSimState);
        this.highlightCurrentStates();
        resolve(false);
      }, this.getAnimDelay());
    });
  }

  getStackAlphabet() {
    const stackAlphabet = this.stackAlphabetTextField.value.split(" ");
    console.log("Stack alphabet before regex resolution/:", stackAlphabet);
    const resolvedAlphabet = stackAlphabet.map((symbol) => {
      const letters = lettersFromRange(symbol);
      if (letters) {
        return letters;
      } else {
        return symbol;
      }
    });
    console.log("Stack alphabet after regex resolution:", resolvedAlphabet);
    return resolvedAlphabet;
  }

  resetSimulation() {
    super.resetSimulation();
    this.stack.removeAll();
    this.previousStates = [];
  }

  highlightCurrentStates() {
    this.svgHandler.highlightControlPoints(
      this.states.filter((state, i) => i === this.machine.currentState)
    );
  }

  previous() {
    if (this.previousStates.length === 0) {
      return;
    }
    const prevSimState = this.previousStates.pop();
    this.machine.currentState = prevSimState.state;
    for (let i = 0; i < prevSimState.popLength; i++) {
      this.stack.pop();
    }
    this.stack.push(prevSimState.toPush);
    if (this.tape.headIndex === prevSimState.headIndex + 1) {
      this.tape.moveTape(1);
    }
    this.highlightCurrentStates();
    return Promise.resolve(false);
  }

  runMachine() {
    this.machine.currentState = 0;
    this.stack.removeAll();
    this.previousStates = [];
    while (true) {
      let nextSymbol = this.tape.getSymbolAtHead();
      const machineTransition =
        this.machine.transitions[
          [this.machine.currentState, nextSymbol, this.stack.peek()]
        ];
      if (machineTransition === undefined) {
        if (
          this.machine.transitions[
            [this.machine.currentState, null, this.stack.peek()]
          ] === undefined
        ) {
          console.error("No transition found");
          break;
        } else {
          nextSymbol = null;
        }
      }

      const currentState = this.states.find(
        (state, i) => i === this.machine.currentState
      );
      console.log("Current state number:", this.machine.currentState);

      const stackSymbol = this.stack.peek() === null ? null : this.stack.pop();
      console.log("Stack symbol:", stackSymbol);

      const prevSimState = {
        state: this.machine.currentState,
        toPush: stackSymbol === null ? [] : [stackSymbol],
        headIndex: this.tape.headIndex,
      };
      const symbolsToPush = this.machine.next(nextSymbol, stackSymbol);
      console.log("Symbols to push:", symbolsToPush);

      prevSimState.popLength = symbolsToPush.length;

      const nextState = this.states.find(
        (state, i) => i === this.machine.currentState
      );
      console.log("Next state number:", this.machine.currentState);
      const transition = this.transitions.find(
        (transition) =>
          transition.startControlPoint === currentState &&
          transition.endControlPoint === nextState
      );

      if (transition === undefined) {
        console.error("No transition found");
        break;
      }

      if (nextSymbol !== null) {
        this.tape.moveTape(-1);
      }
      this.stack.push(symbolsToPush);
      this.previousStates.push(prevSimState);
      this.highlightCurrentStates();
    }
  }

  checkSuccess() {
    if (this.machine.finalStates.includes(this.machine.currentState)) {
      this.svgHandler.setSuccessStates(
        this.states.filter((state, i) => i === this.machine.currentState)
      );
    } else {
      this.svgHandler.setFailStates(
        this.states.filter((state, i) => i === this.machine.currentState)
      );
    }
  }
}
