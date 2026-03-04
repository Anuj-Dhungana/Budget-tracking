'use client';

import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function formatCurrency(amount) {
  return `\u0930\u0941 ${new Intl.NumberFormat("en-NP", {
    maximumFractionDigits: 0,
  }).format(amount || 0)}`;
}

function TooltipContent({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-lg">
      <p className="font-medium text-card-foreground">{label}</p>
      <div className="mt-2 space-y-1 text-sm">
        {payload.map((item) => (
          <div key={item.dataKey} className="flex items-center justify-between gap-6">
            <span className="text-muted-foreground">{item.name}</span>
            <span className="font-medium text-card-foreground">
              {formatCurrency(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChartDashboard({ budgetList, loading = false }) {
  const safeData = budgetList || [];

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-card-foreground">Budget vs Spending</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Compare how much you planned against how much you have spent.
        </p>
      </div>

      {loading ? (
        <div className="h-[320px] animate-pulse rounded-2xl bg-muted" />
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={safeData} barGap={12} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis
              tickFormatter={(value) => `\u0930\u0941 ${Number(value) / 1000}k`}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <Tooltip
              content={<TooltipContent />}
              cursor={{ fill: "hsl(var(--muted) / 0.7)" }}
            />
            <Legend wrapperStyle={{ color: "hsl(var(--muted-foreground))" }} />
            <Bar
              dataKey="amount"
              name="Budget"
              fill="hsl(var(--chart-4))"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="totalSpend"
              name="Spent"
              fill="hsl(var(--chart-1))"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default BarChartDashboard;
