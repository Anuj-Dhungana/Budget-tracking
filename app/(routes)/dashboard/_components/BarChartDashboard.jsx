'use client'

import React from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function TooltipContent({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
      <p className="font-medium text-slate-900">{label}</p>
      <div className="mt-2 space-y-1 text-sm">
        {payload.map((item) => (
          <div key={item.dataKey} className="flex items-center justify-between gap-6">
            <span className="text-slate-500">{item.name}</span>
            <span className="font-medium text-slate-900">
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
    <div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
      <div className="mb-6">
        <h2 className='text-xl font-semibold text-slate-900'>Budget vs Spending</h2>
        <p className="mt-1 text-sm text-slate-500">
          Compare how much you planned against how much you have spent.
        </p>
      </div>

      {loading ? (
        <div className="h-[320px] animate-pulse rounded-2xl bg-slate-100" />
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={safeData} barGap={12} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
            />
            <YAxis
              tickFormatter={(value) => `₹${Number(value) / 1000}k`}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
            />
            <Tooltip content={<TooltipContent />} cursor={{ fill: "#f8fafc" }} />
            <Legend />
            <Bar
              dataKey="amount"
              name="Budget"
              fill="#c7d2fe"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="totalSpend"
              name="Spent"
              fill="#1d4ed8"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

export default BarChartDashboard
