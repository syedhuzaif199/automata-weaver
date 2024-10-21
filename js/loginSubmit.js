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
            credentials: "include", // Include credentials (cookies, sessions) if needed
            // add access-control-allow-origin header
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();
        if (result.success) {
          console.log("Login successful");
          document.getElementById("login-popup").style.display = "none";
          alertPopup("Login successful:", result.message);
        } else {
          alertPopup("Login failed:", result.error);
          console.log("Error message: ", result.error);
          console.log("Message: ", result.message);
        }
      } catch (error) {
        console.error("Error: ", error);
        alertPopup("Login failed:", "An error occurred. Please try again.");
      }
    });
}
