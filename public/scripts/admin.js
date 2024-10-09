document.addEventListener("DOMContentLoaded", function () {
  const usersTable = document.getElementById("usersTable").querySelector("tbody");
  const exportButton = document.getElementById("exportButton");
  const customerServiceFilter = document.getElementById("customerServiceFilter");
  const searchInput = document.getElementById("searchInput");
  let currentPage = 1;
  const limit = 10;
  let loading = false;
  let totalUsers = 0;

  async function loadRegisteredUsers(filter = "", searchTerm = "", page = 1) {
    if (loading) return;

    loading = true;
    let query = `/api/users?customerService=${filter}&page=${page}&limit=${limit}`;
    if (searchTerm) {
      query += `&search=${encodeURIComponent(searchTerm)}`;
    }

    const response = await fetch(query);
    const { users, total } = await response.json();
    totalUsers = total;

    if (page === 1) {
      usersTable.innerHTML = ""; // Clear table on new search/filter
    }

    if (users.length === 0 && page === 1) {
      usersTable.innerHTML = "<tr><td colspan='7'>لا توجد نتائج.</td></tr>";
    } else {
      users.forEach((user) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${user.number !== undefined ? user.number : ''}</td>
          <td>${user.name}</td>
          <td>${user.phone}</td>
          <td>${user.id}</td>
          <td>${user.nationalities}</td>
          <td>${user.customerService}</td>
          <td>${user.prizeDraw ? "نعم" : "لا"}</td>
        `;
        usersTable.appendChild(row);
      });
    }

    loading = false;
  }

  function handleScroll() {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 50 && !loading && usersTable.children.length < totalUsers) {
      currentPage++;
      loadRegisteredUsers(customerServiceFilter.value, searchInput.value, currentPage);
    }
  }

  function exportToExcel() {
    const table = document.getElementById("usersTable");
    const rows = Array.from(table.querySelectorAll("tr"));
    const csvContent = rows
      .map((row) => {
        const cols = Array.from(row.querySelectorAll("th, td"));
        return cols.map((col) => col.textContent).join(",");
      })
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "registered_users.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  customerServiceFilter.addEventListener("change", () => {
    currentPage = 1;
    loadRegisteredUsers(customerServiceFilter.value, searchInput.value, currentPage);
  });

  searchInput.addEventListener("input", () => {
    currentPage = 1;
    loadRegisteredUsers(customerServiceFilter.value, searchInput.value, currentPage);
  });

  window.addEventListener("scroll", handleScroll);

  loadRegisteredUsers();
  exportButton.addEventListener("click", exportToExcel);

  // Employee management logic
  const employeeForm = document.getElementById("employeeForm");
  const employeeList = document.getElementById("employeeList");

  // Load existing employees
  async function loadEmployees() {
    const response = await fetch("/api/employees");
    const employees = await response.json();
    employeeList.innerHTML = "";
    customerServiceFilter.innerHTML = "<option value=''>الكل</option>"; // Reset filter

    employees.forEach((employee) => {
      const li = document.createElement("li");
      li.textContent = employee.name;
      li.dataset.id = employee.id;
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "حذف";
      deleteBtn.onclick = () => deleteEmployee(employee.id);
      li.appendChild(deleteBtn);
      employeeList.appendChild(li);

      // Update the customer service filter dropdown
      const option = document.createElement("option");
      option.value = employee.name;
      option.textContent = employee.name;
      customerServiceFilter.appendChild(option);
    });
  }

  // Add employee
  employeeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const employeeName = document.getElementById("employeeName").value.trim();
    if (employeeName === "") return;

    const response = await fetch("/api/employees", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ employeeName }),
    });

    if (response.ok) {
      loadEmployees();
      employeeForm.reset();
    }
  });

  // Delete employee
  async function deleteEmployee(id) {
    const response = await fetch(`/api/employees/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      loadEmployees();
    }
  }

  loadEmployees(); // Load on page load
});
