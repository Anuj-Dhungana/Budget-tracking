"use client";

import React from "react";
import { Pause, Play, Repeat, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
import { dispatchExpensesUpdated } from "../../../../../lib/expense-events.js";
import RecurringRuleDialog from "./RecurringRuleDialog.jsx";

function formatCurrency(amount) {
  return `\u0930\u0941 ${new Intl.NumberFormat("en-NP", {
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)}`;
}

function formatFrequency(rule) {
  const baseLabel =
    rule.frequency === "DAILY"
      ? "day"
      : rule.frequency === "WEEKLY"
        ? "week"
        : "month";

  return rule.interval > 1
    ? `Every ${rule.interval} ${baseLabel}s`
    : `Every ${baseLabel}`;
}

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
          : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
      }`}
    >
      {active ? "Active" : "Paused"}
    </span>
  );
}

function DeleteRecurringRuleAction({ ruleId, refreshData }) {
  const handleDelete = async () => {
    try {
      await apiRequest(`/api/recurring/${ruleId}`, {
        method: "DELETE",
      });

      toast.success("Recurring rule deleted");
      dispatchExpensesUpdated();

      if (typeof refreshData === "function") {
        await refreshData();
      }
    } catch (error) {
      console.error("Error deleting recurring rule:", error);
      toast.error(error.message || "Failed to delete recurring rule");
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-300"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this recurring rule?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the schedule only. Existing generated expenses will be kept.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Delete Rule</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function RecurringRulesPanel({
  budgetId,
  rules = [],
  loading = false,
  refreshData,
}) {
  const toggleRuleStatus = async (rule) => {
    try {
      await apiRequest(`/api/recurring/${rule.id}`, {
        method: "PATCH",
        body: {
          isActive: !rule.isActive,
        },
      });

      toast.success(rule.isActive ? "Recurring rule paused" : "Recurring rule resumed");
      dispatchExpensesUpdated();

      if (typeof refreshData === "function") {
        await refreshData();
      }
    } catch (error) {
      console.error("Error updating recurring rule status:", error);
      toast.error(error.message || "Failed to update recurring rule");
    }
  };

  return (
    <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm md:p-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-card-foreground">
            Recurring Rules
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage automated expenses for this budget.
          </p>
        </div>

        <RecurringRuleDialog budgetId={budgetId} refreshData={refreshData} />
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          [1, 2].map((item) => (
            <div
              key={item}
              className="h-[120px] animate-pulse rounded-2xl bg-muted"
            />
          ))
        ) : rules.length > 0 ? (
          rules.map((rule) => (
            <div
              key={rule.id}
              className="rounded-2xl border border-border bg-muted/30 p-4"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-background text-primary shadow-sm">
                    <Repeat className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-card-foreground">
                        {rule.description}
                      </h3>
                      <StatusBadge active={rule.isActive} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatCurrency(rule.amount)} / {formatFrequency(rule)}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Next run: {rule.nextRunDateLabel || "Not scheduled"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Generated {rule.occurrencesGenerated || 0} time
                      {(rule.occurrencesGenerated || 0) === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <RecurringRuleDialog
                    budgetId={budgetId}
                    rule={rule}
                    mode="edit"
                    refreshData={refreshData}
                  />
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => toggleRuleStatus(rule)}
                  >
                    {rule.isActive ? (
                      <>
                        <Pause className="h-4 w-4" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Resume
                      </>
                    )}
                  </Button>
                  <DeleteRecurringRuleAction
                    ruleId={rule.id}
                    refreshData={refreshData}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
            <h3 className="text-lg font-medium text-card-foreground">
              No recurring rules yet
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Create a recurring rule to generate expenses automatically on schedule.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecurringRulesPanel;
