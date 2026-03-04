'use client'

import Link from "next/link";
import React, { useEffect, useState } from 'react'
import { CalendarDays, ChevronRight } from "lucide-react";
import { useUser } from "@clerk/nextjs";

import { Button } from "../../../components/ui/button";
import { apiRequest } from "../../../lib/api.js";
import BarChartDashboard from "./_components/BarChartDashboard";
import BudgetOverview from "./_components/BudgetOverview.jsx";
import Cardinfo from "./_components/Cardinfo";
import RecentExpensesTable from "./_components/RecentExpensesTable.jsx";

function Dashboard() {
  const { user } = useUser();
  const [budgetList, setBudgetList] = useState([]);
  const [expensesList, setExpensesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());
  const firstName =
    user?.firstName ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "there";

  const getDashboardData = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/api/dashboard", {
        cache: "no-store",
      });

      setBudgetList(data?.budgets || []);
      setExpensesList(data?.expenses || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    void getDashboardData();
  }, [user]);

  const showEmptyState = !loading && budgetList.length === 0;

  return (
    <div className='bg-slate-50/80 p-5 md:p-8'>
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[28px] border border-slate-200 bg-gradient-to-r from-[#eef4ff] via-white to-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-sm text-slate-600 shadow-sm">
                <CalendarDays className="h-4 w-4 text-primary" />
                {currentDate}
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                Hi, {firstName} <span className="inline-block">👋</span>
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                Here&apos;s what&apos;s happening with your money today. Track your budgets and control your spending.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Focus today</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                Keep your remaining balance healthy by reviewing your latest expenses.
              </p>
            </div>
          </div>
        </section>

        {showEmptyState ? (
          <section className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto max-w-xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                💼
              </div>
              <h2 className="mt-6 text-2xl font-semibold text-slate-950">
                You haven&apos;t created any budgets yet.
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500 md:text-base">
                Create your first budget to start tracking expenses and unlock your dashboard insights.
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild className="min-w-40">
                  <Link href="/dashboard/budgets">Create Budget</Link>
                </Button>
                <Button asChild variant="outline" className="min-w-40">
                  <Link href="/dashboard/expenses">
                    View Expenses
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        ) : (
          <>
            <section>
              <Cardinfo budgetList={budgetList} loading={loading} />
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
              <BarChartDashboard budgetList={budgetList} loading={loading} />
              <BudgetOverview budgets={budgetList} loading={loading} />
            </section>

            <section>
              <RecentExpensesTable
                expenses={expensesList}
                loading={loading}
                refreshData={getDashboardData}
              />
            </section>
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard
