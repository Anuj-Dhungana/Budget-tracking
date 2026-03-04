"use client"

import React, { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'

import { apiRequest } from '../../../../../lib/api.js'
import BudgetItem from './BudgetItem'
import CreateBudget from './CreateBudget'

function Budgetlist() {
  const [budgetList, setBudgetList] = useState([])
  const { user } = useUser()

  const getBudgetList = async () => {
    try {
      const data = await apiRequest('/api/budgets', {
        cache: 'no-store',
      })

      setBudgetList(data?.budgets || [])
    } catch (error) {
      console.error('Error fetching budgets:', error)
    }
  }

  useEffect(() => {
    if (!user) {
      return;
    }

    let cancelled = false

    const loadBudgetList = async () => {
      try {
        const data = await apiRequest('/api/budgets', {
          cache: 'no-store',
        })

        if (!cancelled) {
          setBudgetList(data?.budgets || [])
        }
      } catch (error) {
        console.error('Error fetching budgets:', error)
      }
    }

    void loadBudgetList()

    return () => {
      cancelled = true
    }
  }, [user])

  return (
    <div className='mt-7'>
      <div className='grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3'>
        <CreateBudget refershData={getBudgetList} />
        {budgetList?.length > 0
          ? budgetList.map((budget) => (
              <BudgetItem key={budget.id} budget={budget} />
            ))
          : [1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className='w-full bg-slate-200 rounded-lg h-[150px] animate-pulse' />
            ))}
      </div>
    </div>
  )
}

export default Budgetlist
