/**
 * 06-utility-types.ts — Built-in mapped / conditional utility types (cheat sheet in code).
 *
 * These types transform other types — they live in TypeScript's standard library.
 */

// ---------------------------------------------------------------------------
// Sample type for demonstrations
// ---------------------------------------------------------------------------

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
}

// ---------------------------------------------------------------------------
// Partial<T> — all properties optional
// ---------------------------------------------------------------------------

type TodoDraft = Partial<Todo>;
// { id?: string; title?: string; completed?: boolean; dueDate?: Date }

function saveDraft(_draft: TodoDraft): void {
  /* ... */
}

// ---------------------------------------------------------------------------
// Required<T> — all properties required (opposite of Partial)
// ---------------------------------------------------------------------------

type TodoStrict = Required<Todo>;
// dueDate becomes required Date

// ---------------------------------------------------------------------------
// Readonly<T> — all properties readonly
// ---------------------------------------------------------------------------

type FrozenTodo = Readonly<Todo>;

// ---------------------------------------------------------------------------
// Pick<T, Keys> — subset of properties
// ---------------------------------------------------------------------------

type TodoPreview = Pick<Todo, "id" | "title">;

// ---------------------------------------------------------------------------
// Omit<T, Keys> — all but listed keys
// ---------------------------------------------------------------------------

type TodoWithoutDates = Omit<Todo, "dueDate">;

// ---------------------------------------------------------------------------
// Record<Keys, Value> — map keys to a value type
// ---------------------------------------------------------------------------

type Role = "admin" | "user" | "guest";
type Permissions = Record<Role, string[]>;

const perms: Permissions = {
  admin: ["read", "write", "delete"],
  user: ["read"],
  guest: [],
};

// ---------------------------------------------------------------------------
// -------------Omit vs Exclude (the main difference)-------------
// Omit<T, K> works on object types (removes properties by key).
// Exclude<U, V> works on union types (removes union members).
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Extract / Exclude — union manipulation
// ---------------------------------------------------------------------------

type Status = "idle" | "loading" | "success" | "error";
type NonIdle = Exclude<Status, "idle">;
type LoadingOrError = Extract<Status, "loading" | "error">;

// ---------------------------------------------------------------------------
// NonNullable<T> — removes null and undefined from T
// ---------------------------------------------------------------------------

type MaybeName = string | null | undefined;
type Name = NonNullable<MaybeName>; // string

// ---------------------------------------------------------------------------
// ReturnType / Parameters — introspect function types
// ---------------------------------------------------------------------------

function createUser(name: string, age: number) {
  return { name, age };
}

type UserReturn = ReturnType<typeof createUser>;
type UserParams = Parameters<typeof createUser>; // [name: string, age: number]

function callCreateUser(args: UserParams): UserReturn {
  return createUser(...args);
}

/** Run from `index.ts` (e.g. `npm run dev`) to see derived types in action. */
export function demoReturnTypeAndParameters(): void {
  const args: UserParams = ["Bob", 40];
  const user: UserReturn = callCreateUser(args);
  console.log("06 ReturnType/Parameters demo:", { args, user });
}

export type {
  Todo,
  TodoDraft,
  TodoStrict,
  FrozenTodo,
  TodoPreview,
  TodoWithoutDates,
  Permissions,
  NonIdle,
  LoadingOrError,
  Name,
  UserReturn,
  UserParams,
};
export { saveDraft, perms, createUser };
