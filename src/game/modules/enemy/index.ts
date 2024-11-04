/**
 * @author Cody Duong
 * @file Helper file to properly expose ./EnemyAI.ts. Due to technical reasons (ie. how roblox luau works),
 *       short of writing a macro, ModuleScripts cannot be imported without running the code inside of them,
 *       so a secondary file needs to be present to import them using a roundabout way.
 */

export const EnemyAI = script?.WaitForChild("EnemyAI") as ModuleScript;
assert(EnemyAI !== undefined);
assert(classIs(EnemyAI, "ModuleScript"));

export const EnemyAnimation = script.WaitForChild("EnemyAnimation") as Script;
assert(EnemyAnimation !== undefined);
assert(classIs(EnemyAnimation, "Script"));
assert(EnemyAnimation.RunContext === Enum.RunContext.Client);
