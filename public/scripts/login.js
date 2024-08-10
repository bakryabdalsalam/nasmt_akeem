document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const formMessage = document.getElementById("formMessage");

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const usernameError = document.getElementById("usernameError");
    const passwordError = document.getElementById("passwordError");

    usernameError.textContent = "";
    passwordError.textContent = "";
    formMessage.textContent = "";

    if (username === "" || password === "") {
      if (username === "") {
        usernameError.textContent = "اسم المستخدم مطلوب.";
      }
      if (password === "") {
        passwordError.textContent = "كلمة المرور مطلوبة.";
      }
      return;
    }

    fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => {
        if (response.ok) {
          window.location.href = "admin.html";
        } else {
          formMessage.textContent = "اسم المستخدم أو كلمة المرور غير صحيحة.";
        }
      })
      .catch(() => {
        formMessage.textContent = "حدث خطأ أثناء تسجيل الدخول.";
      });
  });
});
