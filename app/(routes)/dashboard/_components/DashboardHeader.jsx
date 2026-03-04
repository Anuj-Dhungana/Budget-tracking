import { UserButton } from '@clerk/nextjs'
import React from 'react'

function DashboardHeader() {
  return (
    <div className='sticky top-0 z-40 flex justify-end border-b bg-white/95 px-5 py-3 shadow-sm backdrop-blur-sm'>
        <div>
            <UserButton/>
        </div>
    </div>
  )
}

export default DashboardHeader
