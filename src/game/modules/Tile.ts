/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file Tile Definitions
 */

import { VertexMap } from "./VertexMap";

/**
 * the player spawns facing -Z (ive arbitrarily decided this is NORTH)
 * -Z -> North
 * +X -> East
 * +Z -> South
 * -X -> West
 */
export type Direction = "negativeX" | "positiveX" | "negativeZ" | "positiveZ" | "positiveY" | "negativeY";
export const DIRECTIONS: Direction[] = ["negativeX", "positiveX", "negativeZ", "positiveZ", "positiveY", "negativeY"];
export function getOppositeDirection(direction?: Direction): Direction | undefined {
  switch (direction) {
    case "positiveX":
      return "negativeX";
    case "negativeX":
      return "positiveX";
    case "positiveY":
      return "negativeY";
    case "negativeY":
      return "positiveY";
    case "positiveZ":
      return "negativeZ";
    case "negativeZ":
      return "positiveZ";
    case undefined:
      return undefined;
    default:
      error("Invalid direction");
  }
}

export interface Tile {
  name: string;
  vertexMap: VertexMap;
  pathFrom: Direction[];
  pathTo: Direction[];
  model: Instance;
  // typically adjacency is decided automatically, but manual overrides can be described
  adjacency_manual?: {
    negativeX: string[];
    positiveX: string[];
    negativeZ: string[];
    positiveZ: string[];
    positiveY: string[];
    negativeY: string[];
  };
}

export type TileAdj = {
  name: string;
  adjacency: {
    negativeX: string[];
    positiveX: string[];
    negativeZ: string[];
    positiveZ: string[];
    positiveY: string[];
    negativeY: string[];
  };
  pathFrom: Direction[];
  pathTo: Direction[];
  model: Instance;
};
