const STATUS_MAP = {
  CHECKED_IN: "Checked In",
  CHECKED_OUT: "Checked Out",
  NO_SHOW: "No Show",
  COMPLETED: "Completed",
  PENDING: "Pending",
  CANCELLED: "Cancelled",
  PAID: "Paid",
  DRAFT: "Draft",
  FULLY_PAID: "Fully Paid",
  REPORTED: "Reported",
  FAILED: "Failed",
  APPROVED: "Approved",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

export function formatStatus(value) {
  return STATUS_MAP[value] || value || "Unknown";
}

export function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString();
}

export function formatBookingDate(value) {
  if (!value) return "N/A";
  const date = new Date(value);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatProfileDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatCurrency(amount) {
  return `Ksh ${Number(amount || 0).toLocaleString()}`;
}