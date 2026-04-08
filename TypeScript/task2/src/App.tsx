import React, { useState } from "react";
import type { Expense } from "./types";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import Summary from "./components/Summary";
import "./App.css";

function App(): React.JSX.Element {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  function addExpense(expenseData: Omit<Expense, "id">): void {
    const newExpense: Expense = {
      ...expenseData,
      id: crypto.randomUUID(),
    };
    setExpenses((prev: Expense[]) => [newExpense, ...prev]);
  }

  function deleteExpense(id: string): void {
    setExpenses((prev: Expense[]) => prev.filter((expense: Expense) => expense.id !== id));
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>💸 Expense Tracker</h1>
        <p>Track your spending with ease</p>
      </header>

      <main className="app-main">
        <div className="app-left">
          <ExpenseForm onAdd={addExpense} />
          <Summary expenses={expenses} />
        </div>
        <div className="app-right">
          <ExpenseList expenses={expenses} onDelete={deleteExpense} />
        </div>
      </main>
    </div>
  );
}

export default App;
