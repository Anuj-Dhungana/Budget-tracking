"use client";

import React, { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import { apiRequest } from "../../../lib/api.js";
import DashboardHeader from "./_components/DashboardHeader";
import SideNav from "./_components/SideNav";

function Dashboardlayout({ children }) {
  const { user } = useUser();
  const router = useRouter();

  const checkUserBudgets = async () => {
    try {
      const data = await apiRequest("/api/budgets", {
        cache: "no-store",
      });

      if ((data?.budgets || []).length === 0) {
        router.replace("/dashboard/budgets");
      }
    } catch (error) {
      console.error("Error checking budgets:", error);
    }
  };

  useEffect(() => {
    if (user) {
      void checkUserBudgets();
    }
  }, [user, router]);

  return (
    <div>
      <div className="fixed hidden md:block md:w-64">
        <SideNav />
      </div>
      <div className="md:ml-64">
        <DashboardHeader />
        {children}
      </div>
    </div>
  );
}

export default Dashboardlayout;
