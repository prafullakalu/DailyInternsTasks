/**
 * 02-interfaces-and-types.ts — Interfaces vs type aliases, extending, merging.
 *
 * Rule of thumb:
 * - `interface` can be *merged* (declaration merging) and often reads well for object shapes.
 * - `type` can express unions, intersections, mapped types, and more — more expressive overall.
 * Both can describe object shapes; prefer consistency within a codebase.
 */

// ---------------------------------------------------------------------------
// Interface — describes object shape; open to extension via merging
// ---------------------------------------------------------------------------

interface User {
  id: string;
  name: string;
  /** Optional property — may be absent */
  email?: string;
  /** Readonly: cannot assign after creation */
  readonly createdAt: Date;
}

// const user: User = {
//   id: "1",
//   name: "John Doe",
//   email: "john.doe@example.com",
//   createdAt: new Date(),
// };

// Extending interfaces (inheritance-style)
interface AdminUser extends User {
  role: "admin";
  permissions: string[];
}

function greetUser(user: User): string {
  return `Hello, ${user.name}`;
}

const greetings = greetUser({
  id: "1",
  name: "John Doe",
  createdAt: new Date(),
});

// ---------------------------------------------------------------------------
// Type alias — same shape, different keyword
// ---------------------------------------------------------------------------

type Product = {
  sku: string;
  price: number;
  inStock: boolean;
};

// ---------------------------------------------------------------------------
// Intersection types (`&`) — must satisfy *both* sides
// ---------------------------------------------------------------------------

type stockRecord = {
  sku: string;
  price: number;
  inStock: boolean;
};

type Timestamped = { updatedAt: Date };

type ProductWithTimestamp = Product & Timestamped;
type StockRecordWithTimestamp = Product & Timestamped;

// ---------------------------------------------------------------------------
// Declaration merging (interfaces only)
// ---------------------------------------------------------------------------

interface WindowConfig {
  theme: string;
}
interface WindowConfig {
  /** Second declaration *merges* with the first — both properties exist */
  locale: string;
}

// WindowConfig now has theme + locale

const wc: WindowConfig = { theme: "dark", locale: "en" };

// ---------------------------------------------------------------------------
// Callable / constructable types with interfaces
// ---------------------------------------------------------------------------

interface Logger {
  (message: string): void;
  level: "debug" | "info" | "error";
}

// You can implement this with Object.assign(fn, { level: "info" }) so the value
// is callable and also carries `level`.

// ---------------------------------------------------------------------------
// Index signatures — dynamic keys
// ---------------------------------------------------------------------------

interface StringDict {
  /** Any string key maps to a string value */
  [key: string]: string;
}

const env: StringDict = {
  NODE_ENV: "development",
  API_URL: "http://localhost",
  clientId: "1234567890",
};

export interface InterfaceTypes {
  User: User;
  AdminUser: AdminUser;
  Product: Product;
  ProductWithTimestamp: ProductWithTimestamp;
  StockRecordWithTimestamp: StockRecordWithTimestamp;
  WindowConfig: WindowConfig;
  StringDict: StringDict;
}
export { greetUser, env, wc };

// const key = Symbol();
// obj[key] = "value";
