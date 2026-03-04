'use client';

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Search } from "lucide-react";

import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { apiRequest } from "../../../../lib/api.js";
import { EXPENSES_UPDATED_EVENT } from "../../../../lib/expense-events.js";
import DeleteExpenseAction from "./_components/DeleteExpenseAction.jsx";
import ExpenseFormDialog from "./_components/ExpenseFormDialog.jsx";
import RecurringExpenseBadge from "./_components/RecurringExpenseBadge.jsx";
import {
  DATE_FILTER_OPTIONS,
  formatCurrency,
  formatDate,
  matchesDateFilter,
} from "./_components/expense-utils.js";

function SummaryCard({ title, value, subtitle, loading = false }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      {loading ? (
        <div className="h-[92px] animate-pulse rounded-2xl bg-muted" />
      ) : (
        <>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="mt-3 text-3xl font-semibold tracking-tight text-card-foreground">
            {value}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        </>
      )}
    </div>
  );
}

function ExpensesPage() {
  const { user } = useUser();
  const [allExpenses, setAllExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("all");
  const [selectedDateFilter, setSelectedDateFilter] = useState("all");

  const loadPageData = async () => {
    try {
      setLoading(true);
      const [expenseData, budgetData] = await Promise.all([
        apiRequest("/api/expenses", { cache: "no-store" }),
        apiRequest("/api/budgets", { cache: "no-store" }),
      ]);

      setAllExpenses(expenseData?.expenses || []);
      setBudgets(budgetData?.budgets || []);
    } catch (error) {
      console.error("Error fetching expenses page data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    void loadPageData();

    const handleExpensesUpdated = () => {
      void loadPageData();
    };

    window.addEventListener(EXPENSES_UPDATED_EVENT, handleExpensesUpdated);

    return () => {
      window.removeEventListener(EXPENSES_UPDATED_EVENT, handleExpensesUpdated);
    };
  }, [user]);

  const normalizedQuery = searchTerm.trim().toLowerCase();
  const filteredExpenses = (allExpenses || []).filter((expense) => {
    const matchesSearch = normalizedQuery
      ? expense.description?.toLowerCase().includes(normalizedQuery) ||
        expense.budgetName?.toLowerCase().includes(normalizedQuery)
      : true;
    const matchesBudget =
      selectedBudget === "all" || String(expense.budgetId) === selectedBudget;
    const matchesDate = matchesDateFilter(expense.createdAt, selectedDateFilter);

    return matchesSearch && matchesBudget && matchesDate;
  });

  const totalExpenses = filteredExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );
  const transactionCount = filteredExpenses.length;
  const averageExpense = transactionCount > 0 ? totalExpenses / transactionCount : 0;
  const showEmptyState = !loading && filteredExpenses.length === 0;

  return (
    <div className="bg-background p-5 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              All Expenses
            </h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              View and manage all your spending records.
            </p>
          </div>

          <ExpenseFormDialog budgets={budgets} refreshData={loadPageData} />
        </section>

        <section className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_220px_220px_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-9"
              />
            </div>

            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
              value={selectedBudget}
              onChange={(event) => setSelectedBudget(event.target.value)}
            >
              <option value="all">All Budgets</option>
              {budgets.map((budget) => (
                <option key={budget.id} value={budget.id}>
                  {budget.name}
                </option>
              ))}
            </select>

            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
              value={selectedDateFilter}
              onChange={(event) => setSelectedDateFilter(event.target.value)}
            >
              {DATE_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedBudget("all");
                setSelectedDateFilter("all");
              }}
            >
              Clear
            </Button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SummaryCard
            title="Total Expenses"
            value={formatCurrency(totalExpenses)}
            subtitle="Filtered spending total"
            loading={loading}
          />
          <SummaryCard
            title="Transactions"
            value={transactionCount}
            subtitle="Matching expense records"
            loading={loading}
          />
          <SummaryCard
            title="Avg Expense"
            value={formatCurrency(averageExpense)}
            subtitle="Average spend per transaction"
            loading={loading}
          />
        </section>

        <section className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-card-foreground">
                Expenses Table
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Review, edit, or remove your spending records.
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-border">
            <div className="overflow-x-auto">
              <table className="min-w-[760px] w-full divide-y divide-border">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Budget
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Date
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {loading ? (
                    [1, 2, 3, 4, 5].map((item) => (
                      <tr key={item}>
                        <td colSpan={5} className="px-4 py-4">
                          <div className="h-12 animate-pulse rounded-xl bg-muted" />
                        </td>
                      </tr>
                    ))
                  ) : showEmptyState ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="mx-auto max-w-md">
                          <h3 className="text-lg font-medium text-card-foreground">
                            No expenses found.
                          </h3>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Start tracking your spending by adding your first expense.
                          </p>
                          <div className="mt-5 flex justify-center">
                            <ExpenseFormDialog
                              budgets={budgets}
                              refreshData={loadPageData}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((expense) => (
                      <tr key={expense.id} className="transition hover:bg-muted/30">
                        <td className="px-4 py-4 text-sm font-medium text-card-foreground">
                          <div className="flex flex-wrap items-center gap-2">
                            <span>{expense.description}</span>
                            <RecurringExpenseBadge expense={expense} />
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-muted-foreground">
                          {expense.budgetName || "Unassigned"}
                        </td>
                        <td className="px-4 py-4 text-sm text-card-foreground">
                          {formatCurrency(expense.amount)}
                        </td>
                        <td className="px-4 py-4 text-sm text-muted-foreground">
                          {formatDate(expense.createdAt)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <ExpenseFormDialog
                              mode="edit"
                              expense={expense}
                              budgets={budgets}
                              refreshData={loadPageData}
                              trigger={
                                <Button variant="ghost" size="icon">
                                  <span className="sr-only">Edit expense</span>
                                  <svg
                                    className="h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M12 20h9" />
                                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                  </svg>
                                </Button>
                              }
                            />
                            <DeleteExpenseAction
                              expenseId={expense.id}
                              onDeleted={loadPageData}
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-300"
                                >
                                  <span className="sr-only">Delete expense</span>
                                  <svg
                                    className="h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M3 6h18" />
                                    <path d="M8 6V4h8v2" />
                                    <path d="M19 6l-1 14H6L5 6" />
                                    <path d="M10 11v6" />
                                    <path d="M14 11v6" />
                                  </svg>
                                </Button>
                              }
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ExpensesPage;
