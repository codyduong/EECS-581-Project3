/**
 * @prologue
 *
 * @author Cody Duong
 *
 * @file Handles animation of a specific tower. This file is meta-exported in `./index.ts` which is then used in
 *       [TowerSupervisor]{@link TowerSupervisor}.
 *
 * @precondition Expects the following to be true:
 *               1. A sibling of {@link RemoteEvent} exists
 *               2. A sibling of {@link Model} exists
 *               3. Is cloned, enabled, then run. This is done by `TowerSupervisor.ts`. This precondition is guarded by
 *                  `TowerAnimation.meta.json` containing the key value pair `"Disabled": true` (and not explictly)
 *                  within this code.
 *
 * @postcondition N/A
 *
 * @invariant N/A
 *
 * @throws Errors is if precondition is not met (ie. fails to execute)
 *
 * @sideeffect See {@link _connection}
 *
 * @revisions
 * [2024.November.11]{@revision Initial creation to support tower attacks}
 * [2024.November.18]{@revision Improve prologue and inline comments (no logical changes)}
 * [2024.November.27]{@revision Add initial attack animation indicator (simple debug laser)}
 * [2024.December.8]{@revision Add sounds/animations}
 */

import Guard from "shared/modules/guard/Guard";
import { TICK_DELAY, TICKS_PER_SECOND } from "game/modules/consts";
import { TOWER_TYPE_GUARD, TYPE_TO_META } from "game/modules/tower/Tower";
import { calculateTicksToIntercept } from "game/modules/tower/utils";

// 1st precondition
const event = script.Parent!.FindFirstChildOfClass("RemoteEvent")! as RemoteEvent<(...u: unknown[]) => void>;
assert(event !== undefined); // Assert it exists, otherwise error

let towerModel: Model;
/**
 * Helper function which gets the {@link Model} sibling residing next to this animation script.
 *
 * @precondition A sibling of {@link Model} exists
 * @sideeffect Updates {@link towerModel} which is used in {@link _connection}
 * @throws Errors if there is no sibling {@link Model}
 */
const getTowerModel = (): void => {
  const maybeTowerModel = script.Parent!.FindFirstChildOfClass("Model");
  assert(maybeTowerModel !== undefined);
  towerModel = maybeTowerModel;
  /**
   * Sometimes we change the model, so if the previous model is destroyed, then attempt to find the new model.
   * (IE. when we upgrade, we change the model)
   *
   * If we failed, then we destroyed the entire Tower? If we destroyed this Tower, then we likely destroyed this script
   * so it should not execute, but depending on [Heartbeat]{@link https://create.roblox.com/docs/reference/engine/classes/RunService#Heartbeat}
   * it is possible that this is still run despite being destroyed... This is pretty infrequent, and since the error
   * comes from something that is being destroyed anyways, it is immaterial in its consequence.
   *
   * @todo Maybe just catch this error safely and redirect output to normal {@link print}? -codyduong 2024, Nov 11
   */
  towerModel.Destroying.Once(() => {
    getTowerModel();
  });
};
// 2nd precondition
getTowerModel();

const tweenService = game.GetService("TweenService");

/**
 * @todo Remove {@link debugLaser}. It is simply a vizualization of the attack. This should go hand-in-hand with
 * adding unique tower animations.
 */
const debugLaser = script.Parent?.FindFirstChild("debugLaser") ?? new Instance("Part");
assert(classIs(debugLaser, "Part"));
debugLaser.Name = "debugLaser";
debugLaser.Parent = script.Parent;
debugLaser.Anchored = true;
debugLaser.CanCollide = false;
debugLaser.CanQuery = false;
debugLaser.CastShadow = false;
debugLaser.Color = new Color3(0, 0, 1);
debugLaser.Transparency = 0.5;

/**
 * The core animation function. Is triggered whenever the `TowerAI` requests an animation to be played. Right now it
 * simply points the tower at the enemy
 *
 * @note Runs on [Parallel Lua]{@link https://create.roblox.com/docs/scripting/multithreading} for speed.
 * @sideeffect As long as {@link event} exists will run whenever queried for an animation. Automatically cleaned up.
 *             Animation has a side-effect on the client which is always retained. No action on server.
 */
const _connection = event.OnClientEvent.ConnectParallel(
  /**
   * @param maybeAttacked Maybe a {@link boolean}
   * @param maybeEnemyPos Maybe a {@link Vector3}
   * @throws Errors if {@link maybeEnemyPos} is not a {@link Vector3}
   */
  (maybeAttacked, maybeEnemyPos) => {
    const attacked = Guard.Boolean(maybeAttacked);
    const enemyPos = Guard.Vector3(maybeEnemyPos);
    const tower = script.Parent as Actor;

    const towerPos = towerModel.GetPivot().Position;
    // set at the same height as enemy, such that we don't pivot in the vertical direction
    const yDiff = enemyPos.Y - towerPos.Y;
    const adjustedPos = new Vector3(towerPos.X, enemyPos.Y, towerPos.Z);

    const newCFrame = CFrame.lookAt(adjustedPos, enemyPos, new Vector3(0, 1, 0)).sub(new Vector3(0, yDiff, 0));

    // switch to sync runtime
    task.synchronize();

    // get the distance between the tower and enemy
    const distance = adjustedPos.sub(enemyPos).Magnitude;
    debugLaser.Size = new Vector3(0.1, 0.1, distance);
    debugLaser.CFrame = CFrame.lookAt(adjustedPos.Lerp(enemyPos, 0.5), enemyPos, new Vector3(0, 1, 0));

    // it can be jarring if two towers fire at the exact same time, so add some random delay [0, 0.1) seconds
    const soundOffset = math.random() * 0.1;

    if (attacked) {
      // check if we already have an attackLaser and destroy it
      // const attackType = ATTACK_TYPE_GUARD(tower.GetAttribute("attackType"));
      const towerType = TOWER_TYPE_GUARD(tower.GetAttribute("type"));
      const meta = TYPE_TO_META[towerType];
      const attackType = meta.stats.attackType;
      const sounds = meta.sounds;

      if (attackType === "raycast") {
        script.Parent?.FindFirstChild("attackLaser")?.Destroy();
        const attackLaser = debugLaser.Clone();
        attackLaser.Parent = script.Parent;
        attackLaser.Color = new Color3(1, 0, 0);
        attackLaser.Name = "attackLaser";

        const fireSound = sounds.fire[math.random(0, sounds.fire.size() - 1)].Clone();
        assert(fireSound);
        fireSound.Parent = towerModel;
        // ranged [0.9, 1.1) so it isn't always the same
        fireSound.PlaybackSpeed = (0.9 + math.random() * 0.2) * fireSound.PlaybackSpeed;
        task.delay(soundOffset, () => {
          fireSound.Play();
        });
        fireSound.Ended.Once(() => {
          fireSound.Destroy();
        });

        if (towerType === "Sniper0") {
          const boltRack = 0.4 + math.random() * 0.25;
          const boltSound =
            "reload" in sounds ? sounds.reload[math.random(0, sounds.reload.size() - 1)].Clone() : undefined;
          assert(boltSound);
          boltSound.Parent = towerModel;
          // ranged [0.9, 1.1) so it isn't always the same
          boltSound.PlaybackSpeed = (0.9 + math.random() * 0.2) * fireSound.PlaybackSpeed;
          task.delay(boltRack, () => {
            boltSound.Play();
          });
          boltSound.Ended.Once(() => {
            boltSound.Destroy();
          });
        }
      }

      if (attackType === "bomb") {
        script.Parent?.FindFirstChild("projectile")?.Destroy();
        const projectile = new Instance("Part");
        projectile.Name = "projectile";
        projectile.Parent = script.Parent;
        projectile.Anchored = true;
        projectile.CastShadow = false;
        projectile.CanCollide = false;
        projectile.CanQuery = false;
        projectile.Color = new Color3(0, 0, 0);
        projectile.Size = new Vector3(0.5, 0.5, 0.5);
        projectile.Position = adjustedPos;

        const fireSound = sounds?.fire[math.random(0, sounds.fire.size() - 1)].Clone();
        assert(fireSound);
        fireSound.Parent = towerModel;
        // ranged [0.9, 1.1) so it isn't always the same
        fireSound.PlaybackSpeed = (0.9 + math.random() * 0.2) * fireSound.PlaybackSpeed;
        task.delay(soundOffset, () => {
          fireSound.Play();
        });
        fireSound.Ended.Once(() => {
          fireSound.Destroy();
        });

        const projectileSpeed = Guard.Number(tower.GetAttribute("bombSpeed"));
        const projectileSize = Guard.Number(tower.GetAttribute("bombRange"));
        const range = Guard.Number(tower.GetAttribute("range"));

        const projectileTicksToIntercept = calculateTicksToIntercept(distance, projectileSpeed, "curved", range);
        const projectileTimeToIntercept = projectileTicksToIntercept / TICKS_PER_SECOND;

        const projectileXZ = new Instance("Vector3Value");
        projectileXZ.Value = adjustedPos;
        const projectileTweenXZ = tweenService.Create(
          projectileXZ,
          new TweenInfo(projectileTimeToIntercept, Enum.EasingStyle.Linear, Enum.EasingDirection.Out, 0, false, 0),
          {
            Value: enemyPos,
          },
        );
        const projectileY = new Instance("NumberValue");
        projectileY.Value = adjustedPos.Y;
        const projectileTweenY = tweenService.Create(
          projectileY,
          new TweenInfo(projectileTimeToIntercept / 2, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 0, true, 0),
          {
            // this is basically, saying closer we are higher we shoot, otherwise shoot more shallow
            Value: adjustedPos.Y + math.min(8, 4 * (4 / enemyPos.sub(adjustedPos).Magnitude)),
          },
        );
        projectileXZ.GetPropertyChangedSignal("Value").Connect(() => {
          projectile.PivotTo(new CFrame(new Vector3(projectileXZ.Value.X, projectileY.Value, projectileXZ.Value.Z)));
        });
        projectileTweenXZ.Play();
        projectileTweenY.Play();

        // print(projectileTimeToIntercept);

        task.delay(projectileTimeToIntercept, () => {
          projectile.Transparency = 1;
          const explosion = new Instance("Part");
          explosion.Name = "explosion";
          explosion.Parent = script.Parent;
          explosion.Anchored = true;
          explosion.CastShadow = false;
          explosion.CanCollide = false;
          explosion.CanQuery = false;
          explosion.Transparency = 0.5;
          explosion.Color = new Color3(1, 0, 0);
          explosion.Size = new Vector3(projectileSize, projectileSize, projectileSize);
          explosion.Position = enemyPos;
          assert("explode" in sounds);
          const explosionSound = sounds.explode[math.random(0, sounds.explode.size() - 1)].Clone();
          assert(explosionSound);
          explosionSound.Parent = explosion;
          // ranged [0.95, 1.05) so it isn't always the same
          explosionSound.PlaybackSpeed = (0.95 + math.random() * 0.1) * explosionSound.PlaybackSpeed;
          task.delay(soundOffset, () => {
            explosionSound.Play();
          });

          task.delay(10 * TICK_DELAY, () => {
            explosion.Transparency = 1;
            if (explosionSound.IsPlaying) {
              explosionSound.Ended.Wait();
              explosion.Destroy();
            } else {
              explosion.Destroy();
            }
          });
        });
      }

      // todo make the attack laser disappear after certain number of ticks
    }

    // https://devforum.roblox.com/t/is-there-any-way-i-can-tween-pivotto/1918057/3
    const cFrameValue = new Instance("CFrameValue");
    cFrameValue.Value = towerModel.GetPivot();
    cFrameValue.GetPropertyChangedSignal("Value").Connect(() => {
      towerModel.PivotTo(cFrameValue.Value);
    });

    // setup animating pointing the tower at the enemy
    const tween = tweenService.Create(
      cFrameValue,
      new TweenInfo(TICK_DELAY, Enum.EasingStyle.Linear, Enum.EasingDirection.Out, 0, false, 0),
      {
        Value: newCFrame,
      },
    );

    // play the animation
    tween.Play();

    // setup garbage collection for the animation
    tween.Completed.Connect(() => {
      cFrameValue.Destroy();
    });
  },
);
