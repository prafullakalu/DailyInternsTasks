export function validateEmail(value) {
  return /\S+@\S+\.\S+/.test(value);
}

export function validatePassword(value) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);
}

export function formatDate(value) {
  return new Date(value).toLocaleDateString();
}

export function formatDateTime(value) {
  return new Date(value).toLocaleString();
}

export function formatCurrency(value) {
  const amount = Number(value);
  if (Number.isNaN(amount)) {
    return "-";
  }

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(amount);
}

export function getError(errors, field) {
  return errors[field] || "";
}
