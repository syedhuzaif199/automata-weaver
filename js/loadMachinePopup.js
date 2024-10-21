const trashIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="trash" class="lucide lucide-trash"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>';

export function loadMachinePopup(automatonList, openCallback, deleteCallback) {
  console.error("Automaton list: ", automatonList);
  const popup = document.getElementById("load-machine-popup");
  const popupClose = document
    .getElementById("close-load-machine-popup")
    .addEventListener("click", () => {
      popup.style.display = "none";
      popup.querySelector(".popup-body").innerHTML = "";
    });
  popup.style.display = "flex";
  const inputBox = document.createElement("div");
  inputBox.classList.add("input-box");
  for (let automaton of automatonList) {
    const innerInputBox = document.createElement("div");
    innerInputBox.classList.add("inner-input-box");
    const button = document.createElement("button");
    button.classList.add("popup-button");
    button.innerText = automaton;
    button.addEventListener("click", () => {
      openCallback(automaton);
      popup.style.display = "none";
      popup.querySelector(".popup-body").innerHTML = "";
    });
    innerInputBox.appendChild(button);
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("icon-button");
    deleteButton.classList.add("sm");
    deleteButton.addEventListener("click", () => {
      deleteCallback(automaton);
      innerInputBox.remove();
    });
    deleteButton.innerHTML = trashIcon;
    innerInputBox.appendChild(deleteButton);
    inputBox.appendChild(innerInputBox);
  }
  popup.querySelector(".popup-body").appendChild(inputBox);
}
