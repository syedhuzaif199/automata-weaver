import { EPSILON, TEXT_SIZE } from "./constants.js";

const BASE_BTN_SIZE = 40;
const BASE_BTN_IMG_SIZE = 25;

export default class PDATextBox {
  constructor(pdaInputBox) {
    this.pdaInputBox = pdaInputBox;
    this.onEnterPressed = () => {};
  }
  spawn(x, y, scale, texts) {
    document.documentElement.style.setProperty(
      "--inputbox-font-size",
      TEXT_SIZE * scale + "px"
    );
    document.documentElement.style.setProperty(
      "--inputbox-btn-size",
      BASE_BTN_SIZE * scale + "px"
    );
    document.documentElement.style.setProperty(
      "--inputbox-btn-img-size",
      BASE_BTN_IMG_SIZE * scale + "px"
    );

    console.log("Received texts:", texts);

    while (this.pdaInputBox.firstChild) {
      console.log("Removing child:", this.pdaInputBox.firstChild);
      this.pdaInputBox.firstChild.remove();
    }
    console.log("Children after deletion:", this.pdaInputBox.children);
    this.pdaInputBox.style.display = "flex";
    this.pdaInputBox.style.left = x + "px";
    this.pdaInputBox.style.top = y + "px";
    this.pdaInputBox.focus();

    const innerBox = document.createElement("div");
    const innerTexts = texts.length > 0 ? texts[0].split(",") : ["", "", ""];
    innerBox.classList.add("inner-input-box");
    const inputEle1 = document.createElement("input");
    inputEle1.setAttribute("type", "text");
    inputEle1.setAttribute("placeholder", "in");
    inputEle1.value = innerTexts[0];
    innerBox.appendChild(inputEle1);

    const inputEle2 = document.createElement("input");
    inputEle2.setAttribute("type", "text");
    inputEle2.setAttribute("placeholder", "pop");
    inputEle2.value = innerTexts[1];
    innerBox.appendChild(inputEle2);

    const inputEle3 = document.createElement("input");
    inputEle3.setAttribute("type", "text");
    inputEle3.setAttribute("placeholder", "push");
    inputEle3.value = innerTexts[2];
    innerBox.appendChild(inputEle3);
    inputEle1.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.onEnterPressed();
      }
    });
    inputEle2.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.onEnterPressed();
      }
    });
    inputEle3.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.onEnterPressed();
      }
    });

    const addBtn = document.createElement("button");
    addBtn.addEventListener("click", () => this.onAddBtnClick(addBtn));

    const btnImg = document.createElement("img");
    btnImg.src = "./assets/dark/plus.svg";
    addBtn.appendChild(btnImg);

    innerBox.appendChild(addBtn);
    this.pdaInputBox.appendChild(innerBox);
    inputEle1.focus();
    inputEle1.select();

    for (let i = 1; i < texts.length; i++) {
      this.onAddBtnClick(addBtn, texts[i]);
    }
  }

  hide() {
    this.pdaInputBox.style.display = "none";
  }

  updatePosition(x, y, scale) {
    this.pdaInputBox.style.left = x + "px";
    this.pdaInputBox.style.top = y + "px";
    document.documentElement.style.setProperty(
      "--inputbox-font-size",
      TEXT_SIZE * scale + "px"
    );
    document.documentElement.style.setProperty(
      "--inputbox-btn-size",
      BASE_BTN_SIZE * scale + "px"
    );
    document.documentElement.style.setProperty(
      "--inputbox-btn-img-size",
      BASE_BTN_IMG_SIZE * scale + "px"
    );
  }

  isVisible() {
    return this.pdaInputBox.style.display !== "none";
  }

  getText() {
    const children = Array.from(this.pdaInputBox.children);
    const texts = [];
    for (let i = 0; i < children.length; i++) {
      const inputEles = children[i].querySelectorAll("input");
      const text = [];
      if (inputEles[0].value.trim() === "") {
        text.push(EPSILON);
      } else {
        text.push(inputEles[0].value.trim());
      }
      if (inputEles[1].value.trim() === "") {
        text.push(EPSILON);
      } else {
        text.push(inputEles[1].value.trim());
      }
      if (inputEles[2].value.trim() === "") {
        text.push(EPSILON);
      } else {
        text.push(inputEles[2].value.trim());
      }
      texts.push(text.join(","));
    }
    return texts;
  }

  onAddBtnClick(addBtn, text = ",,") {
    console.log("Add button clicked");
    const children = Array.from(this.pdaInputBox.children);
    const lastChild = children[children.length - 1];
    lastChild.removeChild(addBtn);
    const remBtn = document.createElement("button");
    const btnImg = document.createElement("img");
    btnImg.src = "./assets/dark/minus.svg";
    remBtn.appendChild(btnImg);
    remBtn.addEventListener("click", (e) => {
      this.pdaInputBox.removeChild(remBtn.parentElement);
    });
    lastChild.appendChild(remBtn);

    const innerBox = document.createElement("div");
    const innerTexts = text.split(",");
    innerBox.classList.add("inner-input-box");

    const inputEle1 = document.createElement("input");
    inputEle1.setAttribute("type", "text");
    inputEle1.setAttribute("placeholder", "in");
    inputEle1.value = innerTexts[0];
    innerBox.appendChild(inputEle1);

    const inputEle2 = document.createElement("input");
    inputEle2.setAttribute("type", "text");
    inputEle2.setAttribute("placeholder", "pop");
    inputEle2.value = innerTexts[1];
    innerBox.appendChild(inputEle2);

    const inputEle3 = document.createElement("input");
    inputEle3.setAttribute("type", "text");
    inputEle3.setAttribute("placeholder", "push");
    inputEle3.value = innerTexts[2];
    innerBox.appendChild(inputEle3);

    inputEle1.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.onEnterPressed();
      }
    });
    inputEle2.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.onEnterPressed();
      }
    });
    inputEle3.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.onEnterPressed();
      }
    });

    innerBox.appendChild(addBtn);
    this.pdaInputBox.appendChild(innerBox);
    inputEle1.focus();
    inputEle1.select();
  }
}
