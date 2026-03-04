"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  EllipsisVertical,
  PencilLine,
  Trash2,
} from "lucide-react";

import { Button } from "../../../../../components/ui/button";
import EditBudget from "../../expenses/_components/EditBudget.jsx";
import DeleteBudgetAction from "./DeleteBudgetAction";

function formatCurrency(amount) {
  return `\u0930\u0941 ${new Intl.NumberFormat("en-NP", {
    maximumFractionDigits: 0,
  }).format(amount || 0)}`;
}

function getBudgetHealth(progress) {
  if (progress >= 90) {
    return {
      barClass: "bg-red-500",
      badgeClass: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300",
      iconClass: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300",
    };
  }

  if (progress >= 70) {
    return {
      barClass: "bg-amber-500",
      badgeClass:
        "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
      iconClass:
        "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300",
    };
  }

  return {
    barClass: "bg-blue-500",
    badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
    iconClass: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300",
  };
}

function BudgetItem({ budget, refreshData }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const totalBudget = Number(budget?.amount ?? 0);
  const totalSpend = Number(budget?.totalSpend ?? 0);
  const remainingAmount = Math.max(totalBudget - totalSpend, 0);
  const progress = totalBudget > 0 ? Math.min((totalSpend / totalBudget) * 100, 100) : 0;
  const health = getBudgetHealth(progress);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <article className="group rounded-[28px] border border-border bg-card p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <Link
          href={`/dashboard/expenses/${budget?.id}`}
          className="flex min-w-0 flex-1 items-center gap-4"
        >
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl ${health.iconClass}`}
          >
            {budget?.icon || "\u{1F4B0}"}
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-card-foreground">
              {budget?.name}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {budget?.totalItems ?? 0} expense{Number(budget?.totalItems ?? 0) === 1 ? "" : "s"}
            </p>
          </div>
        </Link>

        <div className="flex items-start gap-2">
          <div className="rounded-2xl bg-muted/70 px-3 py-2 text-right">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Total Budget
            </p>
            <p className="mt-1 text-lg font-semibold text-card-foreground">
              {formatCurrency(totalBudget)}
            </p>
          </div>

          <div className="relative" ref={menuRef}>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
              aria-label="Open budget actions"
            >
              <EllipsisVertical className="h-4 w-4" />
            </Button>

            {isMenuOpen ? (
              <div className="absolute right-0 top-12 z-20 min-w-44 rounded-2xl border border-border bg-popover p-2 shadow-lg">
                <EditBudget
                  budgetId={budget.id}
                  refreshData={refreshData}
                  trigger={
                    <button
                      type="button"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-popover-foreground transition hover:bg-muted"
                    >
                      <PencilLine className="h-4 w-4" />
                      Edit Budget
                    </button>
                  }
                />

                <DeleteBudgetAction
                  budgetId={budget.id}
                  onDeleted={refreshData}
                  trigger={
                    <button
                      type="button"
                      onClick={() => setIsMenuOpen(false)}
                      className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/40"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Budget
                    </button>
                  }
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <Link href={`/dashboard/expenses/${budget?.id}`} className="mt-6 block">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-muted/60 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Spent
            </p>
            <p className="mt-2 text-lg font-semibold text-card-foreground">
              {formatCurrency(totalSpend)}
            </p>
          </div>

          <div className="rounded-2xl bg-muted/60 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Remaining
            </p>
            <p className="mt-2 text-lg font-semibold text-card-foreground">
              {formatCurrency(remainingAmount)}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-card-foreground">
              {Math.round(progress)}% used
            </p>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${health.badgeClass}`}
            >
              {Math.round(progress)}%
            </span>
          </div>

          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${health.barClass}`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-5 flex items-center justify-between text-sm font-medium text-primary">
            <span>View Details</span>
            <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </div>
        </div>
      </Link>
    </article>
  );
}

export default BudgetItem;
