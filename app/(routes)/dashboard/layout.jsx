"use client";

import React from "react";

import DashboardHeader from "./_components/DashboardHeader";
import SideNav from "./_components/SideNav";

function Dashboardlayout({ children }) {
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
