export function signupSubmit() {
  document
    .getElementById("signup-form")
    .addEventListener("submit", async function (event) {
      event.preventDefault();
      const username = document.getElementById("username").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      console.log("Username: ", username);
      console.log("Password: ", password);
      try {
        const response = await fetch(
          "https://automataweaver.onrender.com/signup",
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
          console.log("Signup successful");
          document.getElementById("signup-popup").style.display = "none";
          alertPopup("Signup successful:", result.message);
        } else {
          alertPopup("Signup failed:", result.error);
        }
      } catch (error) {
        console.error("Error: ", error);
        alertPopup("Signup failed:", "An error occurred. Please try again.");
      }
    });
}
