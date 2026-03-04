"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

import ExpenseFormDialog from "../expenses/_components/ExpenseFormDialog.jsx";
import { Button } from "../../../../components/ui/button";
import { apiRequest } from "../../../../lib/api.js";

const ENABLED_PATHS = new Set([
  "/dashboard",
  "/dashboard/budgets",
  "/dashboard/expenses",
  "/dashboard/analytics",
]);

function FloatingExpenseButton() {
  const pathname = usePathname();
  const [budgets, setBudgets] = useState([]);

  useEffect(() => {
    if (!ENABLED_PATHS.has(pathname)) {
      return;
    }

    let cancelled = false;

    const loadBudgets = async () => {
      try {
        const data = await apiRequest("/api/budgets", {
          cache: "no-store",
        });

        if (!cancelled) {
          setBudgets(data?.budgets || []);
        }
      } catch (error) {
        console.error("Error loading budgets for quick expense action:", error);
      }
    };

    void loadBudgets();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (!ENABLED_PATHS.has(pathname)) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 md:bottom-8 md:right-8">
      <ExpenseFormDialog
        budgets={budgets}
        trigger={
          <Button className="h-12 rounded-full px-5 shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        }
      />
    </div>
  );
}

export default FloatingExpenseButton;
