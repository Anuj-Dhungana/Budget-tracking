"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { ChevronRight, Plus } from "lucide-react";

import { Button } from "../../../../components/ui/button";
import { apiRequest } from "../../../../lib/api.js";
import AnalyticsSummaryCards from "./_components/AnalyticsSummaryCards";
import BudgetDistributionChart from "./_components/BudgetDistributionChart";
import SpendingTrendChart from "./_components/SpendingTrendChart";
import TopSpendingBudgets from "./_components/TopSpendingBudgets";
import {
  RANGE_OPTIONS,
  buildBudgetDistributionData,
  buildInsights,
  buildTopSpendingBudgets,
  buildTrendData,
  filterExpensesByRange,
  getAnalyticsSummary,
} from "./_components/analytics-utils";

function AnalyticsPage() {
  const { user } = useUser();
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState("month");

  useEffect(() => {
    if (!user) {
      return;
    }

    let cancelled = false;

    const loadAnalyticsData = async () => {
      try {
        setLoading(true);
        const [budgetData, expenseData] = await Promise.all([
          apiRequest("/api/budgets", { cache: "no-store" }),
          apiRequest("/api/expenses", { cache: "no-store" }),
        ]);

        if (cancelled) {
          return;
        }

        setBudgets(budgetData?.budgets || []);
        setExpenses(expenseData?.expenses || []);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadAnalyticsData();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const filteredExpenses = filterExpensesByRange(expenses, selectedRange);
  const summary = getAnalyticsSummary(filteredExpenses);
  const trendData = buildTrendData(filteredExpenses, selectedRange);
  const distributionData = buildBudgetDistributionData(filteredExpenses, budgets);
  const topSpendingBudgets = buildTopSpendingBudgets(filteredExpenses, budgets);
  const insights = buildInsights(
    filteredExpenses,
    expenses,
    budgets,
    selectedRange
  );
  const addExpenseHref = budgets[0]?.id
    ? `/dashboard/expenses/${budgets[0].id}`
    : "/dashboard/budgets";
  const showEmptyState = !loading && expenses.length === 0;

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
              <span className="text-foreground">Analytics</span>
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Analytics
            </h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Understand your spending patterns and budget usage.
            </p>
          </div>

          <div className="w-full max-w-xs">
            <label className="mb-2 block text-sm font-medium text-foreground">
              Time Range
            </label>
            <select
              value={selectedRange}
              onChange={(event) => setSelectedRange(event.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
            >
              {RANGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        {showEmptyState ? (
          <section className="rounded-[28px] border border-dashed border-border bg-card p-10 text-center shadow-sm">
            <div className="mx-auto max-w-xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-3xl">
                {"\u{1F4CA}"}
              </div>
              <h2 className="mt-6 text-2xl font-semibold text-card-foreground">
                No analytics data yet.
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
                Start adding expenses to see spending insights.
              </p>
              <div className="mt-6 flex justify-center">
                <Button asChild className="gap-2 rounded-xl px-5">
                  <Link href={addExpenseHref}>
                    <Plus className="h-4 w-4" />
                    Add Expense
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        ) : (
          <>
            <section>
              <AnalyticsSummaryCards summary={summary} loading={loading} />
            </section>

            <section>
              <SpendingTrendChart data={trendData} loading={loading} />
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.95fr)]">
              <BudgetDistributionChart
                data={distributionData}
                loading={loading}
              />
              <TopSpendingBudgets
                budgets={topSpendingBudgets}
                insights={insights}
                loading={loading}
              />
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default AnalyticsPage;
