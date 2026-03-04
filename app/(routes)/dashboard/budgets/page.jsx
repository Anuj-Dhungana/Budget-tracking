import React from "react";

import Budgetlist from "./_components/Budgetlist";

function Budget() {
  return (
    <div className="bg-background p-5 md:p-8">
      <div className="mx-auto max-w-7xl">
        <Budgetlist />
      </div>
    </div>
  );
}

export default Budget;
