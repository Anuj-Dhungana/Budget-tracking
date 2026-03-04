"use client";

import React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { formatCurrency } from "./analytics-utils";

function TooltipContent({ active, payload }) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0].payload;

  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-lg">
      <p className="font-medium text-card-foreground">{item.name}</p>
      <div className="mt-2 space-y-1 text-sm">
        <div className="flex items-center justify-between gap-6">
          <span className="text-muted-foreground">Spent</span>
          <span className="font-medium text-card-foreground">
            {formatCurrency(item.value)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="text-muted-foreground">Share</span>
          <span className="font-medium text-card-foreground">
            {Math.round(item.share)}%
          </span>
        </div>
      </div>
    </div>
  );
}

function BudgetDistributionChart({ data = [], loading = false }) {
  return (
    <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-card-foreground">
          Spending by Budget
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Understand which categories consume most of your money.
        </p>
      </div>

      {loading ? (
        <div className="h-[320px] animate-pulse rounded-2xl bg-muted" />
      ) : data.length > 0 ? (
        <div className="space-y-6">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={3}
              >
                {data.map((entry) => (
                  <Cell key={entry.id} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<TooltipContent />} />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-3">
            {data.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-2xl bg-muted/40 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-card-foreground">
                    {item.name}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {Math.round(item.share)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex h-[320px] items-center justify-center rounded-2xl bg-muted/40 text-sm text-muted-foreground">
          No budget distribution data available yet.
        </div>
      )}
    </div>
  );
}

export default BudgetDistributionChart;
