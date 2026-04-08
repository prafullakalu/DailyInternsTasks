import { InterfaceTypes } from "./02-interfaces-and-types";

/**
 * 01-basics.ts — Primitive types, type annotations, inference, arrays, tuples, literals.
 *
 * TypeScript is a *structural* type system: compatibility is based on shape, not names
 * (unlike some nominal languages like Java for classes).
 */

// ---------------------------------------------------------------------------
// Explicit annotations vs inference
// ---------------------------------------------------------------------------

// TypeScript often *infers* the type from the initializer — no annotation needed.
const inferredNumber = 42; // type: 42 (literal) widened in some contexts to number

// You can annotate when you want a wider type or when there's no initializer.
let explicitCount: number;
explicitCount = 10;

// `string`, `number`, `boolean`, `bigint`, `symbol` are the main primitives.
const label: string = "hello";
const ok: boolean = true;

// ---------------------------------------------------------------------------
// `any` vs `unknown` — two ways to say "I don't know the type yet"
// ---------------------------------------------------------------------------
//
// Think of it this way:
//   • `any`     = "trust this value everywhere"  → the compiler stops helping you.
//   • `unknown` = "I will prove what this is"   → you must check before you use it.
//
// Use `unknown` for untrusted data (JSON, user input, third-party APIs). Use `any` only
// as a last resort (legacy JS interop), because mistakes become runtime bugs, not red squiggles.

// --- `any`: the "opt out" type ------------------------------------------------
// Anything you assign is allowed, and anything you *do* with the variable is allowed too.
// TypeScript will not warn if you call a method that does not exist — that is the problem.
let loose: any = "anything goes";
loose = 123; // OK: `any` accepts any assignment
// loose.thisMethodDoesNotExist(); // Still compiles! It would crash at runtime. Avoid `any`.

// --- `unknown`: the safe default for "could be anything" ----------------------
// First you narrow (e.g. with `typeof`), then TypeScript lets you use it like that type.
export function demoUnknownNarrowing(): void {
  const message: unknown = "  hello  ";

  // message.trim(); // Error: an `unknown` value has no `.trim()` until you narrow it.

  if (typeof message === "string") {
    console.log("01 unknown narrowing →", message.trim());
  }
}

// ---------------------------------------------------------------------------
// Arrays and readonly arrays
// ---------------------------------------------------------------------------

// Array of numbers — two equivalent notations:
const scores: (number | string | boolean)[] = [10, 20, true];
const altScores: Array<number | string | boolean> = [1, 2, 3];
const altScores1 = [1, 2, 3];

// ReadonlyArray<T> prevents mutating methods like push (immutability hint).
const readonlyNums: ReadonlyArray<number> = [1, 2, 3];
// readonlyNums.push(4); // Error if uncommented

// ---------------------------------------------------------------------------
// Tuples — fixed-length arrays with specific types per position
// ---------------------------------------------------------------------------

// [string, number] is a tuple: first slot string, second number.
const pair: [string, number] = ["age", 30];

// Optional/rest elements in tuples (TS 4+):
const rgb: [number, number, number, number?] = [255, 128, 0];
// Fourth channel (alpha) may be omitted.

// ---------------------------------------------------------------------------
// Literal types — exact values as types
// ---------------------------------------------------------------------------

// `as const` makes the deepest properties readonly and narrows to literal types.
const directions = ["north", "south", "east", "west"] as const;
// `typeof directions[number]` becomes "north" | "south" | "east" | "west"

type Direction = (typeof directions)[number];

function move(d: Direction): void {
  console.log("moving", d);
}

// directions.push("up"); // error ReadonlyArray does not have push method
// directions[0] = "west"; // error ReadonlyArray does not have index assignment

//So as const does two things:
// makes the structure readonly
// keeps exact literal values

// ---------------------------------------------------------------------------
// Type assertions — tell the compiler "trust me" (use sparingly)
// ---------------------------------------------------------------------------

// In the browser, `document.getElementById("app")` returns HTMLElement | null;
// you might use `as HTMLElement` when you're sure the element exists.

// `satisfies` (TS 4.9+): check an expression against a type without widening the inferred type.

const config = {
  retries: 3,
  timeoutMs: 5000,
} satisfies { retries: number; timeoutMs: number };

// Short example showing the real advantage
type Method = "GET" | "POST";

// const fetchConfigWithSatisfies = {
//   method: "GET",
// } satisfies { method: Method };

// Type of fetchConfigWithSatisfies.method:
// "GET";

// If you used annotation:
const fetchConfigWithAnnotation: { method: Method } = {
  method: "GET",
};

// Type of fetchConfigWithAnnotation.method:
// "GET" | "POST";
// Less precise.


export { explicitCount, pair, move, config, directions };







