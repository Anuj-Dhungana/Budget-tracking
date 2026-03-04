import "server-only";

import { and, eq, lte } from "drizzle-orm";

import db from "../utils/dbConfig.js";
import { Budget, Expense, RecurringExpense } from "../utils/schema.js";

const NEPAL_UTC_OFFSET_MINUTES = 5 * 60 + 45;
const DEFAULT_RECURRING_TIME = "09:00";
const VALID_FREQUENCIES = new Set(["DAILY", "WEEKLY", "MONTHLY"]);

function padTime(value) {
  return String(value).padStart(2, "0");
}

function parsePositiveInteger(value, { allowNull = false, fallback = null } = {}) {
  if (value === null || value === undefined || value === "") {
    return allowNull ? null : fallback;
  }

  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : null;
}

function parseAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

export function isValidRecurringTime(value) {
  return typeof value === "string" && /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

function parseDateInput(value) {
  if (typeof value !== "string") {
    return null;
  }

  const [yearString, monthString, dayString] = value.split("-");
  const year = Number(yearString);
  const month = Number(monthString);
  const day = Number(dayString);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  return { year, month, day };
}

function parseTimeInput(value) {
  if (!isValidRecurringTime(value)) {
    return null;
  }

  const [hourString, minuteString] = value.split(":");

  return {
    hour: Number(hourString),
    minute: Number(minuteString),
  };
}

export function createNepalUtcDate(dateInput, timeInput = DEFAULT_RECURRING_TIME) {
  const dateParts = parseDateInput(dateInput);
  const timeParts = parseTimeInput(timeInput);

  if (!dateParts || !timeParts) {
    return null;
  }

  const utcTime =
    Date.UTC(
      dateParts.year,
      dateParts.month - 1,
      dateParts.day,
      timeParts.hour,
      timeParts.minute
    ) -
    NEPAL_UTC_OFFSET_MINUTES * 60 * 1000;

  return new Date(utcTime);
}

export function createNepalUtcEndOfDay(dateInput) {
  return createNepalUtcDate(dateInput, "23:59");
}

function toNepalParts(dateValue) {
  const date = new Date(dateValue);
  const shiftedDate = new Date(
    date.getTime() + NEPAL_UTC_OFFSET_MINUTES * 60 * 1000
  );

  return {
    year: shiftedDate.getUTCFullYear(),
    month: shiftedDate.getUTCMonth() + 1,
    day: shiftedDate.getUTCDate(),
    hour: shiftedDate.getUTCHours(),
    minute: shiftedDate.getUTCMinutes(),
  };
}

function daysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function fromNepalParts({ year, month, day, hour, minute }) {
  const utcTime =
    Date.UTC(year, month - 1, day, hour, minute) -
    NEPAL_UTC_OFFSET_MINUTES * 60 * 1000;

  return new Date(utcTime);
}

export function advanceRecurringRun(dateValue, frequency, interval = 1) {
  const parts = toNepalParts(dateValue);

  if (frequency === "DAILY") {
    const nextDate = new Date(
      Date.UTC(parts.year, parts.month - 1, parts.day + interval, parts.hour, parts.minute)
    );

    return fromNepalParts({
      year: nextDate.getUTCFullYear(),
      month: nextDate.getUTCMonth() + 1,
      day: nextDate.getUTCDate(),
      hour: nextDate.getUTCHours(),
      minute: nextDate.getUTCMinutes(),
    });
  }

  if (frequency === "WEEKLY") {
    const nextDate = new Date(
      Date.UTC(
        parts.year,
        parts.month - 1,
        parts.day + interval * 7,
        parts.hour,
        parts.minute
      )
    );

    return fromNepalParts({
      year: nextDate.getUTCFullYear(),
      month: nextDate.getUTCMonth() + 1,
      day: nextDate.getUTCDate(),
      hour: nextDate.getUTCHours(),
      minute: nextDate.getUTCMinutes(),
    });
  }

  const targetMonthIndex = parts.month - 1 + interval;
  const targetYear = parts.year + Math.floor(targetMonthIndex / 12);
  const normalizedMonth = ((targetMonthIndex % 12) + 12) % 12;
  const targetMonth = normalizedMonth + 1;
  const targetDay = Math.min(parts.day, daysInMonth(targetYear, targetMonth));

  return fromNepalParts({
    year: targetYear,
    month: targetMonth,
    day: targetDay,
    hour: parts.hour,
    minute: parts.minute,
  });
}

export function findNextRunAtOnOrAfter({
  startDate,
  frequency,
  interval,
  onOrAfter,
}) {
  let nextRunAt = new Date(startDate);
  const threshold = new Date(onOrAfter);

  while (nextRunAt < threshold) {
    nextRunAt = advanceRecurringRun(nextRunAt, frequency, interval);
  }

  return nextRunAt;
}

export function normalizeRecurringRuleInput(payload, fallbackValues = {}) {
  const description = payload?.description?.trim?.() || payload?.name?.trim?.() || fallbackValues.description || "";
  const amount = parseAmount(payload?.amount ?? fallbackValues.amount);
  const budgetId = parsePositiveInteger(payload?.budgetId ?? fallbackValues.budgetId);
  const frequency = String(payload?.frequency ?? fallbackValues.frequency ?? "").toUpperCase();
  const interval = parsePositiveInteger(payload?.interval ?? fallbackValues.interval ?? 1, {
    fallback: 1,
  });
  const startDateInput = payload?.startDateInput ?? payload?.startDate ?? fallbackValues.startDateInput;
  const runTime = payload?.runTime ?? fallbackValues.runTime ?? DEFAULT_RECURRING_TIME;
  const endType = payload?.endType ?? fallbackValues.endType ?? "never";
  const endDateInput = payload?.endDateInput ?? payload?.endDate ?? fallbackValues.endDateInput ?? null;
  const maxOccurrences = parsePositiveInteger(
    payload?.maxOccurrences ?? fallbackValues.maxOccurrences,
    { allowNull: true }
  );
  const isActive =
    typeof payload?.isActive === "boolean"
      ? payload.isActive
      : typeof fallbackValues.isActive === "boolean"
        ? fallbackValues.isActive
        : true;

  if (
    !description ||
    !amount ||
    !budgetId ||
    !VALID_FREQUENCIES.has(frequency) ||
    !interval ||
    !startDateInput ||
    !isValidRecurringTime(runTime)
  ) {
    return null;
  }

  const startDate = createNepalUtcDate(startDateInput, runTime);

  if (!startDate) {
    return null;
  }

  let endDate = null;

  if (endType === "onDate") {
    endDate = createNepalUtcEndOfDay(endDateInput);

    if (!endDate) {
      return null;
    }
  }

  if (endType === "after" && !maxOccurrences) {
    return null;
  }

  return {
    description,
    amount,
    budgetId,
    frequency,
    interval,
    startDate,
    startDateInput,
    runTime,
    endType,
    endDate,
    endDateInput,
    maxOccurrences: endType === "after" ? maxOccurrences : null,
    isActive,
  };
}

export function serializeRecurringRule(rule) {
  const nextRunDate = rule?.nextRunAt ? new Date(rule.nextRunAt) : null;
  const startDate = rule?.startDate ? new Date(rule.startDate) : null;
  const endDate = rule?.endDate ? new Date(rule.endDate) : null;

  const toDateInput = (date) => {
    if (!date) {
      return null;
    }

    const parts = toNepalParts(date);
    return `${parts.year}-${padTime(parts.month)}-${padTime(parts.day)}`;
  };

  const toDateLabel = (date) => {
    if (!date) {
      return null;
    }

    const parts = toNepalParts(date);
    return new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }
    );
  };

  return {
    ...rule,
    startDateInput: toDateInput(startDate),
    endDateInput: toDateInput(endDate),
    nextRunDateLabel: toDateLabel(nextRunDate),
  };
}

async function processRecurringRule(rule, now) {
  let nextRunAt = new Date(rule.nextRunAt);
  let occurrencesGenerated = Number(rule.occurrencesGenerated || 0);
  let isActive = Boolean(rule.isActive);
  let generatedCount = 0;

  while (isActive && nextRunAt <= now) {
    if (rule.endDate && nextRunAt > new Date(rule.endDate)) {
      isActive = false;
      break;
    }

    if (rule.maxOccurrences && occurrencesGenerated >= rule.maxOccurrences) {
      isActive = false;
      break;
    }

    const [existingExpense] = await db
      .select({ id: Expense.id })
      .from(Expense)
      .where(
        and(eq(Expense.recurringId, rule.id), eq(Expense.createdAt, nextRunAt))
      );

    if (!existingExpense) {
      await db.insert(Expense).values({
        description: rule.description,
        amount: rule.amount,
        budgetId: rule.budgetId,
        createdBy: rule.createdBy,
        createdAt: nextRunAt,
        source: "RECURRING",
        recurringId: rule.id,
      });

      generatedCount += 1;
    }

    occurrencesGenerated += 1;

    const upcomingRunAt = advanceRecurringRun(
      nextRunAt,
      rule.frequency,
      rule.interval
    );

    if (rule.maxOccurrences && occurrencesGenerated >= rule.maxOccurrences) {
      isActive = false;
      nextRunAt = upcomingRunAt;
      break;
    }

    if (rule.endDate && upcomingRunAt > new Date(rule.endDate)) {
      isActive = false;
      nextRunAt = upcomingRunAt;
      break;
    }

    nextRunAt = upcomingRunAt;
  }

  await db
    .update(RecurringExpense)
    .set({
      occurrencesGenerated,
      nextRunAt,
      isActive,
      updatedAt: new Date(),
    })
    .where(eq(RecurringExpense.id, rule.id));

  return generatedCount;
}

export async function generateDueRecurringExpenses({
  email = null,
  recurringId = null,
  now = new Date(),
} = {}) {
  const conditions = [eq(RecurringExpense.isActive, true), lte(RecurringExpense.nextRunAt, now)];

  if (email) {
    conditions.push(eq(RecurringExpense.createdBy, email));
  }

  if (recurringId) {
    conditions.push(eq(RecurringExpense.id, recurringId));
  }

  const dueRules = await db
    .select()
    .from(RecurringExpense)
    .where(and(...conditions));

  let generatedCount = 0;

  for (const rule of dueRules) {
    generatedCount += await processRecurringRule(rule, now);
  }

  return generatedCount;
}

export async function ensureOwnedBudget(email, budgetId) {
  const [budget] = await db
    .select({ id: Budget.id, name: Budget.name, icon: Budget.icon })
    .from(Budget)
    .where(and(eq(Budget.id, budgetId), eq(Budget.createdBy, email)));

  return budget ?? null;
}

export function getRescheduledNextRunAt(existingRule, normalizedRule, now = new Date()) {
  const startDate = new Date(normalizedRule.startDate);
  const referenceDate =
    existingRule?.nextRunAt && new Date(existingRule.nextRunAt) > now
      ? new Date(existingRule.nextRunAt)
      : now;

  return findNextRunAtOnOrAfter({
    startDate,
    frequency: normalizedRule.frequency,
    interval: normalizedRule.interval,
    onOrAfter: startDate > referenceDate ? startDate : referenceDate,
  });
}
