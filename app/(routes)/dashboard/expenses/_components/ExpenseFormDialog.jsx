"use client";

import React, { useEffect, useState } from "react";
import { Plus, PencilLine } from "lucide-react";
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (isEditMode && expense) {
      setDescription(expense.description || "");
      setAmount(String(expense.amount || ""));
      setBudgetId(String(expense.budgetId || ""));
      return;
    }

    setDescription("");
    setAmount("");
    setBudgetId(String(budgets[0]?.id || ""));
  }, [open, isEditMode, expense, budgets]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await apiRequest(
        isEditMode ? `/api/expenses/${expense.id}` : "/api/expenses",
        {
          method: isEditMode ? "PATCH" : "POST",
          body: {
            name: description.trim(),
            amount: Number(amount),
            budgetId: Number(budgetId),
          },
        }
      );

      toast.success(
        isEditMode ? "Expense updated successfully" : "Expense added successfully"
      );

      setOpen(false);
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

  const isFormValid = description.trim() && Number(amount) > 0 && Number(budgetId) > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Expense" : "Add Expense"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the expense details and budget assignment."
              : "Add a new expense and assign it to a budget."}
          </DialogDescription>
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
          </div>
        </div>

        <DialogFooter>
          <Button
            disabled={!isFormValid || loading}
            onClick={handleSubmit}
            className="w-full"
          >
            {loading
              ? isEditMode
                ? "Updating..."
                : "Adding..."
              : isEditMode
                ? "Update Expense"
                : "Add Expense"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ExpenseFormDialog;
