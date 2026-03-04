'use client'

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

function BarChartDashboard({budgetList}) {
  const safeData = budgetList || [];

  return (
    <div className='border p-5 rounded-lg'>
      <h2 className='text-2xl font-bold mb-5'>Activity Bar</h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={safeData}
          margin={{top:5,right:5,left:5,bottom:5}}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="totalSpend" stackId="a" fill="#1E3A8A" />
          <Bar dataKey="amount" stackId="a" fill="#BFDBFE" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default BarChartDashboard
