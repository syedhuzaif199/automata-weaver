import { alertPopup } from "./AlertPopup.js";
import BasicSimulator from "./basicSimulator.js";
import { DANGER_COLOR } from "./constants.js";
import DFA from "./dfa.js";

export default class DFASimulator extends BasicSimulator {
  constructor(svgHandler, tape, onNotPlayingCallback = () => {}) {
    super(svgHandler, tape, onNotPlayingCallback);
    this.machine = new DFA();
    this.resetSimulation();
  }
  retrieveMachine() {
    super.retrieveMachine();

    const inputNode = this.svgHandler.inputNode;
    const alphabet = this.getAlphabet();
    // add transitions
    let symbolsNotInAlpha = new Set();
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

      const symbols = transition.getText()[0].replace(" ", "").split(",");
      console.log("Received symbols:", symbols);

      symbols.forEach((symbol) => {
        if (!alphabet.includes(symbol)) {
          symbolsNotInAlpha.add(symbol);
          this.svgHandler.highlightTransition(transition, DANGER_COLOR);
          return;
        }
        if (
          this.machine.transitions[
            [this.states.indexOf(originState), symbol]
          ] !== undefined
        ) {
          multipleTransitions.add([originState, symbol]);
          this.svgHandler.highlightTransition(transition, DANGER_COLOR);
        }
        this.machine.addTransition(
          this.states.indexOf(originState),
          symbol,
          this.states.indexOf(endState)
        );
      });
    });

    if (symbolsNotInAlpha.size > 0) {
      const symbolsNotInAlphaStr = Array.from(symbolsNotInAlpha).join(", ");
      alertMessage += `Transition symbols [${symbolsNotInAlphaStr}] are not in the alphabet. The erroneous transitions are highlighted in red.\n`;
    }

    if (multipleTransitions.size > 0) {
      const multipleTransitionsStr = Array.from(multipleTransitions)
        .map(
          ([state, symbol]) =>
            `${
              state.getText() === ""
                ? "(Unnamed state)"
                : "State " + state.getText()
            } on symbol ${symbol}\n`
        )
        .join("");
      alertMessage += `Multiple transitions found for the following state-symbol pairs:\n${multipleTransitionsStr}The erroneous transitions are highlighted in red.\n`;
    }

    //check if each state has a transition for each symbol in the alphabet
    const missedSymbols = new Set();
    for (let i = 0; i < this.machine.numStates; i++) {
      for (let symbol of this.machine.alphabet) {
        if (this.machine.transitions[[i, symbol]] === undefined) {
          missedSymbols.add([i, symbol]);
        }
      }
    }

    if (missedSymbols.size > 0) {
      console.log("States:", this.states);
      console.log("States?:", this.machine.numStates);
      console.log("Well, NumStates?:", this.machine.numStates);
      let missedSymbolsStr = "";
      for (let [state, symbol] of missedSymbols) {
        missedSymbolsStr += `${
          this.states[state].getText() === ""
            ? "(Unnamed state)"
            : "State " + this.states[state].getText()
        } on symbol ${symbol}, \n`;
      }
      alertMessage += `The following states are missing transitions on the following symbols: \n${missedSymbolsStr}\n`;
    }

    if (alertMessage !== "") {
      alertPopup(alertMessage);
      return false;
    }

    this.machine.finalStates = this.finalStates;
    return true;
  }
  next() {
    const nextSymbol = this.tape.getSymbolAtHead();
    console.log("NextSymbol:", nextSymbol);

    if (nextSymbol === this.tape.blank) {
      return Promise.resolve(true);
    }

    const nextStateNumber =
      this.machine.transitions[[this.machine.currentState, nextSymbol]];
    const currentState = this.states.find(
      (state, i) => i === this.machine.currentState
    );
    const nextState = this.states.find((state, i) => i === nextStateNumber);

    if (nextStateNumber === undefined || !currentState || !nextState) {
      console.error("Transition or state not found");
      return Promise.reject();
    }

    console.log("CurrentStateNumber:", this.machine.currentState);
    console.log("NextStateNumber:", nextStateNumber);

    const transition = this.svgHandler.transitions.find(
      (transition) =>
        transition.startControlPoint === currentState &&
        transition.endControlPoint === nextState
    );

    if (!transition) {
      console.error("Transition not found");
      return Promise.reject();
    }

    this.svgHandler.highlightTransition(transition);

    return new Promise((resolve) => {
      setTimeout(() => {
        this.svgHandler.unHighlightTransition(transition);
        this.machine.next(nextSymbol);
        this.tape.moveTape(-1);
        this.highlightCurrentStates();

        if (this.tape.getSymbolAtHead() === this.tape.blank) {
          resolve(true);
        } else {
          resolve(false);
        }
      }, this.getAnimDelay());
    });
  }

  // next() {
  //   const nextSymbol = this.tape.getSymbolAtHead();
  //   console.log("NextSymbol:", nextSymbol);
  //   if (nextSymbol === this.tape.blank) {
  //     this.checkSuccess();
  //     this.endSimulation();
  //   }
  //   const nextStateNumber =
  //     this.machine.transitions[[this.machine.currentState, nextSymbol]];
  //   const currentState = this.states.find(
  //     (state, i) => i === this.machine.currentState
  //   );
  //   const nextState = this.states.find((state, i) => i === nextStateNumber);
  //   console.log("CurrentStateNumber:", this.machine.currentState);
  //   console.log("NextStateNumber:", nextStateNumber);
  //   const transition = this.svgHandler.transitions.find(
  //     (transition) =>
  //       transition.startControlPoint === currentState &&
  //       transition.endControlPoint === nextState
  //   );

  //   this.svgHandler.highlightTransition(transition);
  //   setTimeout(() => {
  //     this.svgHandler.unHighlightTransition(transition);
  //     this.machine.next(nextSymbol);
  //     this.tape.moveTapeHead(1);
  //     this.highlightCurrentStates();
  //     if (this.tape.getSymbolAtHead() === this.tape.blank) {
  //       this.checkSuccess();
  //       this.endSimulation();
  //     } else if (this.simulationState === this.simulationStates.PLAYING) {
  //       setTimeout(() => {
  //         if (this.simulationState === this.simulationStates.PLAYING) {
  //           this.next();
  //         }
  //       }, this.getAnimDelay());
  //     }
  //   }, this.getAnimDelay());
  // }

  drawMinimizedDFA() {
    if (!this.retrieveMachine()) {
      return;
    }

    const minDfa = this.machine.getMinimized();
    this.svgHandler.drawDFA(minDfa);
  }

  highlightCurrentStates() {
    const currentState = this.states.find(
      (state, i) => i === this.machine.currentState
    );
    if (currentState) {
      this.svgHandler.highlightControlPoints([currentState]);
    }
  }

  checkSuccess() {
    const currentState = this.states.find(
      (state, i) => i === this.machine.currentState
    );
    if (currentState.isFinal()) {
      this.svgHandler.setSuccessStates([currentState]);
    } else {
      this.svgHandler.setFailStates([currentState]);
    }
  }
}
