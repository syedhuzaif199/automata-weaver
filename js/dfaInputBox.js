import { EPSILON, TEXT_SIZE } from "./constants.js";

const BASE_BTN_SIZE = 40;
const BASE_BTN_IMG_SIZE = 25;

export default class DFATextBox {
  constructor(faInputBox) {
    this.faInputBox = faInputBox;
    this.onEnterPressed = () => {};
  }
  spawn(x, y, scale, text) {
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

    const texts = text.join("").split(",");

    console.log("Received texts:", texts);

    while (this.faInputBox.firstChild) {
      console.log("Removing child:", this.faInputBox.firstChild);
      this.faInputBox.firstChild.remove();
    }
    console.log("Children after deletion:", this.faInputBox.children);
    this.faInputBox.style.display = "flex";
    this.faInputBox.style.left = x + "px";
    this.faInputBox.style.top = y + "px";
    this.faInputBox.focus();

    const innerBox = document.createElement("div");
    innerBox.classList.add("inner-input-box");
    const inputEle = document.createElement("input");
    inputEle.setAttribute("type", "text");
    inputEle.value = texts[0];
    inputEle.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.onEnterPressed();
      }
    });
    innerBox.appendChild(inputEle);
    const addBtn = document.createElement("button");
    addBtn.addEventListener("click", () => this.onAddBtnClick(addBtn));

    const btnImg = document.createElement("img");
    btnImg.src = "./assets/plus.svg";
    addBtn.appendChild(btnImg);

    innerBox.appendChild(addBtn);
    this.faInputBox.appendChild(innerBox);
    inputEle.focus();
    inputEle.select();

    for (let i = 1; i < texts.length; i++) {
      this.onAddBtnClick(addBtn, texts[i]);
    }
  }

  hide() {
    this.faInputBox.style.display = "none";
  }

  updatePosition(x, y, scale) {
    this.faInputBox.style.left = x + "px";
    this.faInputBox.style.top = y + "px";
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
    return this.faInputBox.style.display !== "none";
  }

  getText() {
    const children = Array.from(this.faInputBox.children);
    const texts = [];
    for (let i = 0; i < children.length; i++) {
      const inputEle = children[i].querySelector("input");
      if (inputEle.value.trim() === "") {
        texts.push(EPSILON);
        continue;
      }
      texts.push(inputEle.value);
    }
    return [texts.join(",")];
  }

  onAddBtnClick(addBtn, text = "") {
    console.log("Add button clicked");
    const children = Array.from(this.faInputBox.children);
    const lastChild = children[children.length - 1];
    lastChild.removeChild(addBtn);
    const remBtn = document.createElement("button");
    const btnImg = document.createElement("img");
    btnImg.src = "./assets/minus.svg";
    remBtn.appendChild(btnImg);
    remBtn.addEventListener("click", (e) => {
      this.faInputBox.removeChild(remBtn.parentElement);
    });
    lastChild.appendChild(remBtn);

    const innerBox = document.createElement("div");
    innerBox.classList.add("inner-input-box");
    const inputEle = document.createElement("input");
    inputEle.setAttribute("type", "text");
    inputEle.value = text;
    inputEle.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.onEnterPressed();
      }
    });
    innerBox.appendChild(inputEle);
    innerBox.appendChild(addBtn);
    this.faInputBox.appendChild(innerBox);
    inputEle.focus();
    inputEle.select();
  }
}
