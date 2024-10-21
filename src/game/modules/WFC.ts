/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file
 *
 * Waveform Collapse
 *
 * - https://www.youtube.com/watch?v=2SuvO4Gi7uY
 *   - https://bolddunkley.itch.io/wfc-mixed
 *   - https://marian42.de/article/wfc/
 */

import { allTiles } from "./tiles";

type Grid = Plane[];
type Plane = Superposition[][];
type Superposition = string[];

export function initializeGrid(x = 25, y = 5, z = 25): Grid {
  let result = [];
  for (let i = 0; i < x; i++) {
    let ai = [];
    for (let j = 0; j < y; j++) {
      let aj = [];
      for (let k = 0; k < z; k++) {
        // Don't allow path superpositions that go off the board
        let reducedTiles = allTiles.filter((tile) => {
          if (
            (k === 0 || k === z - 1) &&
            (tile.pathTo.includes("negativeZ") ||
              tile.pathTo.includes("positiveZ") ||
              tile.pathFrom.includes("negativeZ") ||
              tile.pathFrom.includes("positiveZ"))
          ) {
            return false;
          }
          if (
            (j === 0 || j === y - 1) &&
            (tile.pathTo.includes("negativeY") ||
              tile.pathTo.includes("positiveY") ||
              tile.pathFrom.includes("negativeY") ||
              tile.pathFrom.includes("positiveY"))
          ) {
            return false;
          }
          if (
            (i === 0 || i === x - 1) &&
            (tile.pathTo.includes("negativeX") ||
              tile.pathTo.includes("positiveX") ||
              tile.pathFrom.includes("negativeX") ||
              tile.pathFrom.includes("positiveX"))
          ) {
            return false;
          }
          return true;
        });

        aj.push(reducedTiles.map(({ name }) => name));
      }
      ai.push(aj);
    }
    result.push(ai);
  }

  return result;
}
