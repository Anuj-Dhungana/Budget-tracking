"use client";

import React from "react";
import { Trash2 } from "lucide-react";
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

function DeleteBudgetAction({ budgetId, onDeleted, trigger }) {
  const handleDeleteBudget = async () => {
    try {
      await apiRequest(`/api/budgets/${budgetId}`, {
        method: "DELETE",
      });

      toast.success("Budget deleted successfully");

      if (typeof onDeleted === "function") {
        await onDeleted();
      }
    } catch (error) {
      console.error("Error deleting budget:", error);
      toast.error(error.message || "Failed to delete budget");
    }
  };

  const defaultTrigger = (
    <Button className="gap-2" variant="destructive">
      <Trash2 className="h-4 w-4" />
      Delete
    </Button>
  );

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger || defaultTrigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this budget?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the budget and all expenses inside it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteBudget}>
            Delete Budget
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteBudgetAction;
