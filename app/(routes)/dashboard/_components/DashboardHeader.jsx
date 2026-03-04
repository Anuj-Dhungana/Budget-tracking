import { UserButton } from '@clerk/nextjs'
import React from 'react'

function DashboardHeader() {
  return (
    <div className='sticky top-0 z-40 flex items-center justify-between border-b bg-white/95 p-5 shadow-sm backdrop-blur-sm'>
        <div>
          <p className='text-sm font-medium text-slate-500'>Dashboard</p>
          <h2 className='text-lg font-semibold text-slate-900'>Budget Overview</h2>
        </div>
        <div>
            <UserButton/>
        </div>
    </div>
  )
}

export default DashboardHeader
