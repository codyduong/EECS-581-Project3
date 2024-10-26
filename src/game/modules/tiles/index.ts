/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file Definitions for all Tiles.
 *       This is needed to generate valid superpositions based on tile connections.
 */

import { forward_N, forward_E, forward_S, forward_W } from "./forward";
import { turnR_E, turnR_N, turnR_S, turnR_W } from "./turnr";
import { turnL_E, turnL_N, turnL_S, turnL_W } from "./turnl";
import { voidTile, air } from "./helpers";
import { grass1 } from "./grass";
import { Tile, TileAdj } from "game/modules/Tile";
import { isMatch } from "game/modules/VertexMap";
import { DIRECTIONS, getOppositeDirection } from "game/modules/Direction";

let allTilesBasic = [
  forward_N,
  forward_E,
  forward_S,
  forward_W,
  turnR_N,
  turnR_E,
  turnR_S,
  turnR_W,
  turnL_N,
  turnL_E,
  turnL_S,
  turnL_W,
  grass1,
  air,
  voidTile,
] as Tile[];

export const allTilesMap: Record<string, TileAdj> = {};

export const allTiles = allTilesBasic.map((tile) => {
  assert(allTilesMap[tile.name] === undefined, "Already defined tile");

  const tileAdj: TileAdj = {
    name: tile.name,
    adjacency: {
      negativeX: [],
      positiveX: [],
      negativeZ: [],
      positiveZ: [],
      positiveY: [],
      negativeY: [],
    },
    pathFrom: table.clone(tile.pathFrom),
    pathTo: table.clone(tile.pathTo),
    model: tile.model,
  };

  DIRECTIONS.forEach((direction) => {
    const validAdjTiles = allTilesBasic
      .filter((tile2) => {
        // match by basic vertex matching
        const vertexMatch = isMatch(tile.vertexMap, tile2.vertexMap, direction);

        // print(direction, getFaceVertices(tile.vertexMap, direction));

        if (!vertexMatch) {
          return false;
        }

        const oppositeDirection = getOppositeDirection(direction);
        let pathTested = false;
        if (tile.pathTo.includes(direction)) {
          if (tile2.pathFrom.find((d) => d === oppositeDirection) === undefined) {
            return false;
          }
          pathTested = true;
        }
        if (tile.pathFrom.includes(direction)) {
          if (tile2.pathTo.find((d) => d === oppositeDirection) === undefined) {
            return false;
          }
          pathTested = true;
        }
        if (!pathTested) {
          if (tile2.pathFrom.find((d) => d === oppositeDirection) !== undefined) {
            return false;
          }
          if (tile2.pathTo.find((d) => d === oppositeDirection) !== undefined) {
            return false;
          }
        }

        return true;
      })
      .map((adjTil) => adjTil.name);

    tileAdj.adjacency[direction] = validAdjTiles;
  });

  allTilesMap[tile.name] = tileAdj;
  return tileAdj;
});

// empty for garbage collection
allTilesBasic = undefined as unknown as [];
