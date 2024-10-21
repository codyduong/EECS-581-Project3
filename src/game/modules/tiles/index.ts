import forwardN from "./forward_n";
import forwardE from "./forward_e";
import forwardS from "./forward_s";
import forwardW from "./forward_w";
import grass1 from "./grass1";
import { Direction, DIRECTIONS, getOppositeDirection, Tile, TileAdj } from "game/modules/Tile";
import { getFaceVertices, isMatch, toVertexStrings } from "game/modules/VertexMap";

// eslint-disable-next-line prettier/prettier
const allTilesBasic = [
  forwardN,
  forwardE,
  forwardS,
  forwardW,
  grass1,
] as Tile[];

const allTilesAdj: TileAdj[] = allTilesBasic.map((tile) => {
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

  return tileAdj;
});

export default allTilesAdj;
