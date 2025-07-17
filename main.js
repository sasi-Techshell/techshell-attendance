document.addEventListener("DOMContentLoaded", () => {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
  document.getElementById("todayDatePrint").textContent = today;

  const nameInput = document.getElementById("name");
  const loginTimeInput = document.getElementById("loginTime");
  const logoutTimeInput = document.getElementById("logoutTime");
  const statusInput = document.getElementById("status");
  const addBtn = document.getElementById("addBtn");
  const entryList = document.getElementById("entryList");
  const noRecords = document.getElementById("noRecords");
  const exportExcelBtn = document.getElementById("exportExcel");
  const exportPDFBtn = document.getElementById("exportPDF");

  let entries = [];

  // Utilities
  function formatTimeTo12Hour(timeStr) {
    if (!timeStr) return "";
    const [hour, minute] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hour, minute);
    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata"
    });
  }

  function calculateTotalTime(start, end) {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const totalMinutes = (eh * 60 + em) - (sh * 60 + sm);
    if (totalMinutes < 0) return "Invalid";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  }

  function statusBadgeClass(status) {
    const classes = {
      "Present": "bg-success",
      "Sick Leave": "bg-warning text-dark",
      "Casual Leave": "bg-info text-dark",
      "Personal Leave": "bg-primary",
      "Just Not Attend": "bg-danger"
    };
    return `badge ${classes[status] || 'bg-secondary'}`;
  }

  function formatFileDate() {
    return new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).replace(/ /g, "-");
  }

  // Rendering
  function renderEntries() {
    entryList.innerHTML = "";
    noRecords.style.display = entries.length === 0 ? "block" : "none";

    entries.forEach((entry, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${entry.name}</td>
        <td>${formatTimeTo12Hour(entry.login)}</td>
        <td>${formatTimeTo12Hour(entry.logout)}</td>
        <td>${entry.total || "-"}</td>
        <td><span class="${statusBadgeClass(entry.status)}">${entry.status}</span></td>
        <td class="d-print-none text-center">
          <button class="btn btn-sm btn-danger" data-index="${index}">Delete</button>
        </td>
      `;
      entryList.appendChild(tr);
    });

    // Attach delete listeners
    document.querySelectorAll("button[data-index]").forEach(btn => {
      btn.addEventListener("click", () => {
        const index = parseInt(btn.getAttribute("data-index"));
        entries.splice(index, 1);
        renderEntries();
      });
    });
  }

  // Handlers
  addBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const login = loginTimeInput.value;
    const logout = logoutTimeInput.value;
    const status = statusInput.value;

    if (!name || !status) {
      alert("Please fill in Name and Status.");
      return;
    }

    if (status === "Present" && (!login || !logout)) {
      alert("Login and Logout times are required for Present status.");
      return;
    }

    const total = (status === "Present") ? calculateTotalTime(login, logout) : "";

    entries.push({ name, login, logout, total, status });
    renderEntries();

    nameInput.value = "";
    loginTimeInput.value = "";
    logoutTimeInput.value = "";
    statusInput.value = "";
  });

  exportExcelBtn.addEventListener("click", () => {
    if (entries.length === 0) {
      alert("No attendance data to export.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(entries);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    XLSX.writeFile(workbook, `Attendance Report-${formatFileDate()}.xlsx`);
  });

  exportPDFBtn.addEventListener("click", () => {
    const pdfContent = document.getElementById("pdf-content");

    if (!pdfContent) {
      alert("Content not found to export.");
      return;
    }

    const options = {
      margin: 0.3,
      filename: `Attendance Report-${formatFileDate()}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" }
    };

    html2pdf().set(options).from(pdfContent).save();
  });

  // Initial render
  renderEntries();
});
