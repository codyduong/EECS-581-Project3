/**
 * @author Cody Duong
 * @file
 *
 * There's a lot of invariants about how grid and wcf works that makes this work...
 *
 * It is built generically to handle any arbitrary graph path. Except that tiles cannot have multiple entries and exits.
 */
import { TileAdj } from "./Tile";
import { isStart, isPath } from "./tiles";
import { CollapsedGrid } from "./WFC";

export type Vector3Key = string; // Used for hashing Vector3 positions

export interface Node {
  pos: Vector3; // Position in world space
  tileCoord: Vector3; // The grid coordinate of the tile this node belongs to
  prev: Vector3Key[]; // Keys of previous nodes
  next: Vector3Key[]; // Keys of next nodes
}

export class PathGenerator {
  // Helper method to get a unique key for a Vector3 position
  // TODO: this should not be in this class... refactor
  static vector3ToKey(vec: Vector3): Vector3Key {
    return `${vec.X},${vec.Y},${vec.Z}`;
  }

  private static roundVector3(vec: Vector3): Vector3 {
    return new Vector3(math.round(vec.X), math.round(vec.Y), math.round(vec.Z));
  }

  static fromGrid(grid: CollapsedGrid): [startNodes: Node[], path: Map<Vector3Key, Node>] {
    const startCoords: Vector3[] = [];

    // Collect start coordinates
    grid.forEach((plane, x) =>
      plane.forEach((col, y) =>
        col.forEach((tile, z) => {
          if (isStart(tile.name)) {
            startCoords.push(new Vector3(x, y, z));
          }
        }),
      ),
    );

    print("Start Coordinates:", startCoords);

    const nodeMap = new Map<Vector3Key, Node>(); // Map from position key to Node
    const tileNodes = new Map<Vector3Key, Node[]>(); // Map tile coordinate keys to their nodes

    // First, build inner paths for each tile that contains a path
    grid.forEach((plane, x) =>
      plane.forEach((col, y) =>
        col.forEach((tile, z) => {
          const tileCoord = new Vector3(x, y, z);
          const tileKey = this.vector3ToKey(tileCoord);

          // Check if the tile contains a path
          if (!isPath(tile.name)) {
            // If the tile doesn't contain a path, skip processing
            return;
          }

          const innerPaths = this.extractInnerPaths(tile);

          // Convert inner paths to Nodes and update the nodeMap
          const nodesInTile: Node[] = [];
          print(tile.name, innerPaths);
          let prevNodeKey: Vector3Key | undefined;

          innerPaths.forEach((nodePositions) => {
            nodePositions.forEach((nodePos) => {
              const roundedPos = this.roundVector3(nodePos);
              const posKey = this.vector3ToKey(roundedPos);

              let node = nodeMap.get(posKey);
              if (!node) {
                node = { pos: roundedPos, tileCoord, prev: [], next: [] };
                nodeMap.set(posKey, node);
              }

              nodesInTile.push(node);

              if (prevNodeKey !== undefined) {
                // Update previous node's next array
                const prevNode = nodeMap.get(prevNodeKey);
                if (prevNode !== undefined && !prevNode.next.includes(posKey)) {
                  prevNode.next.push(posKey);
                }
                // Update current node's prev array
                if (!node.prev.includes(prevNodeKey)) {
                  node.prev.push(prevNodeKey);
                }
              }
              prevNodeKey = posKey;
            });
          });

          // Store nodes associated with this tile
          tileNodes.set(tileKey, nodesInTile);
        }),
      ),
    );

    const startNodes: Node[] = [];

    startCoords
      .map((coords) => tileNodes.get(this.vector3ToKey(coords)))
      .filterUndefined()
      .forEach((nodes) => {
        nodes.filter((node) => node.prev.size() === 0).forEach((node) => startNodes.push(node));
      });

    return [startNodes, nodeMap];
  }

  // Helper method to extract inner paths from a tile
  private static extractInnerPaths(tile: TileAdj): Vector3[][] {
    const folder = tile.model.GetChildren().find((c): c is Folder => classIs(c, "Folder") && c.Name === "Path");
    assert(folder !== undefined, "Path folder not found.");

    const pathSegments = new Map<number, Vector3[]>();

    folder
      .GetChildren()
      .filter((c): c is Part => classIs(c, "Part"))
      .forEach((part) => {
        let pathNo = tonumber(part.Name, 10);
        assert(pathNo !== undefined, `Path number undefined for part: ${part.Name}`);
        assert(pathNo > 0, "Path should start at 1");

        if (!pathSegments.has(pathNo)) {
          pathSegments.set(pathNo, []);
        }
        pathSegments.get(pathNo)!.push(this.roundVector3(part.Position));
      });

    // print(pathSegments);

    // Collect all inner paths from the map
    const innerPaths: Vector3[][] = [];
    pathSegments.forEach((nodes) => {
      innerPaths.push(nodes);
    });

    return innerPaths;
  }
}
