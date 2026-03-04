import { UserButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import React from "react";

import { Button } from "../../../../components/ui/button";

function DashboardHeader({ onOpenMobileNav }) {
  return (
    <div className="sticky top-0 z-40 flex items-center justify-between border-b bg-white/95 px-5 py-3 shadow-sm backdrop-blur-sm">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onOpenMobileNav}
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </Button>
      <div className="ml-auto">
        <UserButton />
      </div>
    </div>
  );
}

export default DashboardHeader;
