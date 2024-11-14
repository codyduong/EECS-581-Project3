/**
 * @author Cody Duong
 * @file Helper file to properly expose ./TowerAi.ts. Due to technical reasons (ie. how roblox luau works),
 *       short of writing a macro, ModuleScripts cannot be imported without running the code inside of them,
 *       so a secondary file needs to be present to import them using a roundabout way.
 */

export const TowerAI = script?.FindFirstChild("TowerAI") as ModuleScript;
assert(TowerAI !== undefined);
assert(classIs(TowerAI, "ModuleScript"));

export const TowerAnimation = script.FindFirstChild("TowerAnimation") as Script;
assert(classIs(TowerAnimation, "Script"));
assert(TowerAnimation.RunContext === Enum.RunContext.Client);
