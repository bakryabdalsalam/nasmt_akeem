document.addEventListener("DOMContentLoaded", function () {
  const registrationForm = document.getElementById("registrationForm");
  const drawPrizeButton = document.getElementById("drawPrizeButton");
  const winnerDisplay = document.getElementById("winner");

  registrationForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const id = document.getElementById("id").value.trim();
    const nationalities = document.getElementById("nationalities").value.trim();
    const customerService = document.getElementById("customerService").value.trim();
    const prizeDraw = document.getElementById("prizeDraw").checked;

    const errors = validateForm(name, phone, id, nationalities, customerService);
    if (errors.length > 0) {
      errors.forEach(
        (error) => (document.getElementById(error.field).textContent = error.message)
      );
      return;
    }

    const user = { name, phone, id, nationalities, customerService, prizeDraw };

    fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    })
      .then((response) => response.json())
      .then(() => {
        alert("تم التسجيل بنجاح!");
        registrationForm.reset();
        clearErrors();
      });
  });

  drawPrizeButton.addEventListener("click", function () {
    fetch("/api/users")
      .then((response) => response.json())
      .then((users) => {
        const eligibleForDraw = users.filter((user) => user.prizeDraw);

        if (eligibleForDraw.length > 0) {
          const winner =
            eligibleForDraw[Math.floor(Math.random() * eligibleForDraw.length)];
          winnerDisplay.textContent = `الفائز: ${winner.name} - ${winner.phone} - ${winner.id}`;
        } else {
          winnerDisplay.textContent = "لا يوجد متقدمين للسحب.";
        }
      });
  });

  function validateForm(name, phone, id, nationalities, customerService) {
    const errors = [];

    if (name === "") {
      errors.push({ field: "nameError", message: "الاسم مطلوب." });
    }

    if (!/^05\d{8}$/.test(phone)) {
      errors.push({
        field: "phoneError",
        message: "رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام.",
      });
    }

    if (!/^\d{10}$/.test(id)) {
      errors.push({
        field: "idError",
        message: "رقم الهوية السعودية يجب أن يتكون من 10 أرقام.",
      });
    }

    if (nationalities === "") {
      errors.push({
        field: "nationalitiesError",
        message: "الجنسيات المطلوبة مطلوبة.",
      });
    }

    if (customerService === "") {
      errors.push({
        field: "customerServiceError",
        message: "موظف خدمة العملاء مطلوب.",
      });
    }

    return errors;
  }

  function clearErrors() {
    document.querySelectorAll(".error").forEach((element) => {
      element.textContent = "";
    });
  }
});

document.addEventListener("DOMContentLoaded", async function () {
  const registrationForm = document.getElementById("registrationForm");
  const customerServiceSelect = document.getElementById("customerService");

  // Load employees into the dropdown
  async function loadEmployees() {
    try {
      const response = await fetch("/api/employees");
      const employees = await response.json();

      customerServiceSelect.innerHTML = '<option value="">اختر موظف خدمة العملاء</option>';
      employees.forEach((employee) => {
        const option = document.createElement("option");
        option.value = employee.name;
        option.textContent = employee.name;
        customerServiceSelect.appendChild(option);
      });
    } catch (err) {
      console.error("Error loading employees:", err);
    }
  }

  loadEmployees();
  // Rest of the registration.js code...
});

