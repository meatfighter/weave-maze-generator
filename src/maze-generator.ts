import { Maze } from '@/Maze';
import { TileType } from '@/TileType';
import { Region } from '@/Region';
import { Tile } from '@/Tile';
import { Node } from '@/Node';

function addCrosses(maze: Maze, probability: number) {
    for (let i = maze.height - 2; i >= 1; --i) {
        for (let j = maze.width - 2; j >= 1; --j) {
            if (Math.random() >= probability) {
                continue;
            }
            if (Math.random() < 0.5) {
                maze.tiles[i][j].tileType = TileType.NORTH_SOUTH_HOPS_EAST_WEST;
            } else {
                maze.tiles[i][j].tileType = TileType.EAST_WEST_HOPS_NORTH_SOUTH;
            }
        }
    }
}

function pickFirstNode(maze: Maze) {
    const tile = maze.tiles[Math.floor(maze.height * Math.random())][Math.floor(maze.width * Math.random())];
    if (tile.tileType === TileType.NORTH_SOUTH_HOPS_EAST_WEST
            || tile.tileType === TileType.EAST_WEST_HOPS_NORTH_SOUTH) {
        if (Math.random() < 0.5) {
            tile.upperRegion = Region.SPANNING_TREE;
        } else {
            tile.lowerRegion = Region.SPANNING_TREE;
        }
    } else {
        tile.upperRegion = tile.lowerRegion = Region.SPANNING_TREE;
    }
}

function pickUnvisitedNode(maze: Maze): Node | undefined {
    const tiles: Tile[] = [];
    for (let i = maze.height - 1; i >= 0; --i) {
        for (let j = maze.width - 1; j >= 0; --j) {
            if (maze.tiles[i][j].upperRegion === Region.UNVISITED
                    || maze.tiles[i][j].lowerRegion === Region.UNVISITED) {
                tiles.push(maze.tiles[i][j]);
            }
        }
    }
    if (tiles.length === 0) {
        return undefined;
    }
    const tile = tiles[Math.floor(tiles.length * Math.random())];

    let lower = true;
    if (tile.tileType === TileType.NORTH_SOUTH_HOPS_EAST_WEST
        || tile.tileType === TileType.EAST_WEST_HOPS_NORTH_SOUTH) {
        if (tile.upperRegion === Region.SPANNING_TREE) {
            tile.lowerRegion = Region.RANDOM_WALK;
        } else if (tile.lowerRegion === Region.SPANNING_TREE) {
            tile.upperRegion = Region.RANDOM_WALK;
            lower = false;
        } else if (Math.random() < 0.5) {
            tile.lowerRegion = Region.RANDOM_WALK;
        } else {
            tile.upperRegion = Region.RANDOM_WALK;
            lower = false;
        }
    } else {
        tile.upperRegion = tile.lowerRegion = Region.RANDOM_WALK;
    }

    return new Node(tile, lower);
}

function removeLoop(path: Node[], tile: Tile, lower: boolean): Node {
    while (true) {
        const node = path.pop();
        if (!node || (node.tile === tile && node.lower === lower)) {
            break;
        }
    }
    return path[path.length - 1];
}

export function generateMaze(width: number, height: number, crossProbability: number): Maze {
    const maze = new Maze(width, height);
    const tiles = maze.tiles;
    const maxX = maze.width - 1;
    const maxY = maze.height - 1;
    addCrosses(maze, crossProbability);
    pickFirstNode(maze);

    const path: Node[] = [];
    while (true) {
        path.length = 0;
        let node = pickUnvisitedNode(maze);
        if (!node) {
            break;
        }
        path.push(node);

        while (true) {
            const direction = Math.floor(4 * Math.random());
            const { tile, lower } = node;
            switch (direction) {
                case 0: {
                    if (tile.y === 0) {
                        continue;
                    }
                    switch (tile.tileType) {
                        case TileType.EMPTY:
                        case TileType.SOUTH:
                        case TileType.EAST:
                        case TileType.WEST:
                        case TileType.SOUTH_EAST:
                        case TileType.SOUTH_WEST:
                        case TileType.EAST_WEST_SOUTH:
                            continue;
                    }
                    if (lower) {
                        if (tile.tileType === TileType.NORTH_SOUTH_HOPS_EAST_WEST) {
                            continue;
                        }
                    } else if (tile.tileType === TileType.EAST_WEST_HOPS_NORTH_SOUTH) {
                        continue;
                    }
                    const nextTile = tiles[tile.y - 1][tile.x];
                    const nextLower = nextTile.tileType !== TileType.NORTH_SOUTH_HOPS_EAST_WEST;
                    if (nextLower) {
                        if (nextTile.lowerRegion === Region.RANDOM_WALK) {
                            node = removeLoop(path, nextTile, true);
                            continue;
                        }
                    } else if (nextTile.upperRegion === Region.RANDOM_WALK) {
                        node = removeLoop(path, nextTile, false);
                        continue;
                    }
                    
                    break;
                }
                case 1:
                    if (tile.x === maxX) {
                        continue;
                    }
                    break;
                case 2:
                    if (tile.y === maxY) {
                        continue;
                    }
                    break;
                case 3:
                    if (tile.x === 0) {
                        continue;
                    }
                    break;
            }
        }
    }
    return maze;
}