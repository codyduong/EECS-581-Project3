/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file Definitions for all Tiles.
 *       This is needed to generate valid superpositions based on tile connections.
 */

import forwardN from "./forward_n";
import forwardE from "./forward_e";
import forwardS from "./forward_s";
import forwardW from "./forward_w";
import turnr_N from "./turnr_n";
import turnr_E from "./turnr_e";
import turnr_S from "./turnr_s";
import turnr_W from "./turnr_w";
import turnl_N from "./turnl_n";
import turnl_E from "./turnl_e";
import turnl_S from "./turnl_s";
import turnl_W from "./turnl_w";
import grass1 from "./grass1";
import { DIRECTIONS, getOppositeDirection, Tile, TileAdj } from "game/modules/Tile";
import { isMatch } from "game/modules/VertexMap";

let allTilesBasic = [
  forwardN,
  forwardE,
  forwardS,
  forwardW,
  turnr_N,
  turnr_E,
  turnr_S,
  turnr_W,
  turnl_N,
  turnl_E,
  turnl_S,
  turnl_W,
  grass1,
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
allTilesBasic = [];
