import React from "react";
import type { ExpenseListProps } from "../types";
import ExpenseItem from "./ExpenseItem";

function ExpenseList({ expenses, onDelete }: ExpenseListProps): React.JSX.Element {
  if (expenses.length === 0) {
    return (
      <div className="expense-list-empty">
        <p>No expenses yet. Add one above!</p>
      </div>
    );
  }

  return (
    <div className="expense-list">
      <h2>Expenses ({expenses.length})</h2>
      {expenses.map((expense) => (
        <ExpenseItem key={expense.id} expense={expense} onDelete={onDelete} />
      ))}
    </div>
  );
}

export default ExpenseList;
