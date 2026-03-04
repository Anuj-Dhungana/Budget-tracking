"use client";

import React, { useState } from "react";
import { Loader, Plus, Repeat } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../../../../components/ui/button";
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

function AddExpenses({ budgetId, refreshData }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
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

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setExpenseDate(getTodayDateValue());
    setIsRecurring(false);
    setFrequency("MONTHLY");
    setInterval("1");
    setStartDate(getTodayDateValue());
    setRunTime("09:00");
    setEndType("never");
    setEndDate("");
    setMaxOccurrences("");
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (isRecurring) {
        await apiRequest("/api/recurring", {
          method: "POST",
          body: {
            description: description.trim(),
            amount: Number(amount),
            budgetId,
            frequency,
            interval: Number(interval),
            startDate,
            runTime,
            endType,
            endDate: endType === "onDate" ? endDate : null,
            maxOccurrences: endType === "after" ? Number(maxOccurrences) : null,
          },
        });

        toast.success("Recurring rule created successfully");
      } else {
        await apiRequest("/api/expenses", {
          method: "POST",
          body: {
            name: description.trim(),
            amount: Number(amount),
            budgetId,
            date: expenseDate,
          },
        });

        toast.success("Expense added successfully");
      }

      resetForm();
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

  const isFormValid =
    description.trim() &&
    Number(amount) > 0 &&
    (!isRecurring || (Number(interval) > 0 && runTime && startDate)) &&
    (endType !== "after" || Number(maxOccurrences) > 0) &&
    (endType !== "onDate" || Boolean(endDate)) &&
    (!isRecurring || Boolean(startDate)) &&
    (isRecurring || Boolean(expenseDate));

  return (
    <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-card-foreground">
            Add New Expense
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a transaction or turn it into a recurring schedule.
          </p>
        </div>
        <div className="hidden rounded-2xl bg-muted/60 p-3 text-primary md:flex">
          {isRecurring ? <Repeat className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Description
            </label>
            <Input
              type="text"
              placeholder="Coffee, groceries, lunch, taxi..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

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
        </div>

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
              Automatic expenses are generated on the selected schedule.
            </p>
          </div>
        </label>

        {isRecurring ? (
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
              Generated expenses will appear automatically even if the app is closed once your scheduler is configured. If the first run is due today, the first expense is created automatically.
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

      <Button
        disabled={!isFormValid || loading}
        onClick={handleSubmit}
        className="mt-6 w-full gap-2 md:w-auto md:px-6"
      >
        {loading ? (
          <>
            <Loader className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : isRecurring ? (
          <>
            <Repeat className="h-4 w-4" />
            Create Recurring Rule
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            Add Expense
          </>
        )}
      </Button>
    </div>
  );
}

export default AddExpenses;
