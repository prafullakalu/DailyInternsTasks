/**
 * 03-unions-narrowing.ts — Union types, discriminated unions, type guards, narrowing.
 *
 * Narrowing = TypeScript refining a union to a smaller set based on control flow.
 */

// ---------------------------------------------------------------------------
// Union types — value can be one of several types
// ---------------------------------------------------------------------------

type Id = string | number;

function formatId(id: Id): string {
  // Narrowing with typeof
  if (typeof id === "string") {
    return id.toUpperCase();
  }
  // Here TS knows id is number
  return id.toFixed(0);
}

// ---------------------------------------------------------------------------
// Discriminated union — common literal "tag" on each variant
// ---------------------------------------------------------------------------

type LoadingState = { status: "loading" };
type SuccessState<T> = { status: "success"; data: T };
type ErrorState = { status: "error"; message: string };

type AsyncState<T> = LoadingState | SuccessState<T> | ErrorState;

function renderState(state: AsyncState<string>): string {
  switch (state.status) {
    case "loading":
      return "Loading…";
    case "success":
      // TS knows `data` exists here
      return state.data;
    case "error":
      return state.message;
    default: {
      // Exhaustiveness: if you add a new variant, this branch helps catch missing cases
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}

// ---------------------------------------------------------------------------
// User-defined type predicates — functions that return `arg is SomeType`
// ---------------------------------------------------------------------------

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function parseInput(input: unknown): string {
  if (isString(input)) {
    return input.trim();
  }
  throw new Error("Expected string");
}

// ---------------------------------------------------------------------------
// `key in object` — narrowing when each variant has *different property names*
// ---------------------------------------------------------------------------
//
// Earlier we used one shared field (`status`) with different literal values — a *discriminant*.
// Sometimes APIs instead return *either* a success object *or* an error object with no shared tag:
//
//   { data: ... }     ← OK
//   { error: "...", statusCode: 400 }  ← failure
//
// The `in` operator asks: "does this object have this property (own or on the prototype chain)?"
// So `"error" in result` is a runtime check that also tells TypeScript which branch you are in.
//
// Use `in` when the *shape* differs by property names; use a discriminant field when you can add one.

/** JSON body when `fetch` succeeded and you parsed `{ data: ... }`. */
type ApiSuccess<T> = { data: T };

/** JSON body when the backend reports failure: `{ error, statusCode }`. */
type ApiError = { error: string; statusCode: number };

/**
 * Same endpoint can return success or error JSON — you model that as a union, then narrow.
 * After `"error" in result`, only `ApiError` is possible, so `statusCode` and `error` exist.
 * In the else branch, `ApiError` is ruled out, so `data` exists on `ApiSuccess`.
 */
function describeLessonResult(result: ApiSuccess<{ title: string }> | ApiError): string {
  if ("error" in result) {
    return `Error ${result.statusCode}: ${result.error}`;
  }
  return `Lesson: ${result.data.title}`;
}

// ---------------------------------------------------------------------------
// Truthiness narrowing — values that count as "empty" in `if (!x)`
// ---------------------------------------------------------------------------
//
// For `maybe` typed as `string | null | undefined`, a check like `if (!maybe)` does two things:
//   1) Runtime: treats `null`, `undefined`, and `""` as "no value" (and returns 0 early).
//   2) Types: after the `if`, TypeScript knows `maybe` is `string` (non-null/undefined).
//
// Be careful: `!maybe` is also true for `0` or `false` if those were in the union — design your
// union so truthiness matches what you mean.

function getLength(maybe: string | null | undefined): number {
  if (!maybe) {
    return 0;
  }
  return maybe.length;
}

export type { AsyncState, Id, ApiSuccess, ApiError };
export { formatId, renderState, parseInput, describeLessonResult, getLength };
