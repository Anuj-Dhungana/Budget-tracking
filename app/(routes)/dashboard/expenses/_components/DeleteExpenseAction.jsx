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
import { dispatchExpensesUpdated } from "../../../../../lib/expense-events.js";

function DeleteExpenseAction({ expenseId, onDeleted, trigger }) {
  const handleDelete = async () => {
    try {
      await apiRequest(`/api/expenses/${expenseId}`, {
        method: "DELETE",
      });

      toast.success("Expense deleted");
      dispatchExpensesUpdated();
      if (typeof onDeleted === "function") {
        await onDeleted();
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error(error.message || "Failed to delete expense");
    }
  };

  const defaultTrigger = (
    <Button variant="ghost" size="icon">
      <Trash2 className="h-4 w-4" />
    </Button>
  );

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger || defaultTrigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this expense?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this expense? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Delete Expense</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteExpenseAction;
