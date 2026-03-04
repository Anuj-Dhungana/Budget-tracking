"use client";

import React, { useState } from "react";
import { Loader } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { apiRequest } from "../../../../../lib/api.js";

function AddExpenses({ budgetId, refreshData }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const addNewExpenses = async () => {
    try {
      setLoading(true);
      await apiRequest("/api/expenses", {
        method: "POST",
        body: {
          name,
          amount,
          budgetId,
        },
      });

      setName("");
      setAmount("");
      refreshData();
      toast("Expense added successfully");
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error(error.message || "Failed to add expense");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border p-3 rounded-lg ml-4">
      <h2 className="font-bold text-lg">Add Expense</h2>

      <div className="mt-2">
        <h2 className="text-black font-medium my-1">Expense Name</h2>
        <Input
          type="text"
          placeholder="e.g Bedroom Decoration"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="mt-2">
        <h2 className="text-black font-medium my-2">Expense Amount</h2>
        <Input
          type="number"
          placeholder="e.g Rs 500"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
      </div>
      <Button
        disabled={!(name && amount) || loading}
        onClick={addNewExpenses}
        className="mt-3 w-full"
      >
        {loading ? <Loader className="animate-spin" /> : "Add New Expense"}
      </Button>
    </div>
  );
}

export default AddExpenses;
