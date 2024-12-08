/**
 * @prologue
 * @author Cody Duong
 * @file Helper file to properly expose `./EnemyAI.ts`. Due to technical reasons (ie. how roblox luau works),
 *       along with how `roblox-ts` compiles, short of writing a [transformer]{@link https://roblox-ts.com/docs/guides/typescript-transformers/}
 *       , ModuleScripts cannot be imported without running the code inside of them, so a secondary file needs to be
 *       present to import them using a roundabout way.
 *
 * @precondition N/A
 * @postcondition N/A
 * @invariant Asserts that
 *            1. {@link EnemyAI} exists and is a {@link ModuleScript}
 *            2. {@link EnemyAnimation} exists and is a {@link Script} that has [RunContext]{@link https://create.roblox.com/docs/reference/engine/enums/RunContext}
 *               of {@link Enum.RunContext.Client}
 *
 * @throws Errors if invariant is not met
 * @sideeffect N/A
 * @revisions
 * [2024.October.27]{@revision Initial creation to support Enemy AI (ie. pathfinding)}
 * [2024.November.4]{@revision Rename `Enemy` to [`EnemyAI`]{@link EnemyAI} for better clarity}
 * [2024.November.4a]{@revision Add {@link EnemyAnimation} to support displaying animation on client side}
 * [2024.November.19]{@revision Improve prologue and inline comments (no logical changes)}
 */

// Assert that we have properly set up `TowerAI.ts`
export const EnemyAI = script?.FindFirstChild("EnemyAI") as ModuleScript;
assert(EnemyAI !== undefined);
assert(classIs(EnemyAI, "ModuleScript"));

// Assert that we have properly set up `EnemyAnimation.meta.json`
export const EnemyAnimation = script.FindFirstChild("EnemyAnimation") as Script;
assert(classIs(EnemyAnimation, "Script"));
assert(EnemyAnimation.RunContext === Enum.RunContext.Client);
