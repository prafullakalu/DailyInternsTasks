import React from "react";
import type { SummaryProps, Expense } from "../types";

function Summary({ expenses }: SummaryProps): React.JSX.Element {
  const total: number = expenses.reduce(
    (sum: number, expense: Expense) => sum + expense.amount,
    0
  );

  return (
    <div className="summary">
      <div className="summary-label">Total Spent</div>
      <div className="summary-amount">₹{total.toFixed(2)}</div>
      <div className="summary-count">{expenses.length} expense{expenses.length !== 1 ? "s" : ""}</div>
    </div>
  );
}

export default Summary;
