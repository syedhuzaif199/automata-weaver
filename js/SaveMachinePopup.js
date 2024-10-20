export function saveMachinePopup(callback) {
  console.log("Save Machine Popup");
  const saveMachinePopup = document.getElementById("save-machine-popup");
  saveMachinePopup.style.display = "flex";
  document
    .getElementById("close-save-machine-popup")
    .addEventListener("click", () => {
      saveMachinePopup.style.display = "none";
    });
  document.getElementById("save-machine-ok").addEventListener("click", () => {
    callback(document.getElementById("save-machine-name").value);
    saveMachinePopup.style.display = "none";
  });
}
