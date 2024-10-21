import { Direction } from "./Tile";

/** a cube subdivided into 8 smaller cubes with common vertexes moved. ie. expected 26 vertexes, 
due to missing one in the center of all 8 smaller cubes (ie. center of larger)*/
export type VertexMap = [VertexPlane, VertexPlane, VertexPlane];
export type VertexPlane = [Vertex, Vertex, Vertex];
export type Vertex = [x: boolean, y: boolean, z: boolean];
export type VertexString = `${number},${number},${number}`;

export function createEmptyVertexMap(depth = 3, rows = 3, cols = 3): VertexMap {
  let result = [];
  for (let i = 0; i < depth; i++) {
    let rowArray = [];
    for (let j = 0; j < rows; j++) {
      let colArray = [];
      for (let k = 0; k < cols; k++) {
        colArray.push(false);
      }
      rowArray.push(colArray);
    }
    result.push(rowArray);
  }
  return result as unknown as VertexMap;
}

export function toVertexStrings(grid: VertexMap): VertexString[] {
  const flatArray: VertexString[] = [];
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      for (let z = 0; z < 3; z++) {
        if (grid[x][y][z]) {
          flatArray.push(`${x},${y},${z}`);
        }
      }
    }
  }
  return flatArray;
}

export function toVertexMap(flatArray: VertexString[]): VertexMap {
  const grid = createEmptyVertexMap();

  for (const vertex of flatArray) {
    const [x, y, z] = vertex.split(",").map((n) => tonumber(n, 10)!);
    grid[x][y][z] = true; // Mark presence of the vertex
  }

  return grid;
}

export function rotateZ(grid: VertexMap): VertexMap {
  const rotated = createEmptyVertexMap();

  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      for (let z = 0; z < 3; z++) {
        rotated[y][2 - x][z] = grid[x][y][z]; // 90-degree rotation
      }
    }
  }

  return rotated;
}

// Function to mirror the 3D array on the X-axis
export function mirrorX(grid: VertexMap): VertexMap {
  const mirrored = createEmptyVertexMap();

  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      for (let z = 0; z < 3; z++) {
        mirrored[2 - x][y][z] = grid[x][y][z]; // Mirror on X-axis
      }
    }
  }

  return mirrored;
}

export function getFaceVertices(grid: VertexMap, face: Direction): VertexPlane {
  switch (face) {
    case "positiveX":
      // Extract the face at x = 2 (positive X)
      return grid[2];
    case "negativeX":
      // Extract the face at x = 0 (negative X)
      return grid[0];
    case "positiveY":
      // Extract y = 2 row from each layer
      return grid.map((layer) => layer[2]) as VertexPlane;
    case "negativeY":
      // Extract y = 0 row from each layer
      return grid.map((layer) => layer[0]) as VertexPlane;
    case "positiveZ":
      // Extract z = 2 from each row
      return grid.map((layer) => layer.map((row) => row[2])) as VertexPlane;
    case "negativeZ":
      // Extract z = 0 from each row
      return grid.map((layer) => layer.map((row) => row[0])) as VertexPlane;
    default:
      error("Invalid face direction");
  }
}

function facesMatch(faceA: VertexPlane, faceB: VertexPlane): boolean {
  for (let y = 0; y < 3; y++) {
    for (let z = 0; z < 3; z++) {
      // Check if the corresponding vertices match
      if (faceA[y][z] !== faceB[y][z]) {
        return false;
      }
    }
  }
  return true;
}

export function isMatch(gridA: VertexMap, gridB: VertexMap, direction: Direction): boolean {
  // Determine the faces to compare based on the specified direction
  let faceA: VertexPlane;
  let faceB: VertexPlane;

  switch (direction) {
    case "positiveX":
      faceA = getFaceVertices(gridA, "positiveX");
      faceB = getFaceVertices(gridB, "negativeX");
      break;
    case "negativeX":
      faceA = getFaceVertices(gridA, "negativeX");
      faceB = getFaceVertices(gridB, "positiveX");
      break;
    case "positiveY":
      faceA = getFaceVertices(gridA, "positiveY");
      faceB = getFaceVertices(gridB, "negativeY");
      break;
    case "negativeY":
      faceA = getFaceVertices(gridA, "negativeY");
      faceB = getFaceVertices(gridB, "positiveY");
      break;
    case "positiveZ":
      faceA = getFaceVertices(gridA, "positiveZ");
      faceB = getFaceVertices(gridB, "negativeZ");
      break;
    case "negativeZ":
      faceA = getFaceVertices(gridA, "negativeZ");
      faceB = getFaceVertices(gridB, "positiveZ");
      break;
    default:
      error("Invalid direction for comparison");
  }

  // Check if the faces match
  return facesMatch(faceA, faceB);
}
