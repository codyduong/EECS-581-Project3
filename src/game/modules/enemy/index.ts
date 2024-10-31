/**
 * @author Cody Duong
 * @file Helper file to properly expose ./Enemy.ts. Due to technical reasons (ie. how roblox luau works),
 *       short of writing a macro, ModuleScripts cannot be imported without running the code inside of them,
 *       so a secondary file needs to be present to import them using a roundabout way.
 */

const Enemy = script?.WaitForChild("Enemy");
assert(Enemy !== undefined);
assert(classIs(Enemy, "ModuleScript"));

export default Enemy as ModuleScript;
