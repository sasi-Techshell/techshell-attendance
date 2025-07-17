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

  let entries = [];

  function formatTimeTo12Hour(timeStr) {
    if (!timeStr) return "";
    const [hour, minute] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hour);
    date.setMinutes(minute);
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

  function statusBadge(status) {
    const map = {
      "Present": "bg-success",
      "Sick Leave": "bg-warning text-dark",
      "Casual Leave": "bg-info text-dark",
      "Personal Leave": "bg-primary",
      "Just Not Attend": "bg-danger"
    };
    return `badge ${map[status] || 'bg-secondary'}`;
  }

  function renderEntries() {
    entryList.innerHTML = "";
    if (entries.length === 0) {
      noRecords.style.display = "block";
      return;
    }
    noRecords.style.display = "none";

    entries.forEach((entry, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${entry.name}</td>
        <td>${formatTimeTo12Hour(entry.login)}</td>
        <td>${formatTimeTo12Hour(entry.logout)}</td>
        <td>${entry.total || '-'}</td>
        <td><span class="badge ${statusBadge(entry.status)}">${entry.status}</span></td>
        <td class="d-print-none text-center">
          <button class="btn btn-sm btn-danger" onclick="deleteEntry(${i})">Delete</button>
        </td>
      `;
      entryList.appendChild(tr);
    });
  }

  window.deleteEntry = (index) => {
    entries.splice(index, 1);
    renderEntries();
  };

  addBtn.addEventListener("click", () => {
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

  function formatFileDate() {
    const date = new Date();
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).replace(/ /g, '-');
  }

  document.getElementById("exportExcel").addEventListener("click", () => {
    if (entries.length === 0) {
      alert("No attendance data to export.");
      return;
    }
    const ws = XLSX.utils.json_to_sheet(entries);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `Attendance Report-${formatFileDate()}.xlsx`);
  });

  document.getElementById("exportPDF").addEventListener("click", () => {
    const pdfContent = document.getElementById("pdf-content");

    if (!pdfContent) {
      alert("Content not found to export.");
      return;
    }

    const opt = {
      margin: 0.3,
      filename: `Attendance Report-${formatFileDate()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(pdfContent).save();
  });

  renderEntries();
});