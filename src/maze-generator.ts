import { Maze } from '@/Maze';
import { Cell } from '@/Cell';
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
            const cell = maze.cells[i][j];
            if (cell.lower.region < 0) {
                nodes[id] = assignRegion(id, cell.lower, stack);
                ++id;
            }
            if (cell.upper.region < 0) {
                nodes[id] = assignRegion(id++, cell.upper, stack);
                ++id;
            }
        }
    }
    return nodes;
}

function findLoop(maze: Maze, seed: Node, stack: Node[]): boolean {

    for (let i = maze.height - 1; i >= 0; --i) {
        for (let j = maze.width - 1; j >= 0; --j) {
            const cell = maze.cells[i][j];
            cell.lower.visitedBy = cell.upper.visitedBy = null;
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

function wireCross(cell: Cell, northCell: Cell, eastCell: Cell, southCell: Cell, westCell: Cell,
                   northSouthHopsEastWest: boolean) {

    if (northSouthHopsEastWest) {
        // north-south hops east-west

        if (cell.lower.north) {
            cell.lower.north.south = cell.upper;
            cell.upper.north = cell.lower.north;
            cell.lower.north = null;
        } else {
            northCell.lower.south = cell.upper;
            cell.upper.north = northCell.lower;
        }

        if (cell.lower.south) {
            cell.lower.south.north = cell.upper;
            cell.upper.south = cell.lower.south;
            cell.lower.south = null;
        } else {
            southCell.lower.north = cell.upper;
            cell.upper.south = southCell.lower;
        }

        if (!cell.lower.east) {
            cell.lower.east = eastCell.lower;
            eastCell.lower.west = cell.lower;
        }

        if (!cell.lower.west) {
            cell.lower.west = westCell.lower;
            westCell.lower.east = cell.lower;
        }
    } else {
        // east-west hops north-south

        if (cell.lower.east) {
            cell.lower.east.west = cell.upper;
            cell.upper.east = cell.lower.east;
            cell.lower.east = null;
        } else {
            eastCell.lower.west = cell.upper;
            cell.upper.east = eastCell.lower;
        }

        if (cell.lower.west) {
            cell.lower.west.east = cell.upper;
            cell.upper.west = cell.lower.west;
            cell.lower.west = null;
        } else {
            westCell.lower.east = cell.upper;
            cell.upper.west = westCell.lower;
        }

        if (!cell.lower.north) {
            cell.lower.north = northCell.lower;
            northCell.lower.south = cell.lower;
        }

        if (!cell.lower.south) {
            cell.lower.south = southCell.lower;
            southCell.lower.north = cell.lower;
        }
    }
}

function addNorthEastLoop(maze: Maze, cell: Cell, stack: Node[], northSouthHopsEastWest: boolean): boolean {

    const northCell = maze.cells[cell.y - 1][cell.x];
    if (northCell.isNotFlat()) {
        return false;
    }
    const northEastCell = maze.cells[cell.y - 1][cell.x + 1];
    if (northEastCell.isNotFlat()) {
        return false;
    }
    const eastCell = maze.cells[cell.y][cell.x + 1];
    if (eastCell.isNotFlat()) {
        return false;
    }

    const southCell = maze.cells[cell.y + 1][cell.x];
    const westCell = maze.cells[cell.y][cell.x - 1];

    cell.backup();
    northCell.backup();
    northEastCell.backup();
    eastCell.backup();
    southCell.backup();
    westCell.backup();

    wireCross(cell, northCell, eastCell, southCell, westCell, northSouthHopsEastWest);

    if (!northCell.lower.east) {
        northCell.lower.east = northEastCell.lower;
        northEastCell.lower.west = northCell.lower;
    }
    if (!eastCell.lower.north) {
        eastCell.lower.north = northEastCell.lower;
        northEastCell.lower.south = eastCell.lower;
    }

    if (findLoop(maze, cell.lower, stack) || findLoop(maze, cell.upper, stack)) {
        cell.restore();
        northCell.restore();
        northEastCell.restore();
        eastCell.restore();
        southCell.restore();
        westCell.restore();
        return false
    }

    return true;
}

function addSouthEastLoop(maze: Maze, cell: Cell, stack: Node[], northSouthHopsEastWest: boolean): boolean {

    const southCell = maze.cells[cell.y + 1][cell.x];
    if (southCell.isNotFlat()) {
        return false;
    }
    const southEastCell = maze.cells[cell.y + 1][cell.x + 1];
    if (southEastCell.isNotFlat()) {
        return false;
    }
    const eastCell = maze.cells[cell.y][cell.x + 1];
    if (eastCell.isNotFlat()) {
        return false;
    }

    const northCell = maze.cells[cell.y - 1][cell.x];
    const westCell = maze.cells[cell.y][cell.x - 1];

    cell.backup();
    northCell.backup();
    southEastCell.backup();
    eastCell.backup();
    southCell.backup();
    westCell.backup();

    wireCross(cell, northCell, eastCell, southCell, westCell, northSouthHopsEastWest);

    if (!southCell.lower.east) {
        southCell.lower.east = southEastCell.lower;
        southEastCell.lower.west = southCell.lower;
    }
    if (!eastCell.lower.south) {
        eastCell.lower.south = southEastCell.lower;
        southEastCell.lower.north = eastCell.lower;
    }

    if (findLoop(maze, cell.lower, stack) || findLoop(maze, cell.upper, stack)) {
        cell.restore();
        northCell.restore();
        southEastCell.restore();
        eastCell.restore();
        southCell.restore();
        westCell.restore();
        return false
    }

    return true;
}

function addSouthWestLoop(maze: Maze, cell: Cell, stack: Node[], northSouthHopsEastWest: boolean): boolean {

    const southCell = maze.cells[cell.y + 1][cell.x];
    if (southCell.isNotFlat()) {
        return false;
    }
    const southWestCell = maze.cells[cell.y + 1][cell.x - 1];
    if (southWestCell.isNotFlat()) {
        return false;
    }
    const westCell = maze.cells[cell.y][cell.x - 1];
    if (westCell.isNotFlat()) {
        return false;
    }

    const northCell = maze.cells[cell.y - 1][cell.x];
    const eastCell = maze.cells[cell.y][cell.x + 1];

    cell.backup();
    northCell.backup();
    southWestCell.backup();
    eastCell.backup();
    southCell.backup();
    westCell.backup();

    wireCross(cell, northCell, eastCell, southCell, westCell, northSouthHopsEastWest);

    if (!southCell.lower.west) {
        southCell.lower.west = southWestCell.lower;
        southWestCell.lower.east = southCell.lower;
    }
    if (!westCell.lower.south) {
        westCell.lower.south = southWestCell.lower;
        southWestCell.lower.north = westCell.lower;
    }

    if (findLoop(maze, cell.lower, stack) || findLoop(maze, cell.upper, stack)) {
        cell.restore();
        northCell.restore();
        southWestCell.restore();
        eastCell.restore();
        southCell.restore();
        westCell.restore();
        return false
    }

    return true;
}

function addNorthWestLoop(maze: Maze, cell: Cell, stack: Node[], northSouthHopsEastWest: boolean): boolean {

    const northCell = maze.cells[cell.y - 1][cell.x];
    if (northCell.isNotFlat()) {
        return false;
    }
    const northWestCell = maze.cells[cell.y - 1][cell.x - 1];
    if (northWestCell.isNotFlat()) {
        return false;
    }
    const westCell = maze.cells[cell.y][cell.x - 1];
    if (westCell.isNotFlat()) {
        return false;
    }

    const southCell = maze.cells[cell.y + 1][cell.x];
    const eastCell = maze.cells[cell.y][cell.x + 1];

    cell.backup();
    northCell.backup();
    northWestCell.backup();
    eastCell.backup();
    southCell.backup();
    westCell.backup();

    wireCross(cell, northCell, eastCell, southCell, westCell, northSouthHopsEastWest);

    if (!northCell.lower.west) {
        northCell.lower.west = northWestCell.lower;
        northWestCell.lower.east = northCell.lower;
    }
    if (!westCell.lower.north) {
        westCell.lower.north = northWestCell.lower;
        northWestCell.lower.south = westCell.lower;
    }

    if (findLoop(maze, cell.lower, stack) || findLoop(maze, cell.upper, stack)) {
        cell.restore();
        northCell.restore();
        northWestCell.restore();
        eastCell.restore();
        southCell.restore();
        westCell.restore();
        return false
    }

    return true;
}

function addCross(maze: Maze, cell: Cell, stack: Node[], northSouthHopsEastWest: boolean): boolean {

    const northCell = maze.cells[cell.y - 1][cell.x];
    const eastCell = maze.cells[cell.y][cell.x + 1];
    const southCell = maze.cells[cell.y + 1][cell.x];
    const westCell = maze.cells[cell.y][cell.x - 1];

    cell.backup();
    northCell.backup();
    eastCell.backup();
    southCell.backup();
    westCell.backup();

    wireCross(cell, northCell, eastCell, southCell, westCell, northSouthHopsEastWest);

    if (findLoop(maze, cell.lower, stack) || findLoop(maze, cell.upper, stack)) {
        cell.restore();
        northCell.restore();
        eastCell.restore();
        southCell.restore();
        westCell.restore();
        return false
    }

    return true;
}

function addLoopsAndCrosses(maze: Maze, loopFraction: number, crossFraction: number, stack: Node[],
                            permutations: number[][]) {

    const cells: Cell[] = [];
    for (let i = maze.height - 2; i >= 1; --i) {
        for (let j = maze.width - 2; j >= 1; --j) {
            cells.push(maze.cells[i][j]);
        }
    }

    let loops = 0;
    const maxLoops = Math.round(cells.length * loopFraction);
    while (loops < maxLoops && cells.length > 0) {
        const index = Math.floor(cells.length * Math.random());
        const cell = cells[index];
        cells.splice(index, 1);
        const permutation = permutations[Math.floor(permutations.length * Math.random())];
        for (let i = permutation.length - 1; i >= 0; --i) {
            let addLoop: (maze: Maze, cell: Cell, stack: Node[], northSouthHopsEastWest: boolean) => boolean;
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
            if (addLoop(maze, cell, stack, northSouthHopsEastWest)) {
                ++loops;
                break;
            } else if (addLoop(maze, cell, stack, !northSouthHopsEastWest)) {
                ++loops;
                break;
            }
        }
    }

    cells.length = 0;
    for (let i = maze.height - 2; i >= 1; --i) {
        for (let j = maze.width - 2; j >= 1; --j) {
            if (maze.cells[i][j].isFlat()) {
                cells.push(maze.cells[i][j]);
            }
        }
    }

    let crosses = 0;
    const maxCrosses = Math.round(cells.length * crossFraction);
    while (crosses < maxCrosses && cells.length > 0) {
        const index = Math.floor(cells.length * Math.random());
        const cell = cells[index];
        cells.splice(index, 1);
        const northSouthHopsEastWest = Math.random() < 0.5;
        if (addCross(maze, cell, stack, northSouthHopsEastWest)) {
            ++crosses;
        } else if (addCross(maze, cell, stack, !northSouthHopsEastWest)) {
            ++crosses;
        }
    }
}

function mergeRegions(region1: number, region2: number, regions: Node[][]) {
    const region1Nodes = regions[region1];
    const region2Nodes = regions[region2];
    for (let i = region1Nodes.length - 1; i >= 0; --i) {
        region1Nodes[i].region = region2;
    }
    region2Nodes.push(...region1Nodes);
    regions[region1].length = 0;
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
            const cell = maze.cells[i][j];
            if (!(cell.upper.north || cell.upper.east)) {
                nodes.push(cell.lower);
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

        const cell = node.cell;
        const permutation = permutations[Math.floor(permutations.length * Math.random())];
        for (let i = permutation.length - 1; i >= 0; --i) {
            switch (permutation[i]) {
                case 0: {
                    // north
                    if (cell.y === 0 || node.north) {
                        continue;
                    }
                    const northCell = maze.cells[cell.y - 1][cell.x];
                    if (northCell.lower.region === node.region) {
                        continue;
                    }
                    northCell.lower.south = node;
                    node.north = northCell.lower;
                    if (longCorridors) {
                        moveToEnd(nodes, node.north);
                    }
                    mergeRegions(northCell.lower.region, node.region, regions);
                    continue outer;
                }
                case 1:   {
                    // east
                    if (cell.x === maxX || node.east) {
                        continue;
                    }
                    const eastCell = maze.cells[cell.y][cell.x + 1];
                    if (eastCell.lower.region === node.region) {
                        continue;
                    }
                    eastCell.lower.west = node;
                    node.east = eastCell.lower;
                    if (longCorridors) {
                        moveToEnd(nodes, node.east);
                    }
                    mergeRegions(eastCell.lower.region, node.region, regions);
                    continue outer;
                }
                case 2: {
                    // south
                    if (cell.y === maxY || node.south) {
                        continue;
                    }
                    const southCell = maze.cells[cell.y + 1][cell.x];
                    if (southCell.lower.region === node.region) {
                        continue;
                    }
                    southCell.lower.north = node;
                    node.south = southCell.lower;
                    if (longCorridors) {
                        moveToEnd(nodes, node.south);
                    }
                    mergeRegions(southCell.lower.region, node.region, regions);
                    continue outer;
                }
                default: {
                    // west
                    if (cell.x === 0 || node.west) {
                        continue;
                    }
                    const westCell = maze.cells[cell.y][cell.x - 1];
                    if (westCell.lower.region === node.region) {
                        continue;
                    }
                    westCell.lower.east = node;
                    node.west = westCell.lower;
                    if (longCorridors) {
                        moveToEnd(nodes, node.west);
                    }
                    mergeRegions(westCell.lower.region, node.region, regions);
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

function addTerminal(maze: Maze, terminal: Terminal): Cell {
    switch (terminal.side) {
        case TerminalSide.NORTH: {
            const cell = maze.cells[0][Math.round(terminal.position * (maze.width - 1))];
            if (terminal.open) {
                cell.lower.north2 = cell.lower.north = cell.lower;
            }
            return cell;
        }
        case TerminalSide.EAST: {
            const cell = maze.cells[Math.round(terminal.position * (maze.height - 1))][maze.width - 1];
            if (terminal.open) {
                cell.lower.east2 = cell.lower.east = cell.lower;
            }
            return cell;
        }
        case TerminalSide.SOUTH: {
            const cell = maze.cells[maze.height - 1][Math.round(terminal.position * (maze.width - 1))];
            if (terminal.open) {
                cell.lower.south2 = cell.lower.south = cell.lower;
            }
            return cell;
        }
        default: {
            const cell = maze.cells[Math.round(terminal.position * (maze.height - 1))][0];
            if (terminal.open) {
                cell.lower.west2 = cell.lower.west = cell.lower;
            }
            return cell;
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
    maze.startCell = addTerminal(maze, startTerminal);
    maze.endCell = addTerminal(maze, endTerminal);

    solveMaze(maze);

    return maze;
}