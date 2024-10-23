/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file
 *
 * Waveform Collapse
 *
 * - https://github.com/mxgmn/WaveFunctionCollapse
 * - https://www.youtube.com/watch?v=2SuvO4Gi7uY
 *   - https://bolddunkley.itch.io/wfc-mixed
 *   - https://marian42.de/article/wfc/
 */

import { Direction, DIRECTIONS } from "./Direction";
import { allTiles, allTilesMap } from "./tiles";

type Grid = Plane[];
type Plane = Superposition[][];
type Superposition = string[];

const parallelForEach = <T extends defined>(ar: Array<T>, callback: (v: T) => void) => {
  ar.forEach(callback);
};

export function initializeGrid(x = 5, y = 1, z = 5): Grid {
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

// can range from -9_007_199_254_740_991 and 9_007_199_254_740_991,
// but we are constrained to int32 due to underlying c call
const seed = math.random(-2_147_483_646, 2_147_483_647);
print(seed);
const random = new Random(seed);

function taxicabDistance(a: [number, number, number], b: [number, number, number]): number {
  return math.abs(a[0] - b[0]) + math.abs(a[1] - b[1]) + math.abs(a[2] - b[2]);
}

function selectValidPositions(
  grid: Grid,
  minDistance: number,
  numpears: number = 1,
): { start: [number, number, number]; fin: [number, number, number] }[] {
  const startPositions: [number, number, number][] = [];
  const endPositions: [number, number, number][] = [];
  const xSize = grid.size();
  const ySize = grid[0].size();
  const zSize = grid[0][0].size();

  // Collect all valid positions
  for (let x = 0; x < xSize; x++) {
    for (let y = 0; y < ySize; y++) {
      for (let z = 0; z < zSize; z++) {
        const superposition = grid[x][y][z];
        if (superposition.some((tileName) => tileName.find("^Start")[0] === 1)) {
          startPositions.push([x, y, z]);
        }
        if (superposition.some((tileName) => tileName.find("^End")[0] === 1)) {
          endPositions.push([x, y, z]);
        }
      }
    }
  }

  const pears = [];
  while (pears.size() < numpears) {
    const startIdx = random.NextInteger(0, startPositions.size() - 1);
    let endIdx = random.NextInteger(0, endPositions.size() - 1);

    // Ensure minimum taxicab distance
    while (startIdx === endIdx || taxicabDistance(startPositions[startIdx], endPositions[endIdx]) < minDistance) {
      endIdx = random.NextInteger(0, endPositions.size() - 1);
    }

    pears.push({
      start: startPositions[startIdx],
      fin: endPositions[endIdx],
    });
  }

  return pears;
}

// Set start and fin tiles
function setStartAndEndTiles(
  grid: Grid,
  positions: {
    start: [number, number, number];
    fin: [number, number, number];
  }[],
) {
  const startVariants = allTiles.filter((tile) => tile.name.find("^Start")[0] === 1).map((tile) => tile.name);
  const endVariants = allTiles.filter((tile) => tile.name.find("^End")[0] === 1).map((tile) => tile.name);

  const xSize = grid.size();
  const ySize = grid[0].size();
  const zSize = grid[0][0].size();

  // Remove StartPath and EndPath tiles from all positions
  for (let x = 0; x < xSize; x++) {
    for (let y = 0; y < ySize; y++) {
      for (let z = 0; z < zSize; z++) {
        grid[x][y][z] = grid[x][y][z].filter(
          (tileName) => !startVariants.includes(tileName) && !endVariants.includes(tileName),
        );
      }
    }
  }

  // Set StartPath and EndPath tiles at selected positions
  positions.forEach(({ start, fin }) => {
    grid[start[0]][start[1]][start[2]] = startVariants;
    grid[fin[0]][fin[1]][fin[2]] = endVariants;
  });
}

type Position = [number, number, number];

interface PathState {
  positions: Position[];
  length: number;
}

let desiredPathLength = 10; // Example length
let directionWeight = 1; // Positive to encourage closing

// Get neighbor position based on direction
function getNeighborPosition(position: Position, direction: Direction): Position {
  const [x, y, z] = position;
  switch (direction) {
    case "negativeX":
      return [x - 1, y, z];
    case "positiveX":
      return [x + 1, y, z];
    case "negativeY":
      return [x, y - 1, z];
    case "positiveY":
      return [x, y + 1, z];
    case "negativeZ":
      return [x, y, z - 1];
    case "positiveZ":
      return [x, y, z + 1];
  }
}

// Adjust tile weights
function adjustTileWeights(grid: Grid, position: Position, endPositions: Position[]): { [tileName: string]: number } {
  const [x, y, z] = position;
  const possibleTiles = grid[x][y][z];
  const adjustedWeights: { [tileName: string]: number } = {};

  possibleTiles.forEach((tileName) => {
    const tile = allTilesMap[tileName];
    let weightAdjustment = 0;

    tile.pathTo.forEach((direction) => {
      const neighborPos = getNeighborPosition(position, direction);
      const [nx, ny, nz] = neighborPos;

      // Ensure neighbor is within grid bounds
      if (nx < 0 || nx >= grid.size() || ny < 0 || ny >= grid[0].size() || nz < 0 || nz >= grid[0][0].size()) {
        return;
      }

      const distanceBefore = math.min(...endPositions.map((endPos) => taxicabDistance(position, endPos)));
      const distanceAfter = math.min(...endPositions.map((endPos) => taxicabDistance(neighborPos, endPos)));

      if (distanceAfter < distanceBefore) {
        // Moving closer to end
        weightAdjustment -= directionWeight;
      } else {
        // Moving away from end
        weightAdjustment += directionWeight;
      }
    });

    // Calculate adjusted weight for this tile (without modifying the global tile)
    const baseWeight = 1; // or use a default weight if defined
    const adjustedWeight = baseWeight + weightAdjustment;

    // Ensure weight is positive
    adjustedWeights[tileName] = math.max(adjustedWeight, 0.1); // Avoid zero or negative weights
  });

  return adjustedWeights;
}

// Select a tile based on weights
function selectTileBasedOnWeights(possibleTiles: string[]): string {
  if (possibleTiles.size() === 0) {
    error("wtf bad tiles!");
  }

  const tilesWithWeights = possibleTiles.map((tileName) => {
    const tile = allTilesMap[tileName];
    return { name: tileName, weight: tile.weight ?? 1 };
  });

  const totalWeight = tilesWithWeights.reduce((sum, tile) => sum + tile.weight, 0);
  let randomValue = random.NextNumber() * totalWeight;
  for (const tile of tilesWithWeights) {
    if (randomValue < tile.weight) {
      return tile.name;
    }
    randomValue -= tile.weight;
  }
  return tilesWithWeights[tilesWithWeights.size() - 1].name;
}

// Collapse at a position with parallel computation
function collapseAtPosition(
  grid: Grid,
  position: Position,
  currentPathState: PathState,
  endPositions: Position[],
  visited: Set<string>,
): void {
  print("at", position);
  const [x, y, z] = position;
  const possibleTiles = grid[x][y][z];
  adjustTileWeights(grid, position, endPositions);
  print("possible", possibleTiles);

  // Select tile with lowest adjusted weight
  const selectedTileName = selectTileBasedOnWeights(possibleTiles);
  grid[x][y][z] = [selectedTileName];
  print("selected", selectedTileName);

  // Update path state
  currentPathState.positions.push(position);
  currentPathState.length++;

  // Mark position as visited
  visited.add(position.join(","));

  // Propagate constraints to neighboring positions
  const tile = allTilesMap[selectedTileName];
  parallelForEach(tile.pathTo, (direction) => {
    print(direction);
    const neighborPos = getNeighborPosition(position, direction);
    const [nx, ny, nz] = neighborPos;

    if (nx < 0 || nx >= grid.size() || ny < 0 || ny >= grid[0].size() || nz < 0 || nz >= grid[0][0].size()) {
      return;
    }

    const posKey = neighborPos.join(",");
    if (visited.has(posKey)) {
      // Already visited this position
      return;
    }

    if (grid[nx][ny][nz].size() === 0) {
      return;
    }

    collapseAtPosition(grid, neighborPos, currentPathState, endPositions, visited);
  });
}

// Run the Wave Function Collapse algorithm with parallel computation
function runWaveFunctionCollapse(grid: Grid, startEndpairs: { start: Position; fin: Position }[]) {
  const visited = new Set<string>();
  const endPositions = startEndpairs.map((pair) => pair.fin);

  parallelForEach(startEndpairs, (pair) => {
    const currentPathState: PathState = { positions: [], length: 0 };
    print("here");
    collapseAtPosition(grid, pair.start, currentPathState, endPositions, visited);
  });

  // After paths are generated, fill in the rest of the grid
  // collapseRemainingGrid(grid);
}

// Collapse the remaining grid
function collapseRemainingGrid(grid: Grid): void {
  const xSize = grid.size();
  const ySize = grid[0].size();
  const zSize = grid[0][0].size();

  let positionsToProcess: Position[] = [];

  // Initialize positions to process
  for (let x = 0; x < xSize; x++) {
    for (let y = 0; y < ySize; y++) {
      for (let z = 0; z < zSize; z++) {
        if (grid[x][y][z].size() > 1) {
          positionsToProcess.push([x, y, z]);
        }
      }
    }
  }

  // let iter = 0;
  while (positionsToProcess.size() > 0) {
    // print("iter", iter);
    // iter = iter + 1;
    // Sort positions by entropy (number of possible tiles)
    positionsToProcess.sort((a, b) => grid[a[0]][a[1]][a[2]].size() - grid[b[0]][b[1]][b[2]].size() < 0);
    const position = positionsToProcess.shift();
    if (!position) break;
    const [x, y, z] = position;
    const possibleTiles = grid[x][y][z];

    // Select a tile randomly (you can use entropy calculation here)
    const selectedTileName = selectTileBasedOnWeights(possibleTiles);
    grid[x][y][z] = [selectedTileName];

    // Propagate constraints to neighboring positions
    const tile = allTilesMap[selectedTileName];

    for (const direction of DIRECTIONS) {
      const neighborPos = getNeighborPosition(position, direction);
      const [nx, ny, nz] = neighborPos;

      if (nx < 0 || nx >= xSize || ny < 0 || ny >= ySize || nz < 0 || nz >= zSize) {
        continue;
      }

      const neighborPossibleTiles = grid[nx][ny][nz];
      if (neighborPossibleTiles.size() <= 1) {
        continue;
      }

      // Get the tiles that are compatible in this direction
      const compatibleTiles = neighborPossibleTiles.filter((neighborTileName) => {
        const neighborTile = allTilesMap[neighborTileName];
        const oppositeDirection = getOppositeDirection(direction);
        // const compatible =
        //   tile.adjacency[direction].includes(neighborTileName) &&
        //   neighborTile.adjacency[oppositeDirection].includes(selectedTileName);
        const compatible = tile.adjacency[direction].includes(neighborTileName);
        return compatible;
      });

      if (compatibleTiles.size() < neighborPossibleTiles.size()) {
        grid[nx][ny][nz] = compatibleTiles;
        positionsToProcess.push([nx, ny, nz]);
      }

      if (compatibleTiles.size() === 0) {
        print(direction);
        print(neighborPossibleTiles);
        print(grid);
        error(`Contradiction found at position (${nx}, ${ny}, ${nz})`);
      }
    }
  }
}

// Get the opposite direction
function getOppositeDirection(direction: Direction): Direction {
  switch (direction) {
    case "negativeX":
      return "positiveX";
    case "positiveX":
      return "negativeX";
    case "negativeY":
      return "positiveY";
    case "positiveY":
      return "negativeY";
    case "negativeZ":
      return "positiveZ";
    case "positiveZ":
      return "negativeZ";
  }
}

const grid = initializeGrid();
print("starting!", grid);

const minDistance = 0; // Minimum taxicab distance
const numpears = 1; // Number of start-fin pears
const startEndpairs = selectValidPositions(grid, minDistance, numpears);
print(startEndpairs);

setStartAndEndTiles(grid, startEndpairs);

try {
  runWaveFunctionCollapse(grid, startEndpairs);
} catch (e) {
  print(e);
}

// The grid now contains the collapsed wave function with paths
// connecting the start and fin positions.
print(grid);

const xSize = grid.size();
const ySize = grid[0].size();
const zSize = grid[0][0].size();

// render the map incomplete or not

const x_off = 40;
const y_off = 40;
const z_off = 40;

for (let x = 0; x < xSize; x++) {
  for (let y = 0; y < ySize; y++) {
    for (let z = 0; z < zSize; z++) {
      if (grid[x][y][z].size() === 1) {
        let position = grid[x][y][z][0];
        let tile = allTilesMap[position];
        let model = tile.model.Clone();
        const newPos = new Vector3(50 + x * 8, y * 8, 50 + z * 8);
        const newCFrame = new CFrame(newPos).mul(model.GetPivot().Rotation);
        model.PivotTo(newCFrame);
        model.Parent = game.Workspace;
      }
    }
  }
}

export default {};
