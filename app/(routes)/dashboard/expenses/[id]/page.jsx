"use client";

import React, { useEffect, useState } from "react";
import { Trash } from "lucide-react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";

import BudgetItem from "./BudgetItem.jsx";
import AddExpenses from "../_components/AddExpenses.jsx";
import EditBudget from "../_components/EditBudget.jsx";
import ExpensesListTable from "../_components/ExpensesListTable.jsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../../../components/ui/alert-dialog.jsx";
import { Button } from "../../../../../components/ui/button.jsx";
import { apiRequest } from "../../../../../lib/api.js";

function ExpensesScreen() {
  const params = useParams();
  const budgetId = params?.id;
  const [budgetInfo, setBudgetsInfo] = useState(null);
  const [expensesList, setExpensesList] = useState([]);
  const route = useRouter();

  const getBudgetInfo = async () => {
    try {
      const data = await apiRequest(`/api/budgets/${budgetId}`, {
        cache: "no-store",
      });

      setBudgetsInfo(data?.budget || null);
      setExpensesList(data?.expenses || []);
    } catch (error) {
      console.error("Error fetching budget info:", error);
      toast.error(error.message || "Failed to load budget");
      route.replace("/dashboard/budgets");
    }
  };

  useEffect(() => {
    if (!budgetId) {
      return;
    }

    let cancelled = false;

    const loadBudgetInfo = async () => {
      try {
        const data = await apiRequest(`/api/budgets/${budgetId}`, {
          cache: "no-store",
        });

        if (cancelled) {
          return;
        }

        setBudgetsInfo(data?.budget || null);
        setExpensesList(data?.expenses || []);
      } catch (error) {
        console.error("Error fetching budget info:", error);
        toast.error(error.message || "Failed to load budget");
        route.replace("/dashboard/budgets");
      }
    };

    void loadBudgetInfo();

    return () => {
      cancelled = true;
    };
  }, [budgetId, route]);

  const deleteBudget = async () => {
    try {
      await apiRequest(`/api/budgets/${budgetId}`, {
        method: "DELETE",
      });

      toast("Budget deleted successfully");
      route.replace("/dashboard/budgets");
    } catch (error) {
      console.error("Error deleting budget:", error);
      toast.error(error.message || "Failed to delete budget");
    }
  };

  return (
    <div className="p-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold">My Expenses</h2>
        <div className="flex gap-2">
          <EditBudget budgetId={budgetId} refreshData={getBudgetInfo} />

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="flex gap-2" variant="destructive">
                <Trash />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your current budget along with its expenses.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={deleteBudget}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-2">
        {budgetInfo ? (
          <BudgetItem budget={budgetInfo} />
        ) : (
          <div className="h-[150px] w-full bg-slate-200 rounded-lg animate-pulse" />
        )}

        <AddExpenses budgetId={budgetId} refreshData={getBudgetInfo} />
      </div>

      <div className="mt-6">
        <ExpensesListTable
          expensesList={expensesList}
          refreshData={getBudgetInfo}
        />
      </div>
    </div>
  );
}

export default ExpensesScreen;
