import { alertPopup } from "./AlertPopup.js";

export function loginSubmit() {
  document
    .getElementById("login-form")
    .addEventListener("submit", async function (event) {
      event.preventDefault();
      const username = document.getElementById("login-field").value;
      const password = document.getElementById("password").value;
      console.log("Username: ", username);
      console.log("Password: ", password);
      try {
        const response = await fetch(
          "https://automataweaver.onrender.com/login",
          {
            method: "POST",
            body: JSON.stringify({ username, password }),
          }
        );

        const result = await response.json();
        if (response.ok) {
          console.log("Login successful");
          document.getElementById("login-popup").style.display = "none";
          alertPopup("Login successful:", result.message);
        } else {
          alertPopup("Login failed:", result.error);
        }
      } catch (error) {
        console.error("Error: ", error);
        alertPopup("Login failed:", "An error occurred. Please try again.");
      }
    });
}
