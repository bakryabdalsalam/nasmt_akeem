document.addEventListener("DOMContentLoaded", async function () {
  const registrationForm = document.getElementById("registrationForm");
  const customerServiceSelect = document.getElementById("customerService");
  const submitButton = registrationForm.querySelector(".submit-btn");
  const tiktokLink = document.getElementById("tiktokLink");
  const snapchatLink = document.getElementById("snapchatLink");

  // Initially disable submit button
  submitButton.disabled = true;

  let tiktokClicked = false;
  let snapchatClicked = false;

  tiktokLink.addEventListener("click", function () {
    tiktokClicked = true;
    checkLinksClicked();
  });

  snapchatLink.addEventListener("click", function () {
    snapchatClicked = true;
    checkLinksClicked();
  });

  function checkLinksClicked() {
    if (tiktokClicked && snapchatClicked) {
      submitButton.disabled = false;
    }
  }

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

  // Form submission
  registrationForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const id = document.getElementById("id").value.trim();
    const nationalities = document.getElementById("nationalities").value.trim();
    const customerService = document.getElementById("customerService").value.trim();

    clearErrors();

    const errors = validateForm(name, phone, id, nationalities, customerService);
    if (errors.length > 0) {
      errors.forEach(
        (error) => (document.getElementById(error.field).textContent = error.message)
      );
      return;
    }

    const user = { name, phone, id, nationalities, customerService };

    fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Unknown error');
        }
        return response.json();
      })
      .then(() => {
        alert("تم التسجيل بنجاح!");
        registrationForm.reset();
        clearErrors();
        submitButton.disabled = true; // Disable submit button again
        tiktokClicked = false;
        snapchatClicked = false;
      })
      .catch((error) => {
        const errorMessage = error.message;
        if (errorMessage.includes('phone')) {
          document.getElementById('phoneError').textContent = 'رقم الجوال موجود بالفعل.';
        } else if (errorMessage.includes('ID') || errorMessage.includes('id')) {
          document.getElementById('idError').textContent = 'رقم الهوية موجود بالفعل.';
        } else {
          alert(`خطأ: ${errorMessage}`);
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
