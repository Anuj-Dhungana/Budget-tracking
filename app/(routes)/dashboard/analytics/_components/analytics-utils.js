export const RANGE_OPTIONS = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "last3months", label: "Last 3 Months" },
  { value: "year", label: "This Year" },
];

const PIE_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function formatCurrency(amount) {
  return `\u0930\u0941 ${new Intl.NumberFormat("en-NP", {
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)}`;
}

function startOfDay(date) {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

function endOfDay(date) {
  const nextDate = new Date(date);
  nextDate.setHours(23, 59, 59, 999);
  return nextDate;
}

function startOfWeek(date) {
  const nextDate = startOfDay(date);
  const day = nextDate.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  nextDate.setDate(nextDate.getDate() + diff);
  return nextDate;
}

function endOfWeek(date) {
  const nextDate = startOfWeek(date);
  nextDate.setDate(nextDate.getDate() + 6);
  return endOfDay(nextDate);
}

function startOfMonth(date) {
  const nextDate = startOfDay(date);
  nextDate.setDate(1);
  return nextDate;
}

function endOfMonth(date) {
  const nextDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return endOfDay(nextDate);
}

function startOfYear(date) {
  const nextDate = startOfDay(date);
  nextDate.setMonth(0, 1);
  return nextDate;
}

function endOfYear(date) {
  const nextDate = new Date(date.getFullYear(), 11, 31);
  return endOfDay(nextDate);
}

function addDays(date, amount) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

function addMonths(date, amount) {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + amount);
  return nextDate;
}

export function getRangeLabel(range) {
  return RANGE_OPTIONS.find((option) => option.value === range)?.label || "This Month";
}

export function getRangeWindow(range, referenceDate = new Date()) {
  const now = new Date(referenceDate);

  switch (range) {
    case "week":
      return {
        start: startOfWeek(now),
        end: endOfWeek(now),
      };
    case "last3months":
      return {
        start: startOfMonth(addMonths(now, -2)),
        end: endOfDay(now),
      };
    case "year":
      return {
        start: startOfYear(now),
        end: endOfYear(now),
      };
    case "month":
    default:
      return {
        start: startOfMonth(now),
        end: endOfDay(now),
      };
  }
}

function getPreviousRangeWindow(range, referenceDate = new Date()) {
  const now = new Date(referenceDate);

  switch (range) {
    case "week": {
      const currentStart = startOfWeek(now);
      const previousEnd = endOfDay(addDays(currentStart, -1));
      return {
        start: startOfWeek(previousEnd),
        end: previousEnd,
      };
    }
    case "last3months":
      return {
        start: startOfMonth(addMonths(now, -5)),
        end: endOfMonth(addMonths(now, -3)),
      };
    case "year": {
      const previousYear = new Date(now.getFullYear() - 1, 0, 1);
      return {
        start: startOfYear(previousYear),
        end: endOfYear(previousYear),
      };
    }
    case "month":
    default: {
      const previousMonth = addMonths(now, -1);
      return {
        start: startOfMonth(previousMonth),
        end: endOfMonth(previousMonth),
      };
    }
  }
}

export function filterExpensesByRange(expenses, range) {
  const { start, end } = getRangeWindow(range);

  return (expenses || []).filter((expense) => {
    const createdAt = new Date(expense.createdAt);

    if (Number.isNaN(createdAt.getTime())) {
      return false;
    }

    return createdAt >= start && createdAt <= end;
  });
}

function getPreviousRangeExpenses(expenses, range) {
  const { start, end } = getPreviousRangeWindow(range);

  return (expenses || []).filter((expense) => {
    const createdAt = new Date(expense.createdAt);

    if (Number.isNaN(createdAt.getTime())) {
      return false;
    }

    return createdAt >= start && createdAt <= end;
  });
}

export function getAnalyticsSummary(expenses) {
  const safeExpenses = expenses || [];
  const totalSpent = safeExpenses.reduce(
    (total, expense) => total + Number(expense.amount || 0),
    0
  );
  const averageExpense = safeExpenses.length > 0 ? totalSpent / safeExpenses.length : 0;
  const largestExpense = safeExpenses.reduce((largest, expense) => {
    if (!largest || Number(expense.amount || 0) > Number(largest.amount || 0)) {
      return expense;
    }

    return largest;
  }, null);

  return {
    totalSpent,
    averageExpense,
    largestExpense,
  };
}

export function buildTrendData(expenses, range) {
  const safeExpenses = expenses || [];
  const now = new Date();

  if (range === "week") {
    const start = startOfWeek(now);

    return Array.from({ length: 7 }, (_, index) => {
      const currentDate = addDays(start, index);
      const total = safeExpenses.reduce((sum, expense) => {
        const expenseDate = new Date(expense.createdAt);

        if (
          expenseDate.getFullYear() === currentDate.getFullYear() &&
          expenseDate.getMonth() === currentDate.getMonth() &&
          expenseDate.getDate() === currentDate.getDate()
        ) {
          return sum + Number(expense.amount || 0);
        }

        return sum;
      }, 0);

      return {
        label: currentDate.toLocaleDateString("en-US", { weekday: "short" }),
        total,
      };
    });
  }

  if (range === "last3months") {
    const startMonth = startOfMonth(addMonths(now, -2));

    return Array.from({ length: 3 }, (_, index) => {
      const currentMonth = addMonths(startMonth, index);
      const total = safeExpenses.reduce((sum, expense) => {
        const expenseDate = new Date(expense.createdAt);

        if (
          expenseDate.getFullYear() === currentMonth.getFullYear() &&
          expenseDate.getMonth() === currentMonth.getMonth()
        ) {
          return sum + Number(expense.amount || 0);
        }

        return sum;
      }, 0);

      return {
        label: currentMonth.toLocaleDateString("en-US", { month: "short" }),
        total,
      };
    });
  }

  if (range === "year") {
    const start = startOfYear(now);

    return Array.from({ length: 12 }, (_, index) => {
      const currentMonth = addMonths(start, index);
      const total = safeExpenses.reduce((sum, expense) => {
        const expenseDate = new Date(expense.createdAt);

        if (
          expenseDate.getFullYear() === currentMonth.getFullYear() &&
          expenseDate.getMonth() === currentMonth.getMonth()
        ) {
          return sum + Number(expense.amount || 0);
        }

        return sum;
      }, 0);

      return {
        label: currentMonth.toLocaleDateString("en-US", { month: "short" }),
        total,
      };
    });
  }

  const start = startOfMonth(now);
  const totalDays = Math.max(1, now.getDate());

  return Array.from({ length: totalDays }, (_, index) => {
    const currentDate = addDays(start, index);
    const total = safeExpenses.reduce((sum, expense) => {
      const expenseDate = new Date(expense.createdAt);

      if (
        expenseDate.getFullYear() === currentDate.getFullYear() &&
        expenseDate.getMonth() === currentDate.getMonth() &&
        expenseDate.getDate() === currentDate.getDate()
      ) {
        return sum + Number(expense.amount || 0);
      }

      return sum;
    }, 0);

    return {
      label: currentDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      total,
    };
  });
}

export function buildBudgetDistributionData(expenses, budgets) {
  const budgetMap = new Map((budgets || []).map((budget) => [String(budget.id), budget]));
  const grouped = new Map();
  const totalSpent = (expenses || []).reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );

  (expenses || []).forEach((expense) => {
    const key = String(expense.budgetId);
    const current = grouped.get(key) || {
      id: key,
      name: expense.budgetName || budgetMap.get(key)?.name || "Unassigned",
      value: 0,
      icon: budgetMap.get(key)?.icon || "\u{1F4B0}",
    };

    current.value += Number(expense.amount || 0);
    grouped.set(key, current);
  });

  return Array.from(grouped.values())
    .sort((left, right) => right.value - left.value)
    .map((entry, index) => ({
      ...entry,
      share: totalSpent > 0 ? (entry.value / totalSpent) * 100 : 0,
      color: PIE_COLORS[index % PIE_COLORS.length],
    }));
}

export function buildTopSpendingBudgets(expenses, budgets) {
  const distribution = buildBudgetDistributionData(expenses, budgets);
  const budgetMap = new Map((budgets || []).map((budget) => [String(budget.id), budget]));

  return distribution.slice(0, 5).map((item) => {
    const budget = budgetMap.get(String(item.id));
    const totalBudget = Number(budget?.amount || 0);
    const progress = totalBudget > 0 ? Math.min((item.value / totalBudget) * 100, 100) : 0;

    return {
      ...item,
      budgetAmount: totalBudget,
      progress,
    };
  });
}

export function buildInsights(currentExpenses, allExpenses, budgets, range) {
  const insights = [];
  const summary = getAnalyticsSummary(currentExpenses);
  const topBudgets = buildTopSpendingBudgets(currentExpenses, budgets);
  const previousExpenses = getPreviousRangeExpenses(allExpenses, range);
  const previousTotal = getAnalyticsSummary(previousExpenses).totalSpent;

  if (topBudgets[0]) {
    insights.push({
      title: "Spending Insight",
      tone: "info",
      message: `Your highest spending category is ${topBudgets[0].name}.`,
    });
  }

  if (previousTotal > 0 && summary.totalSpent > 0) {
    const difference = ((summary.totalSpent - previousTotal) / previousTotal) * 100;
    const roundedDifference = Math.round(Math.abs(difference));

    insights.push({
      title: difference >= 0 ? "Warning" : "Good News",
      tone: difference >= 0 ? "warning" : "success",
      message:
        difference >= 0
          ? `You spent ${roundedDifference}% more than the previous ${getRangeLabel(range).toLowerCase()}.`
          : `You spent ${roundedDifference}% less than the previous ${getRangeLabel(range).toLowerCase()}.`,
    });
  }

  const lightlyUsedBudget = topBudgets
    .filter((budget) => budget.progress > 0 && budget.progress <= 20)
    .sort((left, right) => left.progress - right.progress)[0];

  if (lightlyUsedBudget) {
    insights.push({
      title: "Budget Health",
      tone: "success",
      message: `${lightlyUsedBudget.name} still has ${Math.max(
        100 - Math.round(lightlyUsedBudget.progress),
        0
      )}% remaining.`,
    });
  }

  const criticalBudget = topBudgets.find((budget) => budget.progress >= 80);

  if (criticalBudget) {
    insights.push({
      title: "Warning",
      tone: "warning",
      message: `${criticalBudget.name} is ${Math.round(criticalBudget.progress)}% used.`,
    });
  }

  return insights.slice(0, 3);
}
