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
            body: { username, password },
            credentials: "include", // Include credentials (cookies, sessions) if needed
            // add access-control-allow-origin header
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();
        if (response.ok) {
          console.log("Login successful");
          document.getElementById("login-popup").style.display = "none";
          console.log("Login successful:", result.message);
        } else {
          console.error("result error:", result.error);
          console.error("result message: ", result.message);
        }
      } catch (error) {
        console.error("Error: ", error);
        alertPopup("Login failed:", "An error occurred. Please try again.");
      }
    });
}
