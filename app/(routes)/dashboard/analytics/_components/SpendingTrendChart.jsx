"use client";

import React from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "./analytics-utils";

function TooltipContent({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-lg">
      <p className="font-medium text-card-foreground">{label}</p>
      <div className="mt-2 text-sm">
        <div className="flex items-center justify-between gap-6">
          <span className="text-muted-foreground">Spent</span>
          <span className="font-medium text-card-foreground">
            {formatCurrency(payload[0].value)}
          </span>
        </div>
      </div>
    </div>
  );
}

function SpendingTrendChart({ data = [], loading = false }) {
  return (
    <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-card-foreground">
          Monthly Spending Trend
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          See how your spending changes over time.
        </p>
      </div>

      {loading ? (
        <div className="h-[340px] animate-pulse rounded-2xl bg-muted" />
      ) : data.length > 0 ? (
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              minTickGap={20}
            />
            <YAxis
              tickFormatter={(value) => `\u0930\u0941 ${Math.round(Number(value) / 1000)}k`}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <Tooltip content={<TooltipContent />} />
            <Legend wrapperStyle={{ color: "hsl(var(--muted-foreground))" }} />
            <Line
              type="monotone"
              dataKey="total"
              name="Spent"
              stroke="hsl(var(--chart-1))"
              strokeWidth={3}
              dot={{ fill: "hsl(var(--chart-1))", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-[340px] items-center justify-center rounded-2xl bg-muted/40 text-sm text-muted-foreground">
          No spending data available for this period.
        </div>
      )}
    </div>
  );
}

export default SpendingTrendChart;
