import { alertPopup } from "./AlertPopup.js";

export async function signup(event, setLoggedIn) {
  event.preventDefault();
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password1").value;
  console.log("Username: ", username);
  console.log("Email: ", email);
  console.log("Password: ", password);
  try {
    const response = await fetch(
      "https://automataweaver.onrender.com/api/signup",
      {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
        credentials: "include",
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
      setLoggedIn(true);
      document.getElementById("signup-popup").style.display = "none";
      console.log("Message: ", result.message);
    } else {
      alertPopup("Signup failed:", result.message);
      console.log("Error message: ", result.error);
      console.log("Message: ", result.message);
    }
  } catch (error) {
    console.error("Error: ", error);
    alertPopup("Signup failed:", "An error occurred. Please try again.");
  }
}

export async function login(event, setLoggedIn) {
  event.preventDefault();
  const username = document.getElementById("login-field").value;
  const password = document.getElementById("password").value;
  console.log("Username: ", username);
  console.log("Password: ", password);
  try {
    const response = await fetch(
      "https://automataweaver.onrender.com/api/login",
      {
        method: "POST",
        body: JSON.stringify({ usernameOrEmail: username, password }),
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();
    if (result.success) {
      document.getElementById("login-popup").style.display = "none";
      alertPopup("Login successful:", result.message);
      setLoggedIn(true);
      document.getElementById("login-popup").style.display = "none";
      console.log("Login successful");
    } else {
      alertPopup("Login failed:", result.message);
      console.log("Error message: ", result.error);
      console.log("Message: ", result.message);
    }
  } catch (error) {
    console.error("Error: ", error);
    alertPopup("Login failed:", "An error occurred. Please try again.");
  }
}

export async function logout(event, setLoggedIn) {
  event.preventDefault();
  try {
    const response = await fetch(
      "https://automataweaver.onrender.com/api/logout",
      {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      }
    );

    const result = await response.json();
    if (result.success) {
      console.log("Logout successful");
      setLoggedIn(false);
      alertPopup("Logout successful:", result.message);
    } else {
      alertPopup("Logout failed:", result.message);
      console.log("Error message: ", result.error);
      console.log("Message: ", result.message);
    }
  } catch (error) {
    console.error("Error: ", error);
    alertPopup("Logout failed:", "An error occurred. Please try again.");
  }
}

export async function deleteAccount(event, setLoggedIn) {
  event.preventDefault();
  try {
    const response = await fetch(
      "https://automataweaver.onrender.com/api/delete-account",
      {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();
    if (result.success) {
      console.log("Account deletion successful");
      setLoggedIn(false);
      alertPopup("Account deletion successful:", result.message);
    } else {
      alertPopup("Account deletion failed:", result.message);
      console.log("Error message: ", result.error);
      console.log("Message: ", result.message);
    }
  } catch (error) {
    console.error("Error: ", error);
    alertPopup(
      "Account deletion failed:",
      "An error occurred. Please try again."
    );
  }
  document.getElementById("confirm-delete-popup").style.display = "none";
}

export async function resetPassword(event) {
  event.preventDefault();
  const email = document.getElementById("reset-email").value;
  console.log("Email: ", email);
  try {
    const response = await fetch(
      "https://automataweaver.onrender.com/api/reset-password",
      {
        method: "POST",
        body: JSON.stringify({ email }),
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();
    if (result.success) {
      console.log("Password reset successful");
      alertPopup("Password reset successful:", result.message);
    } else {
      alertPopup("Password reset failed:", result.message);
      console.log("Error message: ", result.error);
      console.log("Message: ", result.message);
    }
  } catch (error) {
    console.error("Error: ", error);
    alertPopup(
      "Password reset failed:",
      "An error occurred. Please try again."
    );
  }
}

export async function changePassword(event) {
  event.preventDefault();
  const oldPassword = document.getElementById("old-password").value;
  const newPassword = document.getElementById("new-password").value;
  console.log("Old password: ", oldPassword);
  console.log("New password: ", newPassword);
  try {
    const response = await fetch(
      "https://automataweaver.onrender.com/api/update-password",
      {
        method: "PUT",
        body: JSON.stringify({ currentPassword: oldPassword, newPassword }),
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    const result = await response.json();
    if (result.success) {
      console.log("Password change successful");
      alertPopup("Password change successful:", result.message);
      document.getElementById("change-password-popup").style.display = "none";
    } else {
      alertPopup("Password change failed:", result.message);
      console.log("Error message: ", result.error);
      console.log("Message: ", result.message);
    }
  } catch (error) {
    console.error("Error: ", error);
    alertPopup(
      "Password change failed:",
      "An error occurred. Please try again."
    );
  }
}

export async function checkAuth() {
  return false;
}
