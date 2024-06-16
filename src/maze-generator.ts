import { Maze } from '@/Maze';
import { TileType } from '@/TileType';
import { NodeState } from '@/NodeState';
import { Tile } from '@/Tile';
import { WalkElement } from '@/WalkElement';

function addCrosses(maze: Maze, probability: number) {
    for (let i = maze.height - 2; i >= 1; --i) {
        for (let j = maze.width - 2; j >= 1; --j) {
            if (Math.random() >= probability) {
                continue;
            }
            const tile = maze.tiles[i][j];
            tile.tileType = (Math.random() < 0.5) ? TileType.NORTH_SOUTH_HOPS_EAST_WEST
                    : TileType.EAST_WEST_HOPS_NORTH_SOUTH;
            tile.north = tile.east = tile.south = tile.west = true;
            tile.nodeStates.push(NodeState.UNVISITED);
        }
    }
}

function pickFirstNode(maze: Maze) {
    const tile = maze.tiles[Math.floor(maze.height * Math.random())][Math.floor(maze.width * Math.random())];
    tile.nodeStates[(tile.tileType === TileType.FLAT || Math.random() < 0.5) ? 0 : 1] = NodeState.SPANNING_TREE;
}

function pickUnvisitedNode(maze: Maze): WalkElement | undefined {
    const tiles: Tile[] = [];
    for (let i = maze.height - 1; i >= 0; --i) {
        for (let j = maze.width - 1; j >= 0; --j) {
            const tile = maze.tiles[i][j];
            if (tile.nodeStates[0] === NodeState.UNVISITED
                    || (tile.tileType !== TileType.FLAT && tile.nodeStates[1] === NodeState.UNVISITED)) {
                tiles.push(maze.tiles[i][j]);
            }
        }
    }
    if (tiles.length === 0) {
        return undefined;
    }
    const tile = tiles[Math.floor(tiles.length * Math.random())];

    let nodeStateIndex = 0;
    if (tile.tileType !== TileType.FLAT) {
        if (tile.nodeStates[0] === NodeState.SPANNING_TREE) {
            nodeStateIndex = 1;
        } else if (tile.nodeStates[1] !== NodeState.SPANNING_TREE) {
            nodeStateIndex = Math.round(Math.random());
        }
    }
    tile.nodeStates[nodeStateIndex] = NodeState.RANDOM_WALK;

    return new WalkElement(tile, nodeStateIndex, Direction.NONE);
}

function removeLoop(walk: WalkElement[], tile: Tile, nodeStateIndex: number): WalkElement {
    while (true) {
        const element = walk.pop();
        if (!element) {
            break;
        }
        tile.nodeStates[element.nodeStateIndex] = NodeState.UNVISITED;
        if (element.tile === tile && element.nodeStateIndex === nodeStateIndex) {
            break;
        }
    }
    return walk[walk.length - 1];
}

function joinWalk(tiles: Tile[][], walk: WalkElement[]) {
    walk.forEach(element => {
        element.tile.nodeStates[element.nodeStateIndex] = NodeState.SPANNING_TREE;
        switch (element.direction) {
            // TODO
        }
    });
}

export function generateMaze(width: number, height: number, crossProbability: number): Maze {
    const directions = [ Direction.NORTH, Direction.EAST, Direction.SOUTH, Direction.WEST ];
    const maze = new Maze(width, height);
    const tiles = maze.tiles;
    const maxX = maze.width - 1;
    const maxY = maze.height - 1;
    addCrosses(maze, crossProbability);
    pickFirstNode(maze);

    const walk: WalkElement[] = [];
    while (true) {
        walk.length = 0;
        let e = pickUnvisitedNode(maze);
        if (!e) {
            break;
        }
        let element = e;
        walk.push(element);

        outer: while (true) {
            const direction = directions[Math.floor(4 * Math.random())];
            const tile = element.tile;
            let nextTile = element.tile;
            let nextNodeStateIndex = element.nodeStateIndex;
            switch (direction) {
                case Direction.NORTH: {
                    if (tile.y === 0 || walk[walk.length - 1].direction === Direction.SOUTH) {
                        continue;
                    }
                    nextTile = tiles[tile.y - 1][tile.x];
                    nextNodeStateIndex = (nextTile.tileType === TileType.NORTH_SOUTH_HOPS_EAST_WEST) ? 1 : 0;
                    break;
                }
                case Direction.EAST:
                    if (tile.x === maxX || walk[walk.length - 1].direction === Direction.WEST) {
                        continue;
                    }
                    nextTile = tiles[tile.y][tile.x + 1];
                    nextNodeStateIndex = (nextTile.tileType === TileType.EAST_WEST_HOPS_NORTH_SOUTH) ? 1 : 0;
                    break;
                case Direction.SOUTH:
                    if (tile.y === maxY || walk[walk.length - 1].direction === Direction.NORTH) {
                        continue;
                    }
                    nextTile = tiles[tile.y + 1][tile.x];
                    nextNodeStateIndex = (nextTile.tileType === TileType.NORTH_SOUTH_HOPS_EAST_WEST) ? 1 : 0;
                    break;
                case Direction.WEST:
                    if (tile.x === 0 || walk[walk.length - 1].direction === Direction.EAST) {
                        continue;
                    }
                    nextTile = tiles[tile.y][tile.x - 1];
                    nextNodeStateIndex = (nextTile.tileType === TileType.EAST_WEST_HOPS_NORTH_SOUTH) ? 1 : 0;
                    break;
            }
            switch (nextTile.nodeStates[nextNodeStateIndex]) {
                case NodeState.UNVISITED:
                    nextTile.nodeStates[nextNodeStateIndex] = NodeState.RANDOM_WALK;
                    element = new WalkElement(nextTile, nextNodeStateIndex, direction);
                    walk.push(element);
                    break;
                case NodeState.RANDOM_WALK:
                    element = removeLoop(walk, nextTile, nextNodeStateIndex);
                    break;
                case NodeState.SPANNING_TREE:
                    joinWalk(tiles, walk);
                    break outer;
            }
        }
    }
    return maze;
}