"use client";

import React from "react";
import Image from "next/image";
import {
  LayoutGrid,
  PiggyBank,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { cn } from "../../../../lib/utils";

function SideNav({ isCollapsed, className, onNavigate }) {
  const menuList = [
    {
      id: 1,
      name: "Dashboard",
      icon: LayoutGrid,
      path: "/dashboard",
    },
    {
      id: 2,
      name: "Budgets",
      icon: PiggyBank,
      path: "/dashboard/budgets",
    },
    {
      id: 3,
      name: "Expenses",
      icon: ReceiptText,
      path: "/dashboard/expenses",
    },
    {
      id: 4,
      name: "Upgrade",
      icon: ShieldCheck,
      path: "/dashboard/upgrade",
    },
  ];
  const path = usePathname();

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r border-border bg-card px-4 py-5 text-card-foreground shadow-sm transition-all duration-300",
        isCollapsed ? "items-center" : "",
        className
      )}
    >
      <div
        className={`flex w-full items-center ${isCollapsed ? "justify-center" : "justify-between"}`}
      >
        <Link
          href="/"
          onClick={onNavigate}
          className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}
        >
          <Image src="/logo.svg" alt="logo" width={40} height={40} />
          {!isCollapsed ? (
            <div>
              <p className="text-sm font-semibold text-card-foreground">BudgetFlow</p>
              <p className="text-xs text-muted-foreground">Control your spending</p>
            </div>
          ) : null}
        </Link>
      </div>

      <div className="mt-8 flex w-full flex-1 flex-col">
        {menuList.map((menu) => (
          <Link href={menu.path} key={menu.id} onClick={onNavigate}>
            <div
              className={`mb-2 flex items-center rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-primary/10 hover:text-primary ${
                path === menu.path ? "bg-primary/10 text-primary" : ""
              } ${isCollapsed ? "justify-center" : "gap-3"}`}
              title={isCollapsed ? menu.name : undefined}
            >
              <menu.icon className="h-5 w-5 shrink-0" />
              {!isCollapsed ? <span>{menu.name}</span> : null}
            </div>
          </Link>
        ))}
      </div>

      <div
        className={`mt-auto flex w-full items-center rounded-2xl border border-border bg-muted/60 p-3 ${
          isCollapsed ? "justify-center" : "gap-3"
        }`}
        title={isCollapsed ? "Profile" : undefined}
      >
        <UserButton />
        {!isCollapsed ? (
          <div>
            <p className="text-sm font-medium text-card-foreground">Profile</p>
            <p className="text-xs text-muted-foreground">Manage account</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default SideNav;
