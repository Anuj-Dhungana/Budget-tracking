"use client";

import React, { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "../../../components/ui/dialog";
import DashboardHeader from "./_components/DashboardHeader";
import SideNav from "./_components/SideNav";

function Dashboardlayout({ children }) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
      <Dialog open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <DialogContent className="left-0 top-0 h-dvh w-[280px] max-w-[85vw] translate-x-0 translate-y-0 gap-0 border-0 p-0 data-[state=closed]:slide-out-to-left-full data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-full data-[state=open]:slide-in-from-top-[48%] sm:rounded-none md:hidden">
          <DialogTitle className="sr-only">Navigation menu</DialogTitle>
          <SideNav
            isCollapsed={false}
            className="h-full border-r-0 pr-14 shadow-none"
            onNavigate={() => setIsMobileSidebarOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <div
        className={`transition-[margin] duration-300 ${
          isSidebarExpanded ? "md:ml-64" : "md:ml-24"
        }`}
      >
        <DashboardHeader onOpenMobileNav={() => setIsMobileSidebarOpen(true)} />
        {children}
      </div>
    </div>
  );
}

export default Dashboardlayout;
