/**
 * index.ts — Entry point: imports each module so the compiler type-checks the whole program.
 *
 * Run: `npm run build` then `npm start`, or `npm run dev`.
 * Run typecheck only: `npm run typecheck`
 */

import { explicitCount, pair, move, config, demoUnknownNarrowing } from "./01-basics";
import { greetUser, env } from "./02-interfaces-and-types";
import { formatId, renderState, getLength } from "./03-unions-narrowing";
import { identity, pick, user, subset, demoPair } from "./04-generics";
import { Circle, IdGenerator } from "./05-classes";
import { saveDraft, perms, createUser, demoReturnTypeAndParameters } from "./06-utility-types";
import { theme, createUserId, deleteUser } from "./07-advanced-patterns";

function main(): void {
  console.log("=== TypeScript deep-dive demo output ===\n");

  demoUnknownNarrowing();
  console.log("01 basics:", { explicitCount, pair, config, themeKeys: Object.keys(theme) });
  move("north");

  console.log("02 interfaces:", greetUser({ id: "1", name: "Lin", createdAt: new Date() }));
  console.log("02 env sample:", env.NODE_ENV);

  console.log("03 unions:", formatId(42), getLength("abc"));

  const state = renderState({ status: "success", data: "Done" });
  console.log("03 async state:", state);

  console.log("04 generics:", identity("typed"), subset, pick(user, ["name"]));
  demoPair();

  const c = new Circle(2);
  console.log("05 classes:", c.describe(), IdGenerator.create());

  saveDraft({ title: "Learn TS" });
  console.log("06 utilities:", Object.keys(perms), createUser("Bob", 40));
  demoReturnTypeAndParameters();

  const uid = createUserId("user-7");
  deleteUser(uid);
  console.log("07 advanced: branded UserId created OK");
}

main();
