"use client";

import React, { useState } from "react";

import DashboardHeader from "./_components/DashboardHeader";
import SideNav from "./_components/SideNav";

function Dashboardlayout({ children }) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  return (
    <div>
      <div
        className={`fixed hidden md:block ${
          isSidebarExpanded ? "md:w-64" : "md:w-24"
        }`}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
        onFocusCapture={() => setIsSidebarExpanded(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setIsSidebarExpanded(false);
          }
        }}
      >
        <SideNav isCollapsed={!isSidebarExpanded} />
      </div>
      <div
        className={`transition-[margin] duration-300 ${
          isSidebarExpanded ? "md:ml-64" : "md:ml-24"
        }`}
      >
        <DashboardHeader />
        {children}
      </div>
    </div>
  );
}

export default Dashboardlayout;
