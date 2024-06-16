import { Maze } from '@/Maze';
import { Tile } from '@/Tile';

function addCross(maze: Maze, tile: Tile): boolean {

    // Back up the five tiles that may change.
    tile.backup();
    const northTile = maze.tiles[tile.y - 1][tile.x];
    const eastTile = maze.tiles[tile.y][tile.x + 1];
    const southTile = maze.tiles[tile.y + 1][tile.x];
    const westTile = maze.tiles[tile.y][tile.x - 1];
    northTile.backup();
    eastTile.backup();
    southTile.backup();
    westTile.backup();

    if (Math.random() < 0.5) {
        // north-south hops east-west

        if (tile.lower.north) {
            tile.lower.north.south = tile.upper;
            tile.upper.north = tile.lower.north;
            tile.lower.north = null;
        } else {
            northTile.lower.south = tile.upper;
            tile.upper.north = northTile.lower;
        }

        if (tile.lower.south) {
            tile.lower.south.north = tile.upper;
            tile.upper.south = tile.lower.south;
            tile.lower.south = null;
        } else {
            southTile.lower.north = tile.upper;
            tile.upper.south = southTile.lower;
        }

        if (!tile.lower.east) {
            tile.lower.east = eastTile.lower;
            eastTile.lower.west = tile.lower;
        }

        if (!tile.lower.west) {
            tile.lower.west = westTile.lower;
            westTile.lower.east = tile.lower;
        }
    } else {
        // east-west hops north-south

        if (tile.lower.east) {
            tile.lower.east.west = tile.upper;
            tile.upper.east = tile.lower.east;
            tile.lower.east = null;
        } else {
            eastTile.lower.west = tile.upper;
            tile.upper.east = eastTile.lower;
        }

        if (tile.lower.west) {
            tile.lower.west.east = tile.upper;
            tile.upper.west = tile.lower.west;
            tile.lower.west = null;
        } else {
            westTile.lower.east = tile.upper;
            tile.upper.west = westTile.lower;
        }

        if (!tile.lower.north) {
            tile.lower.north = northTile.lower;
            northTile.lower.south = tile.lower;
        }

        if (!tile.lower.south) {
            tile.lower.south = southTile.lower;
            southTile.lower.north = tile.lower;
        }
    }

    return true; // TODO
}

function addCrosses(maze: Maze, crossFraction: number) {
    const tiles: Tile[] = [];
    for (let i = maze.height - 2; i >= 1; --i) {
        for (let j = maze.width - 2; j >= 1; --j) {
            tiles.push(maze.tiles[i][j]);
        }
    }

    const maxCrosses = Math.round(maze.width * maze.height * crossFraction);
    let crosses = 0;
    while (crosses < maxCrosses && tiles.length > 0) {
        const index = Math.floor(tiles.length * Math.random());
        const tile = tiles[index];
        tiles.splice(index, 1);
        if (addCross(maze, tile)) {
            ++crosses;
        }
    }
}

export function generateMaze(width: number, height: number, crossFraction: number): Maze {
    const maze = new Maze(width, height);
    addCrosses(maze, crossFraction);
    return maze;
}