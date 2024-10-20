export function alertPopup(text) {
  const texts = text.split("\n");
  const alertPopup = document.getElementById("alert-popup");
  alertPopup.style.display = "flex";
  document.getElementById("alert-text").innerHTML = texts.join("<br>");
  document.getElementById("close-alert-popup").addEventListener("click", () => {
    alertPopup.style.display = "none";
  });
  document.getElementById("alert-ok").addEventListener("click", () => {
    alertPopup.style.display = "none";
  });
}
