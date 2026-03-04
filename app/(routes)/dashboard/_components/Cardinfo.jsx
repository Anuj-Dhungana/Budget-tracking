import { CreditCard, Folder, TrendingDown, Wallet } from "lucide-react";
import React from "react";

function formatCurrency(amount) {
  return `रु ${new Intl.NumberFormat("en-NP", {
    maximumFractionDigits: 0,
  }).format(amount || 0)}`;
}

function SummaryCard({ title, value, icon: Icon, accentClass }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            {value}
          </h3>
        </div>
        <div className={`rounded-2xl p-3 ${accentClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function SummaryCardSkeleton() {
  return (
    <div className="h-[156px] rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="h-full animate-pulse rounded-2xl bg-slate-100" />
    </div>
  );
}

function Cardinfo({ budgetList = [], loading = false }) {
  const totalBudget = budgetList.reduce(
    (total, item) => total + Number(item.amount || 0),
    0
  );
  const totalSpend = budgetList.reduce(
    (total, item) => total + Number(item.totalSpend ?? 0),
    0
  );
  const remainingBalance = Math.max(totalBudget - totalSpend, 0);
  const cardItems = [
    {
      title: "Total Budget",
      value: formatCurrency(totalBudget),
      icon: Wallet,
      accentClass: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "Total Spent",
      value: formatCurrency(totalSpend),
      icon: CreditCard,
      accentClass: "bg-blue-50 text-blue-700",
    },
    {
      title: "Remaining Balance",
      value: formatCurrency(remainingBalance),
      icon: TrendingDown,
      accentClass: "bg-amber-50 text-amber-700",
    },
    {
      title: "Budgets",
      value: `${budgetList.length}`,
      icon: Folder,
      accentClass: "bg-violet-50 text-violet-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {loading
        ? [1, 2, 3, 4].map((item) => <SummaryCardSkeleton key={item} />)
        : cardItems.map((item) => <SummaryCard key={item.title} {...item} />)}
    </div>
  );
}

export default Cardinfo;
