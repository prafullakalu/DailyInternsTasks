import React, { useState } from "react";
import type { Category, ExpenseFormProps } from "../types";

const CATEGORIES: Category[] = ["food", "transport", "utilities", "entertainment", "other"];

function ExpenseForm({ onAdd }: ExpenseFormProps): React.JSX.Element {
  const [title, setTitle] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<Category>("food");
  const [date, setDate] = useState<string>("");

  function handleTitleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setTitle(event.target.value);
  }

  function handleAmountChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setAmount(event.target.value);
  }

  function handleCategoryChange(event: React.ChangeEvent<HTMLSelectElement>): void {
    setCategory(event.target.value as Category);
  }

  function handleDateChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setDate(event.target.value);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const parsedAmount: number = parseFloat(amount);
    if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0 || !date) {
      return;
    }

    onAdd({
      title: title.trim(),
      amount: parsedAmount,
      category,
      date,
    });

    // Reset form
    setTitle("");
    setAmount("");
    setCategory("food");
    setDate("");
  }

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <h2>Add Expense</h2>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            placeholder="e.g. Grocery shopping"
            value={title}
            onChange={handleTitleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount (₹)</label>
          <input
            id="amount"
            type="number"
            placeholder="0.00"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={handleAmountChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select id="category" value={category} onChange={handleCategoryChange}>
            {CATEGORIES.map((cat: Category) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={handleDateChange}
            required
          />
        </div>
      </div>

      <button type="submit" className="btn-add">+ Add Expense</button>
    </form>
  );
}

export default ExpenseForm;
