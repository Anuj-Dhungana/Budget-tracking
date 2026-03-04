"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, PencilLine } from "lucide-react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";

import BudgetItem from "./BudgetItem.jsx";
import AddExpenses from "../_components/AddExpenses.jsx";
import EditBudget from "../_components/EditBudget.jsx";
import ExpensesListTable from "../_components/ExpensesListTable.jsx";
import DeleteBudgetAction from "../../budgets/_components/DeleteBudgetAction.jsx";
import { Button } from "../../../../../components/ui/button.jsx";
import { apiRequest } from "../../../../../lib/api.js";

async function loadBudgetData({
  budgetId,
  route,
  setBudgetsInfo,
  setExpensesList,
  setLoading,
}) {
  try {
    setLoading(true);
    const data = await apiRequest(`/api/budgets/${budgetId}`, {
      cache: "no-store",
    });

    setBudgetsInfo(data?.budget || null);
    setExpensesList(data?.expenses || []);
  } catch (error) {
    console.error("Error fetching budget info:", error);
    toast.error(error.message || "Failed to load budget");
    route.replace("/dashboard/budgets");
  } finally {
    setLoading(false);
  }
}

function ExpensesScreen() {
  const params = useParams();
  const budgetId = params?.id;
  const [budgetInfo, setBudgetsInfo] = useState(null);
  const [expensesList, setExpensesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const route = useRouter();

  const getBudgetInfo = async () => {
    await loadBudgetData({
      budgetId,
      route,
      setBudgetsInfo,
      setExpensesList,
      setLoading,
    });
  };

  useEffect(() => {
    if (!budgetId) {
      return;
    }

    void loadBudgetData({
      budgetId,
      route,
      setBudgetsInfo,
      setExpensesList,
      setLoading,
    });
  }, [budgetId, route]);

  return (
    <div className="bg-background p-5 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Link href="/dashboard" className="transition hover:text-foreground">
                Dashboard
              </Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/dashboard/budgets" className="transition hover:text-foreground">
                Budgets
              </Link>
              {budgetInfo ? (
                <>
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-foreground">{budgetInfo.name}</span>
                </>
              ) : null}
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              {budgetInfo ? `${budgetInfo.name} ${budgetInfo.icon || ""}`.trim() : "Budget Details"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Track and manage expenses for this budget.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <EditBudget
              budgetId={budgetId}
              refreshData={getBudgetInfo}
              trigger={
                <Button variant="outline" className="gap-2 rounded-xl">
                  <PencilLine className="h-4 w-4" />
                  Edit Budget
                </Button>
              }
            />
            <DeleteBudgetAction
              budgetId={budgetId}
              onDeleted={() => route.replace("/dashboard/budgets")}
            />
          </div>
        </section>

        <section>
          {loading ? (
            <div className="h-[240px] overflow-hidden rounded-[28px] border border-border bg-card shadow-sm">
              <div className="h-full animate-pulse bg-muted" />
            </div>
          ) : budgetInfo ? (
            <BudgetItem budget={budgetInfo} />
          ) : null}
        </section>

        <section>
          <AddExpenses budgetId={budgetId} refreshData={getBudgetInfo} />
        </section>

        <section>
          <ExpensesListTable
            expensesList={expensesList}
            refreshData={getBudgetInfo}
          />
        </section>
      </div>
    </div>
  );
}

export default ExpensesScreen;
