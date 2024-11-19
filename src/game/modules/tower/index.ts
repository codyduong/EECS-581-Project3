/**
 * @prologue
 *
 * @author Cody Duong
 *
 * @file Helper file to properly expose `./TowerAI.ts`. Due to technical reasons (ie. how roblox luau works),
 *       along with how `roblox-ts` compiles, short of writing a [transformer]{@link https://roblox-ts.com/docs/guides/typescript-transformers/}
 *       , ModuleScripts cannot be imported without running the code inside of them, so a secondary file needs to be
 *       present to import them using a roundabout way.
 *
 * @precondition N/A
 *
 * @postcondition N/A
 *
 * @invariant Asserts that
 *            1. {@link TowerAI} exists and is a {@link ModuleScript}
 *            2. {@link TowerAnimation} exists and is a {@link Script} that has [RunContext]{@link https://create.roblox.com/docs/reference/engine/enums/RunContext}
 *               of {@link Enum.RunContext.Client}
 *
 * @throws Errors if invariant is not met
 *
 * @sideeffect N/A
 *
 * @revisions
 * [2024.November.11]{@revision Initial creation to support tower attacks}
 * [2024.November.18]{@revision Improve prologue and inline comments (no logical changes)}
 */

// Assert that we have properly set up `TowerAI.ts`
export const TowerAI = script?.FindFirstChild("TowerAI") as ModuleScript;
assert(TowerAI !== undefined);
assert(classIs(TowerAI, "ModuleScript"));

// Assert that we have properly set up `TowerAnimation.meta.json`
export const TowerAnimation = script.FindFirstChild("TowerAnimation") as Script;
assert(classIs(TowerAnimation, "Script"));
assert(TowerAnimation.RunContext === Enum.RunContext.Client);
