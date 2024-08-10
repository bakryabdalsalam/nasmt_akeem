document.addEventListener("DOMContentLoaded", function () {
  const usersTable = document
    .getElementById("usersTable")
    .querySelector("tbody");
  const exportButton = document.getElementById("exportButton");
  const customerServiceFilter = document.getElementById(
    "customerServiceFilter"
  );

  async function loadRegisteredUsers(filter = "") {
    const response = await fetch("/api/users");
    const users = await response.json();
    usersTable.innerHTML = "";

    const filteredUsers = users.filter(
      (user) => filter === "" || user.customerService === filter
    );

    filteredUsers.forEach((user) => {
      const row = document.createElement("tr");
      row.innerHTML = `
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
    loadRegisteredUsers(customerServiceFilter.value);
  });

  loadRegisteredUsers();
  exportButton.addEventListener("click", exportToExcel);
});
