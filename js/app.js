import SVGHandler from "./svgHandler.js";
import DFASimulator from "./dfaSimulator.js";
import DFATextBox from "./dfaInputBox.js";
import NFASimulator from "./nfaSimulator.js";
import Tape from "./tape.js";
import TmSimulator from "./tmSimulator.js";
import NFATextBox from "./nfaInputBox.js";
import TMTextBox from "./tmInputBox.js";
import PDATextBox from "./pdaInputBox.js";
import PDASimulator from "./pdaSimulator.js";
import Stack from "./stack.js";
import { loginSubmit } from "./loginSubmit.js";
import { signupSubmit } from "./signupSubmit.js";

document.addEventListener("DOMContentLoaded", () => {
  const svg = document.getElementById("svgdisplay");
  svg.addEventListener("click", (e) => {
    console.log("SVG Clicked");
    e.stopPropagation();
  });
  const rectOfSvg = svg.getBoundingClientRect();
  const { width, height } = rectOfSvg;
  const svgHandler = new SVGHandler(svg, width, height);
  const tape = new Tape(1025);
  const stack = new Stack();
  let simulationHandler;

  document.addEventListener("keydown", (e) => {
    svgHandler.setKeyDown(e.key);
    console.log("keyPressed", e.key);
    if (svgHandler.isTextFieldVisible() || svgHandler.isInputBoxVisible()) {
      return;
    }
    switch (e.key) {
      case "s":
      case "S":
        svgHandler.setAction(svgHandler.actions.select);
        setActiveButton(selectBtn);
        break;

      case "a":
      case "A":
        svgHandler.setAction(svgHandler.actions.addState);
        setActiveButton(addStateBtn);
        break;

      case "t":
      case "T":
        svgHandler.setAction(svgHandler.actions.addTransition);
        setActiveButton(addTransitionBtn);
        break;
      case "Delete":
      case "Backspace":
      case "d":
      case "D":
        svgHandler.deleteSelected();
        break;
      case "f":
      case "F":
        onFlagBtnClick();
        break;
    }
  });

  document.addEventListener("keyup", (e) => {
    e.preventDefault();
    svgHandler.setKeyDown(null);
  });

  // hide menu pane when a child button is clicked
  document.querySelector("#menu-pane").childNodes.forEach((child) => {
    child.addEventListener("click", (e) => {
      console.log("Menu Pane Clicked");
      const pane = document.querySelector("#menu-pane");
      pane.style.display = "none";
    });
  });

  // hide machine options pane when a child button is clicked
  document
    .querySelector("#machine-options-pane")
    .querySelectorAll("button")
    .forEach((child) => {
      child.addEventListener("click", (e) => {
        console.log("Machine Options Pane Clicked");
        const pane = document.querySelector("#machine-options-pane");
        pane.style.display = "none";
      });
    });

  document
    .getElementById("profile-pane")
    .querySelectorAll("button")
    .forEach((child) => {
      child.addEventListener("click", (e) => {
        console.log("Profile Pane Clicked");
        const pane = document.getElementById("profile-pane");
        pane.style.display = "none";
      });
    });

  document.getElementById("close-login-popup").addEventListener("click", () => {
    document.getElementById("login-popup").style.display = "none";
  });

  document.getElementById("login-submit").addEventListener("click", () => {
    document.getElementById("login-popup").style.display = "none";
    loginSubmit();
  });

  document.getElementById("forgot-pwd-btn").addEventListener("click", () => {
    document.getElementById("login-popup").style.display = "none";
    document.getElementById("forgot-pwd-popup").style.display = "flex";
  });

  document.getElementById("signup-alt-btn").addEventListener("click", () => {
    document.getElementById("login-popup").style.display = "none";
    document.getElementById("signup-popup").style.display = "flex";
  });

  document
    .getElementById("close-signup-popup")
    .addEventListener("click", () => {
      document.getElementById("signup-popup").style.display = "none";
    });
  document.getElementById("signup-submit").addEventListener("click", () => {
    document.getElementById("signup-popup").style.display = "none";
    signupSubmit();
  });

  document.getElementById("login-alt-btn").addEventListener("click", () => {
    document.getElementById("signup-popup").style.display = "none";
    document.getElementById("login-popup").style.display = "flex";
  });

  document
    .getElementById("close-forgot-pwd-popup")
    .addEventListener("click", () => {
      document.getElementById("forgot-pwd-popup").style.display = "none";
    });

  document
    .getElementById("forgot-login-alt-btn")
    .addEventListener("click", () => {
      document.getElementById("forgot-pwd-popup").style.display = "none";
      document.getElementById("login-popup").style.display = "flex";
    });

  const profileBtn = document.getElementById("profile-btn");
  profileBtn.addEventListener("click", () => {
    const profilePane = document.getElementById("profile-pane");
    profilePane.style.display =
      profilePane.style.display === "none" ? "flex" : "none";
  });

  const loginBtn = document.getElementById("login-btn");
  loginBtn.addEventListener("click", () => {
    const loginPopup = document.getElementById("login-popup");
    loginPopup.style.display = "flex";
  });

  const signupBtn = document.getElementById("signup-btn");
  signupBtn.addEventListener("click", () => {
    const signupPopup = document.getElementById("signup-popup");
    signupPopup.style.display = "flex";
  });

  const homeBtn = document.querySelector("#home");
  homeBtn.addEventListener("click", onHomeClick);

  const zoomInBtn = document.querySelector("#zoom-in");
  zoomInBtn.addEventListener("click", onZoomIn);

  const zoomOutBtn = document.querySelector("#zoom-out");
  zoomOutBtn.addEventListener("click", onZoomOut);

  const addTransitionBtn = document.querySelector("#add-transition");
  addTransitionBtn.addEventListener("click", onAddTransitionBtnClick);

  const addStateBtn = document.querySelector("#add-state");
  addStateBtn.addEventListener("click", onAddStateBtnClick);

  const selectBtn = document.querySelector("#select-button");
  selectBtn.addEventListener("click", onSelectBtnClick);

  const flagBtn = document.querySelector("#flag-final-button");
  flagBtn.addEventListener("click", onFlagBtnClick);

  const deleteBtn = document.querySelector("#delete-button");
  deleteBtn.addEventListener("click", onDeleteBtnClick);

  const zoomResetBtn = document.querySelector("#zoom-reset");
  zoomResetBtn.addEventListener("click", onZoomReset);

  const menuBtn = document.querySelector("#menu-btn");
  menuBtn.addEventListener("click", onMenuBtnClick);

  const panelBtn = document.getElementById("panel-button");
  panelBtn.addEventListener("click", onPanelBtnClick);

  const leftPane = document.getElementById("left-pane");

  const loadJSONBtn = document.querySelector("#load-json");
  loadJSONBtn.addEventListener("click", onLoadJSONBtnClick);

  const saveJSONBtn = document.querySelector("#save-json");
  saveJSONBtn.addEventListener("click", onSaveJSONBtnClick);

  const savePdfBtn = document.querySelector("#save-pdf");
  savePdfBtn.addEventListener("click", onSavePdfBtnClick);

  const clearCanvasBtn = document.querySelector("#clear-btn");
  clearCanvasBtn.addEventListener("click", onClearCanvasBtnClick);

  const playPauseBtn = document.querySelector("#play-pause");
  playPauseBtn.addEventListener("click", onPlayPauseBtnClick);

  const onNotPlayingCallback = () => {
    playPauseBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="play" id="play-icon" class="lucide lucide-play"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>`;
  };

  const previousBtn = document.querySelector("#previous");
  previousBtn.addEventListener("click", onPreviousBtnClick);

  const nextBtn = document.querySelector("#next");
  nextBtn.addEventListener("click", onNextBtnClick);

  const rewindBtn = document.querySelector("#rewind");
  rewindBtn.addEventListener("click", onRewindBtnClick);

  const fastForwardBtn = document.querySelector("#fast-forward");
  fastForwardBtn.addEventListener("click", onFastForwardBtnClick);

  const machineTypeSelect = document.querySelector("#machine-type");
  machineTypeSelect.addEventListener("change", onMachineTypeChange);

  const machineOptionsBtn = document.querySelector("#machine-options-btn");
  machineOptionsBtn.addEventListener("click", onMachineOptionsBtnClick);

  const conv2dfaBtn = document.querySelector("#convert-to-dfa");
  conv2dfaBtn.addEventListener("click", () => simulationHandler.convertToDFA());

  const minimizeDfaBtn = document.querySelector("#minimize-dfa");
  minimizeDfaBtn.addEventListener("click", () =>
    simulationHandler.drawMinimizedDFA()
  );

  const generateFromRegexBtn = document.querySelector("#gen-regex");
  generateFromRegexBtn.addEventListener("click", () => {});

  const speedSlider = document.querySelector("#speed");
  speedSlider.addEventListener("change", () => {
    document.documentElement.style.setProperty(
      "--cell-anim-duration",
      `${1000 - speed.value + 10}ms`
    );
  });

  const faInputBox = document.getElementById("fa-input-box");
  const pdaInputBox = document.getElementById("pda-input-box");
  const tmInputBox = document.getElementById("tm-input-box");

  const dfaTextBox = new DFATextBox(faInputBox);
  const nfaTextBox = new NFATextBox(faInputBox);
  const pdaTextBox = new PDATextBox(pdaInputBox);
  const tmTextBox = new TMTextBox(tmInputBox);

  function setMachineType(machineType) {
    if (svgHandler.inputBox) {
      svgHandler.hideInputBox();
    }
    console.log("Machine Type Changed", machineType);
    const tapeAlphaBox = document.getElementById("tape-alphabet-box");
    const stackAlphaBox = document.getElementById("stack-alphabet-box");
    if (machineType === "tm") {
      tapeAlphaBox.style.display = "block";
    } else {
      tapeAlphaBox.style.display = "none";
    }
    const stackDiv = document.getElementById("stack");
    if (machineType === "pda") {
      stackDiv.style.display = "flex";
      stackDiv.parentElement.style.display = "block";
      stackAlphaBox.style.display = "block";
    } else {
      stackDiv.style.display = "none";
      stackDiv.parentElement.style.display = "none";
      stackAlphaBox.style.display = "none";
    }
    if (machineType === "tm" || machineType === "pda") {
      document.getElementById("machine-options-separator").style.display =
        "none";
    } else {
      document.getElementById("machine-options-separator").style.display =
        "block";
    }
    switch (machineType) {
      case "dfa":
        conv2dfaBtn.style.display = "none";
        minimizeDfaBtn.style.display = "flex";
        generateFromRegexBtn.style.display = "flex";
        simulationHandler = new DFASimulator(
          svgHandler,
          tape,
          onNotPlayingCallback
        );
        svgHandler.setInputBox(dfaTextBox);
        break;
      case "nfa":
        conv2dfaBtn.style.display = "flex";
        minimizeDfaBtn.style.display = "none";
        generateFromRegexBtn.style.display = "flex";
        simulationHandler = new NFASimulator(
          svgHandler,
          tape,
          onNotPlayingCallback
        );
        svgHandler.setInputBox(nfaTextBox);
        break;
      case "pda":
        simulationHandler = new PDASimulator(
          svgHandler,
          tape,
          stack,
          onNotPlayingCallback
        );
        svgHandler.setInputBox(pdaTextBox);
        conv2dfaBtn.style.display = "none";
        minimizeDfaBtn.style.display = "none";
        generateFromRegexBtn.style.display = "none";
        break;
      case "tm":
        simulationHandler = new TmSimulator(
          svgHandler,
          tape,
          onNotPlayingCallback
        );
        svgHandler.setInputBox(tmTextBox);
        conv2dfaBtn.style.display = "none";
        minimizeDfaBtn.style.display = "none";
        generateFromRegexBtn.style.display = "none";
        break;

      default:
        simulationHandler = new DFASimulator(
          svgHandler,
          tape,
          onNotPlayingCallback
        );
        break;
    }
  }

  function onMachineTypeChange(e) {
    const machineType = e.target.value;
    setMachineType(machineType);
  }

  function onMachineOptionsBtnClick(e) {
    console.log("Machine Options Button Clicked");
    const options = document.querySelector("#machine-options-pane");
    options.style.display = options.style.display === "none" ? "flex" : "none";
  }

  function onClearCanvasBtnClick() {
    if (confirm("Are you sure you want to clear the canvas?")) {
      svgHandler.clear();
    }
  }

  function onPanelBtnClick() {
    leftPane.classList.toggle("in-view");
  }

  function onPlayPauseBtnClick() {
    simulationHandler.handlePlayPause();
    console.log("Play btn innerHTML:", playPauseBtn.innerHTML);
    if (
      simulationHandler.simulationState ===
      simulationHandler.simulationStates.PLAYING
    ) {
      // playPauseBtn.children[0].src = "./assets/pause.svg";
      playPauseBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="pause" id="pause-icon" class="lucide lucide-pause"><rect x="14" y="4" width="4" height="16" rx="1"></rect><rect x="6" y="4" width="4" height="16" rx="1"></rect></svg>`;
    } else {
      // playPauseBtn.children[0].src = "./assets/play.svg";
      playPauseBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="play" id="play-icon" class="lucide lucide-play"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>`;
    }
  }

  function onPreviousBtnClick() {
    simulationHandler.handlePrevious();
  }

  function onNextBtnClick() {
    simulationHandler.handleNext();
  }

  function onRewindBtnClick() {
    simulationHandler.isPlaying = true;
    playPauseBtn.children[0].src = "./assets/play.svg";

    simulationHandler.handleRewind();
  }

  function onFastForwardBtnClick() {
    simulationHandler.handleFastForward();
  }

  let activeButton = addStateBtn;

  function setActiveButton(button) {
    console.log("Setting Active Button");
    if (activeButton) {
      activeButton.classList.remove("active");
    }
    activeButton = button;
    activeButton.classList.add("active");
  }

  function updateZoomResetBtn() {
    zoomResetBtn.innerHTML = parseInt(svgHandler.getScale() * 100) + "%";
  }

  function onHomeClick(event) {
    svgHandler.resetSVG();
    updateZoomResetBtn();
  }

  function onZoomIn(event) {
    svgHandler.zoomIn();
    updateZoomResetBtn();
  }

  function onZoomOut(event) {
    svgHandler.zoomOut();
    updateZoomResetBtn();
  }

  function onZoomReset(event) {
    svgHandler.resetZoom();
    updateZoomResetBtn();
  }

  function onSelectBtnClick(event) {
    console.log("Select Button Clicked");
    svgHandler.setAction(svgHandler.actions.select);
    setActiveButton(selectBtn);
  }

  function onAddTransitionBtnClick() {
    svgHandler.setAction(svgHandler.actions.addTransition);
    setActiveButton(addTransitionBtn);
  }

  function onAddStateBtnClick() {
    svgHandler.setAction(svgHandler.actions.addState);
    setActiveButton(addStateBtn);
  }

  function onFlagBtnClick() {
    console.log("Flag Button Clicked");
    svgHandler.flagAsFinalState();
  }

  function onDeleteBtnClick() {
    console.log("Delete Button Clicked");

    svgHandler.deleteSelected();
  }

  function onMenuBtnClick(e) {
    console.log("Menu Button Clicked");
    const pane = document.querySelector("#menu-pane");
    pane.style.display = pane.style.display === "none" ? "flex" : "none";
  }

  function onSaveJSONBtnClick(e) {
    console.log("Save JSON Button Clicked");
    svgHandler.saveToLocalStorage();
  }

  function onLoadJSONBtnClick(e) {
    console.log("Load JSON Button Clicked");
    svgHandler.loadFromLocalStorage();
  }

  function onSavePdfBtnClick(e) {
    console.log("Save PDF Button Clicked");
    window.print();
  }

  window.addEventListener("resize", () => {
    console.log("resize");
    svgHandler.resizeSVG(window.innerWidth, window.innerHeight);
  });

  const panes = document.querySelectorAll(".menu");
  panes.forEach((pane) => (pane.style.display = "none"));
  setMachineType(machineTypeSelect.value);
  svgHandler.setAction(svgHandler.actions.addState);
  setActiveButton(activeButton);

  document.addEventListener("wheel", (e) => {
    updateZoomResetBtn();
  });

  document.addEventListener("click", (e) => {
    const menupane = document.getElementById("menu-pane");
    const machineOptionsPane = document.getElementById("machine-options-pane");
    const profilePane = document.getElementById("profile-pane");
    if (!menupane.contains(e.target) && !menuBtn.contains(e.target)) {
      menupane.style.display = "none";
    }
    if (
      !machineOptionsPane.contains(e.target) &&
      !machineOptionsBtn.contains(e.target)
    ) {
      machineOptionsPane.style.display = "none";
    }
    if (!profilePane.contains(e.target) && !profileBtn.contains(e.target)) {
      profilePane.style.display = "none";
    }
  });
});
