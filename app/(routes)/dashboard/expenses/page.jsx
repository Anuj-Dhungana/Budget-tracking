'use client'

import React, { useEffect, useState } from 'react'
import { useUser } from "@clerk/nextjs";
import { Trash } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { apiRequest } from "../../../../lib/api.js";

function ExpensesPage() {
  const { user } = useUser();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [budgets, setBudgets] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState('all');

  useEffect(() => {
    if (user) {
      void fetchExpenses();
      void fetchBudgets();
    }
  }, [user]);

  const fetchBudgets = async () => {
    try {
      const data = await apiRequest("/api/budgets", {
        cache: "no-store",
      });

      setBudgets(data?.budgets || []);
    } catch (error) {
      console.error("Error fetching budgets:", error);
    }
  };

  const fetchExpenses = async (filters = {}) => {
    try {
      setLoading(true);

      const searchParams = new URLSearchParams();

      if (filters.search) {
        searchParams.set("search", filters.search);
      }

      if (filters.budgetId && filters.budgetId !== "all") {
        searchParams.set("budgetId", filters.budgetId);
      }

      const queryString = searchParams.toString();
      const data = await apiRequest(
        `/api/expenses${queryString ? `?${queryString}` : ""}`,
        { cache: "no-store" }
      );

      setExpenses(data?.expenses || []);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    void fetchExpenses({
      search: searchTerm,
      budgetId: selectedBudget,
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedBudget('all');
    void fetchExpenses();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);

      if (Number.isNaN(date.getTime())) return "Invalid date";

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  const deleteExpense = async (expense) => {
    try {
      await apiRequest(`/api/expenses/${expense.id}`, {
        method: "DELETE",
      });

      setExpenses((currentExpenses) =>
        currentExpenses.filter((item) => item.id !== expense.id)
      );
      toast("Expense deleted");
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error(error.message || "Failed to delete expense");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">All Expenses</h1>

      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="p-2 border rounded-md w-full md:w-48"
            value={selectedBudget}
            onChange={(e) => setSelectedBudget(e.target.value)}
          >
            <option value="all">All Budgets</option>
            {budgets.map((budget) => (
              <option key={budget.id} value={budget.id}>
                {budget.name}
              </option>
            ))}
          </select>

          <Button onClick={handleSearch} className="md:w-24">Search</Button>
          <Button onClick={clearFilters} variant="outline" className="md:w-24">Clear</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center my-12">
          <div className="animate-pulse h-8 w-8 rounded-full bg-primary"></div>
        </div>
      ) : (
        <div className='mt-3'>
          <div className='grid grid-cols-4 bg-slate-200 p-2 mt-3'>
            <h2 className='font-bold'>Name</h2>
            <h2 className='font-bold'>Amount</h2>
            <h2 className='font-bold'>Date</h2>
            <h2 className='font-bold text-center'>Action</h2>
          </div>
          {expenses && expenses.length > 0 ? (
            expenses.map((expense) => (
              <div key={expense.id} className='grid grid-cols-4 bg-slate-50 p-2'>
                <h2>{expense.description}</h2>
                <h2>Rs {expense.amount}</h2>
                <h2>{formatDate(expense.createdAt)}</h2>
                <h2 className="text-center">
                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={() => deleteExpense(expense)}
                  >
                    <Trash className="h-5 w-5 cursor-pointer inline-block" />
                  </button>
                </h2>
              </div>
            ))
          ) : (
            <div className='p-4 text-center text-gray-500'>
              No expenses found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ExpensesPage;
