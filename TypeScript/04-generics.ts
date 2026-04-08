/**
 * 04-generics.ts — Type parameters, constraints, defaults, inference.
 *
 * Generics let you write reusable code that preserves type relationships
 * instead of erasing them to `any`.
 */

// ---------------------------------------------------------------------------
// Generic function — type parameter T is inferred from the argument
// ---------------------------------------------------------------------------

function identity<T>(value: T): T {
  return value;
}

const n = identity(123); // T inferred as number
const s = identity("hi"); // T inferred as string

// ---------------------------------------------------------------------------
// Constraints — `T extends SomeType` limits what T can be
// ---------------------------------------------------------------------------

interface HasId {
  id: string;

}

function findById<T extends HasId>(items: T[], id: string): T | undefined {
  return items.find((item) => item.id === id);
}

// ---------------------------------------------------------------------------
// Multiple type parameters
// ---------------------------------------------------------------------------

function pair<A, B>(first: B, second: A): [B, A] {
  return [first, second];
}

// Example: each call infers its own `A` and `B` — no link between calls.
const pairNumAndText = pair(10, "ten"); // type [number, string]
const pairBools = pair(true, false); // type [boolean, boolean]
const pairObjects = pair({ id: 1 }, { id: 2 }); // type [{ id: number }, { id: number }]

/** Run from `index.ts` (e.g. `npm run dev`) to see `pair` output in the console. */
function demoPair(): void {
  console.log("04 pair() samples:", pairNumAndText, pairBools, pairObjects);
}

// ---------------------------------------------------------------------------
// Generic interfaces / classes
// ---------------------------------------------------------------------------

interface Box<T> {
  value: T;
}

class DataStore<T> {
  private items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  getAll(): readonly T[] {
    return this.items;
  }
}

// ---------------------------------------------------------------------------
// Default type parameters
// ---------------------------------------------------------------------------

type HttpResult<T = unknown> = {
  status: number;
  body: T;
};

const plain: HttpResult = { status: 200, body: {} };

// ---------------------------------------------------------------------------
// `keyof` + generics — keys of an object type
// ---------------------------------------------------------------------------

function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const out = {} as Pick<T, K>;
  for (const k of keys) {
    out[k] = obj[k];
  }
  return out;
}


const user = { id: "1", name: "Ada", age: 36 };
const subset = pick(user, ["name", "age"]); // { name: string; age: number }

export type { HasId, Box, HttpResult };
export { identity, findById, pair, DataStore, pick, user, subset, demoPair };
