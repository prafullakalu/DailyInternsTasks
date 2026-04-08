// ── Category type alias ──────────────────────────────────────────────
export type Category = "food" | "transport" | "utilities" | "entertainment" | "other";

// ── Expense data model ──────────────────────────────────────────────
export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: Category;
  date: string;
}

// ── Component prop interfaces ───────────────────────────────────────

export interface ExpenseFormProps {
  onAdd: (expense: Omit<Expense, "id">) => void;
}

export interface ExpenseItemProps {
  expense: Expense;
  onDelete: (id: string) => void;
}

export interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

export interface SummaryProps {
  expenses: Expense[];
}
