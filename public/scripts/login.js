document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const formMessage = document.getElementById("formMessage");

  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const usernameError = document.getElementById("usernameError");
    const passwordError = document.getElementById("passwordError");

    // Clear previous error messages
    usernameError.textContent = '';
    passwordError.textContent = '';

    // Send login request to the API
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputUsername: username, inputPassword: password }),
      });

      const result = await response.json();

      if (response.status === 200) {
        // Store authentication token in local storage
        localStorage.setItem('authToken', result.token);
        // Redirect to the admin page
        window.location.href = '/admin.html';
      } else {
        // Show error message from the server response
        formMessage.textContent = result.message;
      }
    } catch (error) {
      formMessage.textContent = 'Error logging in. Please try again later.';
    }
  });
});
