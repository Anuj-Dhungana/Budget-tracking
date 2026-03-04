"use client";

import React, { useState } from "react";
import { Loader, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { apiRequest } from "../../../../../lib/api.js";

function AddExpenses({ budgetId, refreshData }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const addNewExpenses = async () => {
    try {
      setLoading(true);
      await apiRequest("/api/expenses", {
        method: "POST",
        body: {
          name: description.trim(),
          amount: Number(amount),
          budgetId,
        },
      });

      setDescription("");
      setAmount("");
      if (typeof refreshData === "function") {
        await refreshData();
      }
      toast.success("Expense added successfully");
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error(error.message || "Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = description.trim() && Number(amount) > 0;

  return (
    <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-card-foreground">
            Add New Expense
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a transaction and keep this budget up to date.
          </p>
        </div>
        <div className="hidden rounded-2xl bg-muted/60 p-3 text-primary md:flex">
          <Plus className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-[1.6fr_1fr_auto] md:items-end">
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

        <Button
          disabled={!isFormValid || loading}
          onClick={addNewExpenses}
          className="w-full gap-2 md:w-auto md:px-6"
        >
          {loading ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Add Expense
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default AddExpenses;
