/**
 * Central State Management for Generic Receipt & Support Portal
 */

const DEFAULT_RECEIPT = {
  orderId: "INV-2026-89421",
  date: "2026-11-18 14:30",
  status: "Paid", // "Paid", "Pending", "Refunded"
  paymentMethod: "Visa ending in 4242",
  currency: "$",
  merchant: {
    name: "Nova Commerce Inc.",
    email: "support@novacommerce.example.com",
    address: "100 Innovation Way, Suite 400, Tech City, CA 94016"
  },
  recipient: {
    name: "Alex Morgan",
    email: "alex.morgan@example.com",
    address: "742 Evergreen Terrace, Springfield, OR 97477"
  },
  items: [
    { description: "Standard Web Hosting - Annual Plan", qty: 1, price: 120.00 },
    { description: "Domain Registration (example.io)", qty: 1, price: 35.00 },
    { description: "SSL Certificate & Privacy Shield", qty: 1, price: 15.00 }
  ],
  taxRate: 0.08, // 8%
  shipping: 0.00,
  taxDepositAmount: 250, // Admin-editable tax deposit shown on tax.html
  notes: "Thank you for your order! This receipt confirms your payment. If you have any inquiries regarding this order, please click 'Contact Support'."
};

const DEFAULT_TICKETS = [
  {
    id: "TCK-1001",
    orderId: "INV-2026-89421",
    customerName: "Alex Morgan",
    customerEmail: "alex.morgan@example.com",
    subject: "Question about Annual Plan Renewal",
    status: "Open", // "Open", "Answered", "Closed"
    createdAt: "2026-11-18 14:45",
    messages: [
      {
        sender: "customer",
        senderName: "Alex Morgan",
        text: "Hello, I just received my receipt for INV-2026-89421. Could you confirm if the hosting plan automatically renews next year?",
        timestamp: "2026-11-18 14:45"
      },
      {
        sender: "admin",
        senderName: "Support Team (Admin)",
        text: "Hi Alex! Yes, your annual subscription will automatically renew on November 18, 2027. You can manage or modify auto-renewal at any time in your account settings.",
        timestamp: "2026-11-18 14:52"
      }
    ]
  }
];

// Local Storage Keys
const RECEIPT_STORAGE_KEY = "generic_receipt_data";
const TICKETS_STORAGE_KEY = "generic_support_tickets";

// Data Access
function getReceiptData() {
  const stored = localStorage.getItem(RECEIPT_STORAGE_KEY);
  if (!stored) {
    saveReceiptData(DEFAULT_RECEIPT);
    return JSON.parse(JSON.stringify(DEFAULT_RECEIPT));
  }
  try {
    return JSON.parse(stored);
  } catch (err) {
    console.error("Error parsing stored receipt data:", err);
    return JSON.parse(JSON.stringify(DEFAULT_RECEIPT));
  }
}

function saveReceiptData(data) {
  localStorage.setItem(RECEIPT_STORAGE_KEY, JSON.stringify(data));
  // Dispatch custom event for same-window listeners
  window.dispatchEvent(new CustomEvent("receiptDataUpdated", { detail: data }));
}

function resetReceiptData() {
  saveReceiptData(DEFAULT_RECEIPT);
  return JSON.parse(JSON.stringify(DEFAULT_RECEIPT));
}

function getSupportTickets() {
  const stored = localStorage.getItem(TICKETS_STORAGE_KEY);
  if (!stored) {
    saveSupportTickets(DEFAULT_TICKETS);
    return JSON.parse(JSON.stringify(DEFAULT_TICKETS));
  }
  try {
    return JSON.parse(stored);
  } catch (err) {
    console.error("Error parsing stored tickets data:", err);
    return JSON.parse(JSON.stringify(DEFAULT_TICKETS));
  }
}

function saveSupportTickets(tickets) {
  localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets));
  // Dispatch custom event for same-window listeners
  window.dispatchEvent(new CustomEvent("supportTicketsUpdated", { detail: tickets }));
}

// Calculations
function calculateReceiptTotals(receipt) {
  const subtotal = (receipt.items || []).reduce((sum, item) => {
    return sum + (Number(item.qty) || 0) * (Number(item.price) || 0);
  }, 0);

  const taxAmount = subtotal * (Number(receipt.taxRate) || 0);
  const shipping = Number(receipt.shipping) || 0;
  const grandTotal = subtotal + taxAmount + shipping;

  return {
    subtotal: subtotal.toFixed(2),
    taxAmount: taxAmount.toFixed(2),
    shipping: shipping.toFixed(2),
    grandTotal: grandTotal.toFixed(2)
  };
}

function formatMoney(amount, currency = "$") {
  const num = Number(amount) || 0;
  return `${currency}${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Toast helper
function showToast(message) {
  let toast = document.getElementById("toastNotice");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toastNotice";
    toast.className = "toast-notice";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.display = "block";
  clearTimeout(window.__toastTimeout);
  window.__toastTimeout = setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
}

// Current date-time string generator
function getCurrentTimestamp() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}
