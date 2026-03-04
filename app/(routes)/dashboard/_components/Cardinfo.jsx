import { PiggyBank, ReceiptText, Wallet } from "lucide-react";
import React from "react";

function Cardinfo({ budgetList = [] }) {
  const totalBudget = budgetList.reduce(
    (total, item) => total + Number(item.amount || 0),
    0
  );
  const totalSpend = budgetList.reduce(
    (total, item) => total + Number(item.totalSpend ?? 0),
    0
  );

  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-US');
  };

  return (
    <div>{budgetList?.length > 0 ?
      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-7 border rounded-lg flex items-center justify-between">
          <div>
            <h2 className="text-sm">Total Budget</h2>
            <h2 className="text-2xl font-bold">Rs {formatCurrency(totalBudget)}</h2>
          </div>
          <PiggyBank className="bg-primary text-white rounded-full p-3 h-12 w-12" />
        </div>
        <div className="p-7 border rounded-lg flex items-center justify-between">
          <div>
            <h2 className="text-sm">Total Spend</h2>
            <h2 className="text-2xl font-bold">Rs {formatCurrency(totalSpend)}</h2>
          </div>
          <ReceiptText className="bg-primary text-white rounded-full p-3 h-12 w-12" />
        </div>
        <div className="p-7 border rounded-lg flex items-center justify-between">
          <div>
            <h2 className="text-sm">No. of Budget</h2>
            <h2 className="text-2xl font-bold">{budgetList?.length}</h2>
          </div>
          <Wallet className="bg-primary text-white rounded-full p-3 h-12 w-12" />
        </div>
      </div> :
      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((item, index) => (
          <div key={index} className="h-[110px] w-full bg-gray-200 animate-pulse rounded-lg">
          </div>
        ))}
      </div>
    }
    </div>
  );
}

export default Cardinfo;
