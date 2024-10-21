import { alertPopup } from "./AlertPopup.js";

export function signupSubmit() {
  document
    .getElementById("signup-form")
    .addEventListener("submit", async function (event) {
      event.preventDefault();
      const username = document.getElementById("username").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password1").value;
      console.log("Username: ", username);
      console.log("Email: ", email);
      console.log("Password: ", password);
      try {
        const response = await fetch(
          "https://automataweaver.onrender.com/signup",
          {
            method: "POST",
            body: JSON.stringify({ username, email, password }),
            credentials: "include", // Include credentials (cookies, sessions) if needed
            // add access-control-allow-origin header
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();
        if (response.ok) {
          console.log("Signup successful");
          document.getElementById("signup-popup").style.display = "none";
          alertPopup("Signup successful:", result.message);
          console.log("Message: ", result.message);
        } else {
          alertPopup("Signup failed:", result.error);
          console.log("Error message: ", result.error);
          console.log("Message: ", result.message);
        }
      } catch (error) {
        console.error("Error: ", error);
        alertPopup("Signup failed:", "An error occurred. Please try again.");
      }
    });
}
