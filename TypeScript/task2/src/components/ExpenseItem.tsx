import React from "react";
import type { ExpenseItemProps } from "../types";

const CATEGORY_EMOJI: Record<string, string> = {
  food: "🍔",
  transport: "🚗",
  utilities: "💡",
  entertainment: "🎬",
  other: "📦",
};

function ExpenseItem({ expense, onDelete }: ExpenseItemProps): React.JSX.Element {
  function handleDelete(): void {
    onDelete(expense.id);
  }

  return (
    <div className="expense-item">
      <div className="expense-info">
        <span className="expense-emoji">{CATEGORY_EMOJI[expense.category]}</span>
        <div className="expense-details">
          <span className="expense-title">{expense.title}</span>
          <span className="expense-meta">
            {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)} •{" "}
            {new Date(expense.date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
      <div className="expense-actions">
        <span className="expense-amount">₹{expense.amount.toFixed(2)}</span>
        <button className="btn-delete" onClick={handleDelete} title="Delete expense">
          ✕
        </button>
      </div>
    </div>
  );
}

export default ExpenseItem;
