"use client";

import React, { useEffect, useState } from "react";
import { Repeat } from "lucide-react";
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

function RecurringRuleDialog({
  budgetId,
  refreshData,
  trigger,
  mode = "create",
  rule = null,
}) {
  const isEditMode = mode === "edit";
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
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

    if (isEditMode && rule) {
      setDescription(rule.description || "");
      setAmount(String(rule.amount || ""));
      setFrequency(rule.frequency || "MONTHLY");
      setInterval(String(rule.interval || 1));
      setStartDate(rule.startDateInput || getTodayDateValue());
      setRunTime(rule.runTime || "09:00");

      if (rule.maxOccurrences) {
        setEndType("after");
        setMaxOccurrences(String(rule.maxOccurrences));
        setEndDate("");
      } else if (rule.endDateInput) {
        setEndType("onDate");
        setEndDate(rule.endDateInput);
        setMaxOccurrences("");
      } else {
        setEndType("never");
        setEndDate("");
        setMaxOccurrences("");
      }

      return;
    }

    setDescription("");
    setAmount("");
    setFrequency("MONTHLY");
    setInterval("1");
    setStartDate(getTodayDateValue());
    setRunTime("09:00");
    setEndType("never");
    setEndDate("");
    setMaxOccurrences("");
  }, [open, isEditMode, rule]);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await apiRequest(
        isEditMode ? `/api/recurring/${rule.id}` : "/api/recurring",
        {
          method: isEditMode ? "PATCH" : "POST",
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
        }
      );

      toast.success(
        isEditMode
          ? "Recurring rule updated successfully"
          : "Recurring rule created successfully"
      );

      setOpen(false);
      dispatchExpensesUpdated();

      if (typeof refreshData === "function") {
        await refreshData();
      }
    } catch (error) {
      console.error("Error saving recurring rule:", error);
      toast.error(error.message || "Failed to save recurring rule");
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button variant="outline" className="gap-2 rounded-xl">
      <Repeat className="h-4 w-4" />
      {isEditMode ? "Edit Rule" : "Add Recurring Rule"}
    </Button>
  );

  const isFormValid =
    description.trim() &&
    Number(amount) > 0 &&
    Number(interval) > 0 &&
    startDate &&
    runTime &&
    (endType !== "after" || Number(maxOccurrences) > 0) &&
    (endType !== "onDate" || Boolean(endDate));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Recurring Rule" : "Create Recurring Rule"}
          </DialogTitle>
          <DialogDescription>
            Set up a schedule that automatically generates expense entries.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-foreground">
              Description
            </label>
            <Input
              placeholder="Netflix, rent, internet..."
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
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>

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
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button disabled={!isFormValid || loading} onClick={handleSubmit}>
            {loading
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
                ? "Update Rule"
                : "Create Rule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RecurringRuleDialog;
