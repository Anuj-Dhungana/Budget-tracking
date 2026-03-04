"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Plus } from "lucide-react";

import { Button } from "../../../../../components/ui/button";
import { apiRequest } from "../../../../../lib/api.js";
import { EXPENSES_UPDATED_EVENT } from "../../../../../lib/expense-events.js";
import BudgetItem from "./BudgetItem";
import CreateBudget from "./CreateBudget";

function Budgetlist() {
  const [budgetList, setBudgetList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  const getBudgetList = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/api/budgets", {
        cache: "no-store",
      });

      setBudgetList(data?.budgets || []);
    } catch (error) {
      console.error("Error fetching budgets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    void getBudgetList();

    const handleExpensesUpdated = () => {
      void getBudgetList();
    };

    window.addEventListener(EXPENSES_UPDATED_EVENT, handleExpensesUpdated);

    return () => {
      window.removeEventListener(EXPENSES_UPDATED_EVENT, handleExpensesUpdated);
    };
  }, [user]);

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            My Budgets
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
            Manage your spending categories and track progress.
          </p>
        </div>

        <CreateBudget
          refreshData={getBudgetList}
          trigger={
            <Button className="gap-2 rounded-xl px-5">
              <Plus className="h-4 w-4" />
              Create Budget
            </Button>
          }
        />
      </section>

      {loading ? (
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="h-[280px] overflow-hidden rounded-[28px] border border-border bg-card shadow-sm"
            >
              <div className="h-full animate-pulse bg-muted" />
            </div>
          ))}
        </section>
      ) : budgetList.length > 0 ? (
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {budgetList.map((budget) => (
            <BudgetItem
              key={budget.id}
              budget={budget}
              refreshData={getBudgetList}
            />
          ))}
        </section>
      ) : (
        <section className="rounded-[28px] border border-dashed border-border bg-card p-10 text-center shadow-sm">
          <div className="mx-auto max-w-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-3xl">
              {"\u{1F4B0}"}
            </div>
            <h2 className="mt-6 text-2xl font-semibold text-card-foreground">
              No budgets created yet.
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
              Start tracking your spending by creating your first budget.
            </p>
            <div className="mt-6 flex justify-center">
              <CreateBudget
                refreshData={getBudgetList}
                trigger={
                  <Button className="gap-2 rounded-xl px-5">
                    <Plus className="h-4 w-4" />
                    Create Budget
                  </Button>
                }
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default Budgetlist;
