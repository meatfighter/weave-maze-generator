import { Maze } from '@/Maze';
import { Tile } from '@/Tile';
import { Node } from '@/Node';
import { generatePermutations, shuffleArray } from '@/arrays';
import { Terminal } from '@/Terminal';
import { TerminalSide } from '@/TerminalSide';
import { solveMaze } from '@/maze-solver';

function assignRegion(region: number, seed: Node, stack: Node[]): Node[] {

    const nodes: Node[] = [];
    seed.region = region;
    stack.push(seed);
    nodes.push(seed);

    try {
        while (true) {
            const node = stack.pop();
            if (!node) {
                break;
            }
            if (node.north && node.north.region < 0) {
                node.north.region = region;
                stack.push(node.north);
                nodes.push(node.north);
            }
            if (node.east && node.east.region < 0) {
                node.east.region = region;
                stack.push(node.east);
                nodes.push(node.east);
            }
            if (node.south && node.south.region < 0) {
                node.south.region = region;
                stack.push(node.south);
                nodes.push(node.south);
            }
            if (node.west && node.west.region < 0) {
                node.west.region = region;
                stack.push(node.west);
                nodes.push(node.west);
            }            
        }
    } finally {
        stack.length = 0;
    }

    return nodes;
}

function assignRegions(maze: Maze, stack: Node[]): Node[][] {
    const nodes: Node[][] = [ [] ];
    let id = 0;
    for (let i = maze.height - 1; i >= 0; --i) {
        for (let j = maze.width - 1; j >= 0; --j) {
            const tile = maze.tiles[i][j];
            if (tile.lower.region < 0) {
                nodes[id] = assignRegion(id, tile.lower, stack);
                ++id;
            }
            if (tile.upper.region < 0) {
                nodes[id] = assignRegion(id++, tile.upper, stack);
                ++id;
            }
        }
    }
    return nodes;
}

function findLoop(maze: Maze, seed: Node, stack: Node[]): boolean {

    for (let i = maze.height - 1; i >= 0; --i) {
        for (let j = maze.width - 1; j >= 0; --j) {
            const tile = maze.tiles[i][j];
            tile.lower.visitedBy = tile.upper.visitedBy = null;
        }
    }

    seed.visitedBy = seed;
    stack.push(seed);
    
    try {
        while (true) {
            const node = stack.pop();
            if (!node) {
                break;
            }
            if (node.north) {
                if (node.north.visitedBy) {
                    if (node.north !== node.visitedBy) {
                        return true;
                    }           
                } else {
                    node.north.visitedBy = node;
                    stack.push(node.north);
                }
            }
            if (node.east) {
                if (node.east.visitedBy) {
                    if (node.east !== node.visitedBy) {
                        return true;
                    }
                } else {
                    node.east.visitedBy = node;
                    stack.push(node.east);
                }
            }
            if (node.south) {
                if (node.south.visitedBy) {
                    if (node.south !== node.visitedBy) {
                        return true;
                    }
                } else {
                    node.south.visitedBy = node;
                    stack.push(node.south);
                }
            }
            if (node.west) {
                if (node.west.visitedBy) {
                    if (node.west !== node.visitedBy) {
                        return true;
                    }
                } else {
                    node.west.visitedBy = node;
                    stack.push(node.west);
                }
            }            
        }
    } finally {
        stack.length = 0;
    }

    return false;
}

function wireCross(tile: Tile, northTile: Tile, eastTile: Tile, southTile: Tile, westTile: Tile,
                   northSouthHopsEastWest: boolean) {

    if (northSouthHopsEastWest) {
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
}

function addNorthEastLoop(maze: Maze, tile: Tile, stack: Node[], northSouthHopsEastWest: boolean): boolean {

    const northTile = maze.tiles[tile.y - 1][tile.x];
    if (northTile.isNotFlat()) {
        return false;
    }
    const northEastTile = maze.tiles[tile.y - 1][tile.x + 1];
    if (northEastTile.isNotFlat()) {
        return false;
    }
    const eastTile = maze.tiles[tile.y][tile.x + 1];
    if (eastTile.isNotFlat()) {
        return false;
    }

    const southTile = maze.tiles[tile.y + 1][tile.x];
    const westTile = maze.tiles[tile.y][tile.x - 1];

    tile.backup();
    northTile.backup();
    northEastTile.backup();
    eastTile.backup();
    southTile.backup();
    westTile.backup();

    wireCross(tile, northTile, eastTile, southTile, westTile, northSouthHopsEastWest);

    if (!northTile.lower.east) {
        northTile.lower.east = northEastTile.lower;
        northEastTile.lower.west = northTile.lower;
    }
    if (!eastTile.lower.north) {
        eastTile.lower.north = northEastTile.lower;
        northEastTile.lower.south = eastTile.lower;
    }

    if (findLoop(maze, tile.lower, stack) || findLoop(maze, tile.upper, stack)) {
        tile.restore();
        northTile.restore();
        northEastTile.restore();
        eastTile.restore();
        southTile.restore();
        westTile.restore();
        return false
    }

    return true;
}

function addSouthEastLoop(maze: Maze, tile: Tile, stack: Node[], northSouthHopsEastWest: boolean): boolean {

    const southTile = maze.tiles[tile.y + 1][tile.x];
    if (southTile.isNotFlat()) {
        return false;
    }
    const southEastTile = maze.tiles[tile.y + 1][tile.x + 1];
    if (southEastTile.isNotFlat()) {
        return false;
    }
    const eastTile = maze.tiles[tile.y][tile.x + 1];
    if (eastTile.isNotFlat()) {
        return false;
    }

    const northTile = maze.tiles[tile.y - 1][tile.x];
    const westTile = maze.tiles[tile.y][tile.x - 1];

    tile.backup();
    northTile.backup();
    southEastTile.backup();
    eastTile.backup();
    southTile.backup();
    westTile.backup();

    wireCross(tile, northTile, eastTile, southTile, westTile, northSouthHopsEastWest);

    if (!southTile.lower.east) {
        southTile.lower.east = southEastTile.lower;
        southEastTile.lower.west = southTile.lower;
    }
    if (!eastTile.lower.south) {
        eastTile.lower.south = southEastTile.lower;
        southEastTile.lower.north = eastTile.lower;
    }

    if (findLoop(maze, tile.lower, stack) || findLoop(maze, tile.upper, stack)) {
        tile.restore();
        northTile.restore();
        southEastTile.restore();
        eastTile.restore();
        southTile.restore();
        westTile.restore();
        return false
    }

    return true;
}

function addSouthWestLoop(maze: Maze, tile: Tile, stack: Node[], northSouthHopsEastWest: boolean): boolean {

    const southTile = maze.tiles[tile.y + 1][tile.x];
    if (southTile.isNotFlat()) {
        return false;
    }
    const southWestTile = maze.tiles[tile.y + 1][tile.x - 1];
    if (southWestTile.isNotFlat()) {
        return false;
    }
    const westTile = maze.tiles[tile.y][tile.x - 1];
    if (westTile.isNotFlat()) {
        return false;
    }

    const northTile = maze.tiles[tile.y - 1][tile.x];
    const eastTile = maze.tiles[tile.y][tile.x + 1];

    tile.backup();
    northTile.backup();
    southWestTile.backup();
    eastTile.backup();
    southTile.backup();
    westTile.backup();

    wireCross(tile, northTile, eastTile, southTile, westTile, northSouthHopsEastWest);

    if (!southTile.lower.west) {
        southTile.lower.west = southWestTile.lower;
        southWestTile.lower.east = southTile.lower;
    }
    if (!westTile.lower.south) {
        westTile.lower.south = southWestTile.lower;
        southWestTile.lower.north = westTile.lower;
    }

    if (findLoop(maze, tile.lower, stack) || findLoop(maze, tile.upper, stack)) {
        tile.restore();
        northTile.restore();
        southWestTile.restore();
        eastTile.restore();
        southTile.restore();
        westTile.restore();
        return false
    }

    return true;
}

function addNorthWestLoop(maze: Maze, tile: Tile, stack: Node[], northSouthHopsEastWest: boolean): boolean {

    const northTile = maze.tiles[tile.y - 1][tile.x];
    if (northTile.isNotFlat()) {
        return false;
    }
    const northWestTile = maze.tiles[tile.y - 1][tile.x - 1];
    if (northWestTile.isNotFlat()) {
        return false;
    }
    const westTile = maze.tiles[tile.y][tile.x - 1];
    if (westTile.isNotFlat()) {
        return false;
    }

    const southTile = maze.tiles[tile.y + 1][tile.x];
    const eastTile = maze.tiles[tile.y][tile.x + 1];

    tile.backup();
    northTile.backup();
    northWestTile.backup();
    eastTile.backup();
    southTile.backup();
    westTile.backup();

    wireCross(tile, northTile, eastTile, southTile, westTile, northSouthHopsEastWest);

    if (!northTile.lower.west) {
        northTile.lower.west = northWestTile.lower;
        northWestTile.lower.east = northTile.lower;
    }
    if (!westTile.lower.north) {
        westTile.lower.north = northWestTile.lower;
        northWestTile.lower.south = westTile.lower;
    }

    if (findLoop(maze, tile.lower, stack) || findLoop(maze, tile.upper, stack)) {
        tile.restore();
        northTile.restore();
        northWestTile.restore();
        eastTile.restore();
        southTile.restore();
        westTile.restore();
        return false
    }

    return true;
}

function addCross(maze: Maze, tile: Tile, stack: Node[], northSouthHopsEastWest: boolean): boolean {

    const northTile = maze.tiles[tile.y - 1][tile.x];
    const eastTile = maze.tiles[tile.y][tile.x + 1];
    const southTile = maze.tiles[tile.y + 1][tile.x];
    const westTile = maze.tiles[tile.y][tile.x - 1];

    tile.backup();
    northTile.backup();
    eastTile.backup();
    southTile.backup();
    westTile.backup();

    wireCross(tile, northTile, eastTile, southTile, westTile, northSouthHopsEastWest);

    if (findLoop(maze, tile.lower, stack) || findLoop(maze, tile.upper, stack)) {
        tile.restore();
        northTile.restore();
        eastTile.restore();
        southTile.restore();
        westTile.restore();
        return false
    }

    return true;
}

function addLoopsAndCrosses(maze: Maze, loopFraction: number, crossFraction: number, stack: Node[],
                            permutations: number[][]) {

    const tiles: Tile[] = [];
    for (let i = maze.height - 2; i >= 1; --i) {
        for (let j = maze.width - 2; j >= 1; --j) {
            tiles.push(maze.tiles[i][j]);
        }
    }

    let loops = 0;
    let crosses = 0;

    const maxLoops = Math.round(maze.width * maze.height * loopFraction);
    while (loops < maxLoops && tiles.length > 0) {
        const index = Math.floor(tiles.length * Math.random());
        const tile = tiles[index];
        tiles.splice(index, 1);
        const permutation = permutations[Math.floor(permutations.length * Math.random())];
        for (let i = permutation.length - 1; i >= 0; --i) {
            let addLoop: (maze: Maze, tile: Tile, stack: Node[], northSouthHopsEastWest: boolean) => boolean;
            switch (permutation[i]) {
                case 0:
                    addLoop = addNorthEastLoop;
                    break;
                case 1:
                    addLoop = addSouthEastLoop;
                    break;
                case 2:
                    addLoop = addSouthWestLoop;
                    break;
                default:
                    addLoop = addNorthWestLoop;
                    break;
            }
            const northSouthHopsEastWest = Math.random() < 0.5;
            if (addLoop(maze, tile, stack, northSouthHopsEastWest)) {
                ++crosses;
                ++loops;
                break;
            } else if (addLoop(maze, tile, stack, !northSouthHopsEastWest)) {
                ++crosses;
                ++loops;
                break;
            }
        }
    }

    tiles.length = 0;
    for (let i = maze.height - 2; i >= 1; --i) {
        for (let j = maze.width - 2; j >= 1; --j) {
            if (maze.tiles[i][j].isFlat()) {
                tiles.push(maze.tiles[i][j]);
            }
        }
    }

    const maxCrosses = Math.round(maze.width * maze.height * crossFraction);
    while (crosses < maxCrosses && tiles.length > 0) {
        const index = Math.floor(tiles.length * Math.random());
        const tile = tiles[index];
        tiles.splice(index, 1);
        const northSouthHopsEastWest = Math.random() < 0.5;
        if (addCross(maze, tile, stack, northSouthHopsEastWest)) {
            ++crosses;
        } else if (addCross(maze, tile, stack, !northSouthHopsEastWest)) {
            ++crosses;
        }
    }
}

function mergeRegions(region1: number, region2: number, regions: Node[][]) {
    const region1Nodes = regions[region1];
    const region2Nodes = regions[region2];

    for (const node of region1Nodes) {
        node.region = region2;
        region2Nodes.push(node);
    }

    regions[region1] = [];
}

function moveToEnd(nodes: Node[], node: Node) {
    const index = nodes.indexOf(node);
    if (index < 0 || index === nodes.length - 1) {
        return;
    }
    nodes.splice(index, 1);
    nodes.push(node);
}

function createSpanningTree(maze: Maze, nodes: Node[], permutations: number[][], regions: Node[][],
                            longCorridors: boolean) {

    const maxX = maze.width - 1;
    const maxY = maze.height - 1;

    for (let i = maxY; i >= 0; --i) {
        for (let j = maxX; j >= 0; --j) {
            const tile = maze.tiles[i][j];
            if (!(tile.upper.north || tile.upper.east)) {
                nodes.push(tile.lower);
            }
        }
    }

    if (longCorridors) {
        shuffleArray(nodes);
    }

    outer: while (nodes.length > 0) {
        const index = longCorridors ? nodes.length - 1 : Math.floor(nodes.length * Math.random());
        const node = nodes[index];
        if (longCorridors) {
            moveToEnd(nodes, node);
        }

        const tile = node.tile;
        const permutation = permutations[Math.floor(permutations.length * Math.random())];
        for (let i = permutation.length - 1; i >= 0; --i) {
            switch (permutation[i]) {
                case 0: {
                    // north
                    if (tile.y === 0 || node.north) {
                        continue;
                    }
                    const northTile = maze.tiles[tile.y - 1][tile.x];
                    if (northTile.lower.region === node.region) {
                        continue;
                    }
                    northTile.lower.south = node;
                    node.north = northTile.lower;
                    if (longCorridors) {
                        moveToEnd(nodes, node.north);
                    }
                    mergeRegions(northTile.lower.region, node.region, regions);
                    continue outer;
                }
                case 1:   {
                    // east
                    if (tile.x === maxX || node.east) {
                        continue;
                    }
                    const eastTile = maze.tiles[tile.y][tile.x + 1];
                    if (eastTile.lower.region === node.region) {
                        continue;
                    }
                    eastTile.lower.west = node;
                    node.east = eastTile.lower;
                    if (longCorridors) {
                        moveToEnd(nodes, node.east);
                    }
                    mergeRegions(eastTile.lower.region, node.region, regions);
                    continue outer;
                }
                case 2: {
                    // south
                    if (tile.y === maxY || node.south) {
                        continue;
                    }
                    const southTile = maze.tiles[tile.y + 1][tile.x];
                    if (southTile.lower.region === node.region) {
                        continue;
                    }
                    southTile.lower.north = node;
                    node.south = southTile.lower;
                    if (longCorridors) {
                        moveToEnd(nodes, node.south);
                    }
                    mergeRegions(southTile.lower.region, node.region, regions);
                    continue outer;
                }
                default: {
                    // west
                    if (tile.x === 0 || node.west) {
                        continue;
                    }
                    const westTile = maze.tiles[tile.y][tile.x - 1];
                    if (westTile.lower.region === node.region) {
                        continue;
                    }
                    westTile.lower.east = node;
                    node.west = westTile.lower;
                    if (longCorridors) {
                        moveToEnd(nodes, node.west);
                    }
                    mergeRegions(westTile.lower.region, node.region, regions);
                    continue outer;
                }
            }
        }

        if (longCorridors) {
            nodes.pop();
        } else {
            nodes.splice(index, 1);
        }
    }
}

function addTerminal(maze: Maze, terminal: Terminal): Tile {
    switch (terminal.side) {
        case TerminalSide.NORTH: {
            const tile = maze.tiles[0][Math.round(terminal.position * (maze.width - 1))];
            if (terminal.open) {
                tile.lower.north = tile.lower;
            }
            return tile;
        }
        case TerminalSide.EAST: {
            const tile = maze.tiles[Math.round(terminal.position * (maze.height - 1))][maze.width - 1];
            if (terminal.open) {
                tile.lower.east = tile.lower;
            }
            return tile;
        }
        case TerminalSide.SOUTH: {
            const tile = maze.tiles[maze.height - 1][Math.round(terminal.position * (maze.width - 1))];
            if (terminal.open) {
                tile.lower.south = tile.lower;
            }
            return tile;
        }
        default: {
            const tile = maze.tiles[Math.round(terminal.position * (maze.height - 1))][0];
            if (terminal.open) {
                tile.lower.west = tile.lower;
            }
            return tile;
        }
    }
}

export function generateMaze(width: number,
                             height: number,
                             loopFraction: number,
                             crossFraction: number,
                             longCorridors: boolean,
                             startTerminal: Terminal,
                             endTerminal: Terminal): Maze {

    const maze = new Maze(width, height);
    const permutations = generatePermutations([ 0, 1, 2, 3]);
    const stack: Node[] = [];
    addLoopsAndCrosses(maze, loopFraction, crossFraction, stack, permutations);
    const regions = assignRegions(maze, stack);
    createSpanningTree(maze, stack, permutations, regions, longCorridors);
    maze.startTile = addTerminal(maze, startTerminal);
    maze.endTile = addTerminal(maze, endTerminal);

    solveMaze(maze);

    return maze;
}