"use client";

import React, { useState } from "react";

import DashboardHeader from "./_components/DashboardHeader";
import SideNav from "./_components/SideNav";

function Dashboardlayout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem("dashboard-sidebar-collapsed") === "true";
  });

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed((currentValue) => {
      const nextValue = !currentValue;
      window.localStorage.setItem(
        "dashboard-sidebar-collapsed",
        String(nextValue)
      );
      return nextValue;
    });
  };

  return (
    <div>
      <div
        className={`fixed hidden md:block ${
          isSidebarCollapsed ? "md:w-24" : "md:w-64"
        }`}
      >
        <SideNav
          isCollapsed={isSidebarCollapsed}
          onToggle={handleSidebarToggle}
        />
      </div>
      <div
        className={`transition-[margin] duration-300 ${
          isSidebarCollapsed ? "md:ml-24" : "md:ml-64"
        }`}
      >
        <DashboardHeader />
        {children}
      </div>
    </div>
  );
}

export default Dashboardlayout;
