// Paste your deployed Google Apps Script Web App URL here to sync tickets across devices
const SCRIPT_URL = "";

const SERVICES = [
  {
    id: "pan-new",
    icon: "💳",
    title: "New PAN Card (UTI / NSDL)",
    category: "GOVT",
    desc: "Instant new PAN card application with Aadhaar e-KYC biometric verification.",
    fee: "₹107",
    docs: ["Aadhaar Card (Linked with Mobile)", "2 Passport-Size Photos", "Active Mobile Number & Email"]
  },
  {
    id: "ayushman",
    icon: "🏥",
    title: "Ayushman Bharat ₹5 Lakh Health Card",
    category: "GOVT",
    desc: "PM-JAY Golden Card registration, e-KYC verification, and instant card download.",
    fee: "₹30",
    docs: ["Aadhaar Card", "Ration Card / PM Letter / Family ID", "Registered Mobile Number"]
  },
  {
    id: "aadhaar-update",
    icon: "🪪",
    title: "Aadhaar Address & Document Update",
    category: "GOVT",
    desc: "Online demographic address update and POI/POA document upload assistance.",
    fee: "₹50",
    docs: ["Aadhaar Card", "Valid Address Proof (Voter ID / Electricity Bill / Domicile)", "Aadhaar-Linked Mobile"]
  },
  {
    id: "certificates",
    icon: "📜",
    title: "Income, Caste & Domicile Certificate",
    category: "GOVT",
    desc: "RTPS / e-District online application and digital certificate download.",
    fee: "₹60",
    docs: ["Aadhaar Card", "Passport Photo", "Self-Declaration Form", "Land / Ration / Parent Proof"]
  },
  {
    id: "gst-reg",
    icon: "🏢",
    title: "New GST Registration",
    category: "GST",
    desc: "Complete GSTIN registration for shops, proprietors, and e-commerce sellers.",
    fee: "₹300",
    docs: ["PAN & Aadhaar Card", "Passport Photo", "Electricity Bill / Rent Agreement & NOC", "Bank Passbook / Cancelled Cheque"]
  },
  {
    id: "gst-return",
    icon: "📊",
    title: "GST Return Filing (GSTR-1 / 3B)",
    category: "GST",
    desc: "Monthly and quarterly nil or regular GST return filing with acknowledgement.",
    fee: "₹150",
    docs: ["GST Portal Login Details", "Sales & Purchase Invoice Summary", "Previous Return Copy"]
  },
  {
    id: "aeps-banking",
    icon: "🏦",
    title: "Banking AEPS & Money Transfer",
    category: "BANKING",
    desc: "Aadhaar-enabled cash withdrawal, balance enquiry, mini statement & DMT.",
    fee: "₹10 / Txn",
    docs: ["Aadhaar Number", "Bank Name", "Biometric Fingerprint Verification"]
  },
  {
    id: "udyam-msme",
    icon: "🏭",
    title: "Udyam MSME Registration",
    category: "GST",
    desc: "Government MSME business registration certificate for loans and subsidies.",
    fee: "₹100",
    docs: ["Aadhaar Card", "PAN Card", "Bank Account & IFSC Details", "Business Name & Address"]
  }
];

let activeCategory = "ALL";
let searchQuery = "";

// Render Service Cards
function renderServices() {
  const grid = document.getElementById("servicesGrid");
  const filtered = SERVICES.filter((s) => {
    const matchesCat = activeCategory === "ALL" || s.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      s.title.toLowerCase().includes(q) ||
      s.desc.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="panel-card" style="text-align:center;">No service matched "<strong>${searchQuery}</strong>". Try searching PAN, GST, Aadhaar, or Ayushman.</div>`;
    return;
  }

  grid.innerHTML = filtered
    .map(
      (s) => `
      <article class="service-card">
        <div>
          <div class="service-icon-box">${s.icon}</div>
          <h3>${s.title}</h3>
          <p>${s.desc}</p>
        </div>
        <div class="service-footer">
          <span class="service-fee">Fee: ${s.fee}</span>
          <button type="button" class="btn-primary" onclick="applyForService('${s.title.replace(/'/g, "\\'")}')">Apply Now</button>
        </div>
      </article>`
    )
    .join("");
}

// Prefill Ticket Form when user clicks "Apply Now"
function applyForService(serviceTitle) {
  const issueInput = document.getElementById("issueType");
  issueInput.value = `New Application: ${serviceTitle}`;
  document.getElementById("tickets").scrollIntoView({ behavior: "smooth" });
  document.getElementById("custName").focus();
}

// Search & Category Filters
document.getElementById("searchForm").addEventListener("submit", (e) => {
  e.preventDefault();
  searchQuery = document.getElementById("serviceSearchInput").value.trim();
  renderServices();
  document.getElementById("services").scrollIntoView({ behavior: "smooth" });
});

document.getElementById("serviceSearchInput").addEventListener("input", (e) => {
  searchQuery = e.target.value.trim();
  renderServices();
});

document.querySelectorAll("#filterPills .pill").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#filterPills .pill").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeCategory = btn.dataset.cat;
    renderServices();
  });
});

// Document Checklist Dropdown
function initChecklist() {
  const select = document.getElementById("checklistSelect");
  const list = document.getElementById("checklistItems");

  select.innerHTML = SERVICES.map((s) => `<option value="${s.id}">${s.title} (Fee: ${s.fee})</option>`).join("");

  const renderDocs = () => {
    const selected = SERVICES.find((s) => s.id === select.value) || SERVICES[0];
    list.innerHTML = selected.docs.map((d) => `<li>${d}</li>`).join("");
  };

  select.addEventListener("change", renderDocs);
  renderDocs();
}

// Local Ticket Fallback Helpers
const LOCAL_KEY = "gulshandsf_tickets_v1";

function getLocalTickets() {
  const saved = JSON.parse(localStorage.getItem(LOCAL_KEY) || "null");
  if (Array.isArray(saved) && saved.length) return saved;
  const seed = [
    {
      id: "TKT-1001",
      name: "Demo Applicant",
      issueType: "New PAN Card (UTI / NSDL)",
      status: "In Progress",
      remarks: "e-KYC verified, acknowledgement generated.",
      timestamp: new Date().toLocaleDateString("en-IN")
    }
  ];
  localStorage.setItem(LOCAL_KEY, JSON.stringify(seed));
  return seed;
}

// Submit Ticket / Complaint
document.getElementById("ticketForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const submitBtn = e.target.querySelector("button[type='submit']");
  const msgEl = document.getElementById("ticketCreatedMsg");

  const payload = {
    name: document.getElementById("custName").value.trim(),
    phone: document.getElementById("custPhone").value.trim(),
    email: document.getElementById("custEmail").value.trim(),
    issueType: document.getElementById("issueType").value.trim(),
    description: document.getElementById("issueDesc").value.trim()
  };

  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";
  msgEl.textContent = "";

  try {
    if (SCRIPT_URL) {
      const res = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.success) {
        const extra = result.customerEmailSent ? " Confirmation email sent." : "";
        msgEl.textContent = `Ticket submitted! Your Ticket ID is ${result.ticketId}.${extra}`;
        e.target.reset();
      } else {
        msgEl.textContent = "Error: " + (result.error || "Could not create ticket.");
      }
    } else {
      const tickets = getLocalTickets();
      const ticketId = `TKT-${1001 + tickets.length}`;
      tickets.push({
        id: ticketId,
        name: payload.name,
        issueType: payload.issueType,
        status: "Open - Received",
        remarks: "Received at GulshanDSF Digital Seva Kendra.",
        timestamp: new Date().toLocaleString("en-IN")
      });
      localStorage.setItem(LOCAL_KEY, JSON.stringify(tickets));
      msgEl.textContent = `Ticket submitted! Save your Ticket ID: ${ticketId}`;
      e.target.reset();
    }
  } catch (err) {
    msgEl.textContent = "Network error. Please try again or contact +91 95259 07368.";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Request / Ticket";
  }
});

// Track Ticket Status
document.getElementById("trackForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const ticketId = document.getElementById("trackIdInput").value.trim().toUpperCase();
  const box = document.getElementById("trackResult");
  box.textContent = "Checking status...";

  try {
    if (SCRIPT_URL) {
      const res = await fetch(`${SCRIPT_URL}?ticketId=${encodeURIComponent(ticketId)}`);
      const result = await res.json();
      if (!result.found) {
        box.innerHTML = `No ticket found for <strong>${ticketId}</strong>.`;
        return;
      }
      const t = result.ticket;
      box.innerHTML = `
        <div><strong>Ticket ID:</strong> ${t.id}</div>
        <div><strong>Applicant:</strong> ${t.name}</div>
        <div><strong>Service / Issue:</strong> ${t.issueType}</div>
        <div><strong>Status:</strong> ${t.status}</div>
        <div><strong>Remarks:</strong> ${t.remarks || "—"}</div>
        <div><strong>Updated:</strong> ${t.timestamp}</div>
      `;
    } else {
      const found = getLocalTickets().find((t) => t.id.toUpperCase() === ticketId);
      if (!found) {
        box.innerHTML = `No ticket found for <strong>${ticketId}</strong>. Try <strong>TKT-1001</strong> or submit a new ticket.`;
        return;
      }
      box.innerHTML = `
        <div><strong>Ticket ID:</strong> ${found.id}</div>
        <div><strong>Applicant:</strong> ${found.name}</div>
        <div><strong>Service / Issue:</strong> ${found.issueType}</div>
        <div><strong>Status:</strong> ${found.status}</div>
        <div><strong>Remarks:</strong> ${found.remarks}</div>
        <div><strong>Submitted On:</strong> ${found.timestamp}</div>
      `;
    }
  } catch (err) {
    box.textContent = "Unable to check status right now. Please try again.";
  }
});

// Agent Login Modal
const agentModal = document.getElementById("agentModal");
document.getElementById("openAgentLoginBtn").addEventListener("click", () => {
  agentModal.hidden = false;
});
document.getElementById("closeAgentModalBtn").addEventListener("click", () => {
  agentModal.hidden = true;
});
agentModal.addEventListener("click", (e) => {
  if (e.target === agentModal) agentModal.hidden = true;
});

document.getElementById("agentLoginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const user = document.getElementById("agentUser").value.trim().toLowerCase();
  const pin = document.getElementById("agentPin").value.trim();
  const msg = document.getElementById("agentLoginMsg");
  if (user === "gulshankkumar8@gmail.com" && pin === "1234") {
    msg.textContent = "Welcome, Gulshan Gupta! Redirecting to ticket section...";
    setTimeout(() => {
      agentModal.hidden = true;
      msg.textContent = "";
      document.getElementById("tickets").scrollIntoView({ behavior: "smooth" });
    }, 700);
  } else {
    msg.textContent = "Invalid Email or PIN. Please try again.";
  }
});

// Initialize
renderServices();
initChecklist();
