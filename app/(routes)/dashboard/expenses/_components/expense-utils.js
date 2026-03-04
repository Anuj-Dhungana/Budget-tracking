export const DATE_FILTER_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "last3months", label: "Last 3 Months" },
];

export function formatCurrency(amount) {
  return `\u0930\u0941 ${new Intl.NumberFormat("en-NP", {
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)}`;
}

export function formatDate(dateString) {
  if (!dateString) {
    return "";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function startOfDay(date) {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

function addDays(date, amount) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

function startOfWeek(date) {
  const nextDate = startOfDay(date);
  const day = nextDate.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  nextDate.setDate(nextDate.getDate() + diff);
  return nextDate;
}

function startOfMonth(date) {
  const nextDate = startOfDay(date);
  nextDate.setDate(1);
  return nextDate;
}

function addMonths(date, amount) {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + amount);
  return nextDate;
}

export function matchesDateFilter(dateString, filter) {
  if (filter === "all") {
    return true;
  }

  const expenseDate = new Date(dateString);

  if (Number.isNaN(expenseDate.getTime())) {
    return false;
  }

  const now = new Date();

  if (filter === "today") {
    return startOfDay(expenseDate).getTime() === startOfDay(now).getTime();
  }

  if (filter === "week") {
    return expenseDate >= startOfWeek(now);
  }

  if (filter === "month") {
    return expenseDate >= startOfMonth(now);
  }

  if (filter === "last3months") {
    return expenseDate >= startOfMonth(addMonths(now, -2));
  }

  return true;
}
