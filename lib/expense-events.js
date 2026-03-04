export const EXPENSES_UPDATED_EVENT = "budget-tracker:expenses-updated";

export function dispatchExpensesUpdated() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(EXPENSES_UPDATED_EVENT));
}
