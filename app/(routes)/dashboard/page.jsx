'use client'

import React, { useEffect, useState } from 'react'
import { useUser } from "@clerk/nextjs";

import { apiRequest } from "../../../lib/api.js";
import BarChartDashboard from "./_components/BarChartDashboard";
import Cardinfo from "./_components/Cardinfo";
import BudgetItem from "./budgets/_components/BudgetItem";
import ExpensesListTable from './expenses/_components/ExpensesListTable.jsx';

const ClientGreeting = () => {
  const { user } = useUser();
  const name =
    user?.firstName ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "there";

  return <span>{name}</span>;
};

function Dashboard() {
  const { user } = useUser();
  const [budgetList, setBudgetList] = useState([]);
  const [expensesList, setExpensesList] = useState([]);

  const getDashboardData = async () => {
    try {
      const data = await apiRequest("/api/dashboard", {
        cache: "no-store",
      });

      setBudgetList(data?.budgets || []);
      setExpensesList(data?.expenses || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    let cancelled = false;

    const loadDashboardData = async () => {
      try {
        const data = await apiRequest("/api/dashboard", {
          cache: "no-store",
        });

        if (cancelled) {
          return;
        }

        setBudgetList(data?.budgets || []);
        setExpensesList(data?.expenses || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    void loadDashboardData();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div className='p-8'>
      <h2 className='font-bold text-3xl'>Hi, <ClientGreeting /></h2>
      <p className='text-gray-500'>Here&apos;s what is happening with your money. Manage your expenses clearly.</p>

      <Cardinfo budgetList={budgetList} />

      <div className='grid grid-cols-1 gap-6 mt-6 md:grid-cols-3'>
        <div className='md:col-span-2'>
          <BarChartDashboard budgetList={budgetList} />
          <ExpensesListTable
            expensesList={expensesList}
            refreshData={getDashboardData}
          />
        </div>
        <div className='grid gap-6'>
          <h2 className='text-2xl font-bold'>Recent Budgets</h2>
          {budgetList.map((budget) => (
            <BudgetItem budget={budget} key={budget.id} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
