"use client";

import React, { useEffect, useState } from "react";
import { PencilLine, Plus, Repeat } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../../components/ui/dialog";
import { Input } from "../../../../../components/ui/input";
import { apiRequest } from "../../../../../lib/api.js";
import { dispatchExpensesUpdated } from "../../../../../lib/expense-events.js";

const FREQUENCY_OPTIONS = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
];

function getTodayDateValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDateInputValue(dateString) {
  if (!dateString) {
    return getTodayDateValue();
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return getTodayDateValue();
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDefaultBudgetId(budgets) {
  return String(budgets[0]?.id || "");
}

function ExpenseFormDialog({
  budgets = [],
  refreshData,
  trigger,
  mode = "create",
  expense = null,
}) {
  const isEditMode = mode === "edit";
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [budgetId, setBudgetId] = useState("");
  const [expenseDate, setExpenseDate] = useState(getTodayDateValue());
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState("MONTHLY");
  const [interval, setInterval] = useState("1");
  const [startDate, setStartDate] = useState(getTodayDateValue());
  const [runTime, setRunTime] = useState("09:00");
  const [endType, setEndType] = useState("never");
  const [endDate, setEndDate] = useState("");
  const [maxOccurrences, setMaxOccurrences] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (isEditMode && expense) {
      setDescription(expense.description || "");
      setAmount(String(expense.amount || ""));
      setBudgetId(String(expense.budgetId || ""));
      setExpenseDate(getDateInputValue(expense.createdAt));
      setIsRecurring(false);
      setFrequency("MONTHLY");
      setInterval("1");
      setStartDate(getTodayDateValue());
      setRunTime("09:00");
      setEndType("never");
      setEndDate("");
      setMaxOccurrences("");
      return;
    }

    setDescription("");
    setAmount("");
    setBudgetId(getDefaultBudgetId(budgets));
    setExpenseDate(getTodayDateValue());
    setIsRecurring(false);
    setFrequency("MONTHLY");
    setInterval("1");
    setStartDate(getTodayDateValue());
    setRunTime("09:00");
    setEndType("never");
    setEndDate("");
    setMaxOccurrences("");
  }, [open, isEditMode, expense, budgets]);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const shouldCreateRecurring = !isEditMode && isRecurring;

      await apiRequest(
        shouldCreateRecurring
          ? "/api/recurring"
          : isEditMode
            ? `/api/expenses/${expense.id}`
            : "/api/expenses",
        {
          method: isEditMode ? "PATCH" : "POST",
          body: shouldCreateRecurring
            ? {
                description: description.trim(),
                amount: Number(amount),
                budgetId: Number(budgetId),
                frequency,
                interval: Number(interval),
                startDate,
                runTime,
                endType,
                endDate: endType === "onDate" ? endDate : null,
                maxOccurrences: endType === "after" ? Number(maxOccurrences) : null,
              }
            : {
                name: description.trim(),
                amount: Number(amount),
                budgetId: Number(budgetId),
                date: expenseDate,
              },
        }
      );

      toast.success(
        isEditMode
          ? "Expense updated successfully"
          : shouldCreateRecurring
            ? "Recurring rule created successfully"
            : "Expense added successfully"
      );

      setOpen(false);
      dispatchExpensesUpdated();
      if (typeof refreshData === "function") {
        await refreshData();
      }
    } catch (error) {
      console.error("Error saving expense:", error);
      toast.error(error.message || "Failed to save expense");
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = isEditMode ? (
    <Button variant="outline" className="gap-2">
      <PencilLine className="h-4 w-4" />
      Edit
    </Button>
  ) : (
    <Button className="gap-2 rounded-xl px-5">
      <Plus className="h-4 w-4" />
      Add Expense
    </Button>
  );

  const isFormValid =
    description.trim() &&
    Number(amount) > 0 &&
    Number(budgetId) > 0 &&
    (!isEditMode && isRecurring
      ? Number(interval) > 0 &&
        Boolean(startDate) &&
        Boolean(runTime) &&
        (endType !== "after" || Number(maxOccurrences) > 0) &&
        (endType !== "onDate" || Boolean(endDate))
      : Boolean(expenseDate));

  const dialogTitle = isEditMode
    ? "Edit Expense"
    : isRecurring
      ? "Create Recurring Expense"
      : "Add Expense";
  const dialogDescription = isEditMode
    ? "Update the expense details and budget assignment."
    : isRecurring
      ? "Create a rule that automatically generates future expenses."
      : "Add a new expense and assign it to a budget.";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Description
            </label>
            <Input
              placeholder="Coffee, groceries, taxi..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Amount
              </label>
              <Input
                type="number"
                min="1"
                placeholder="e.g. 500"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Budget
              </label>
              <select
                value={budgetId}
                onChange={(event) => setBudgetId(event.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
              >
                <option value="">Select a budget</option>
                {budgets.map((budget) => (
                  <option key={budget.id} value={budget.id}>
                    {budget.name}
                  </option>
                ))}
              </select>
              {budgets.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Create a budget first before adding expenses.
                </p>
              ) : null}
            </div>
          </div>

          {!isEditMode ? (
            <label className="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 px-4 py-3">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(event) => setIsRecurring(event.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <div>
                <p className="text-sm font-medium text-card-foreground">
                  Make this recurring?
                </p>
                <p className="text-xs text-muted-foreground">
                  Create a schedule instead of a one-time expense.
                </p>
              </div>
            </label>
          ) : null}

          {!isEditMode && isRecurring ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Frequency
                </label>
                <select
                  value={frequency}
                  onChange={(event) => setFrequency(event.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                >
                  {FREQUENCY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Interval
                </label>
                <Input
                  type="number"
                  min="1"
                  value={interval}
                  onChange={(event) => setInterval(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Time
                </label>
                <Input
                  type="time"
                  value={runTime}
                  onChange={(event) => setRunTime(event.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-foreground">
                  End Condition
                </label>
                <select
                  value={endType}
                  onChange={(event) => setEndType(event.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                >
                  <option value="never">Never</option>
                  <option value="after">End after N occurrences</option>
                  <option value="onDate">End on date</option>
                </select>
              </div>

              {endType === "after" ? (
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">
                    Max Occurrences
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={maxOccurrences}
                    onChange={(event) => setMaxOccurrences(event.target.value)}
                  />
                </div>
              ) : null}

              {endType === "onDate" ? (
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                  />
                </div>
              ) : null}

              <p className="text-xs text-muted-foreground md:col-span-2">
                If the first run is due today, the first expense is generated automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Date
              </label>
              <Input
                type="date"
                value={expenseDate}
                onChange={(event) => setExpenseDate(event.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            disabled={!isFormValid || loading}
            onClick={handleSubmit}
            className="w-full"
          >
            {loading ? (
              isEditMode ? (
                "Updating..."
              ) : isRecurring ? (
                "Creating..."
              ) : (
                "Adding..."
              )
            ) : isEditMode ? (
              "Update Expense"
            ) : isRecurring ? (
              <span className="inline-flex items-center gap-2">
                <Repeat className="h-4 w-4" />
                Create Recurring Rule
              </span>
            ) : (
              "Add Expense"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ExpenseFormDialog;
