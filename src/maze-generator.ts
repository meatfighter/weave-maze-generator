import { Maze } from '@/Maze';
import { Tile } from '@/Tile';
import { Node } from '@/Node';

function generatePermutations(arr: number[]): number[][] {
    const result: number[][] = [];

    function permute(n: number) {
        if (n === 1) {
            result.push(arr.slice());
        } else {
            for (let i = 0; i < n; i++) {
                permute(n - 1);
                if ((n & 1) === 0) {
                    [ arr[i], arr[n - 1] ] = [ arr[n - 1], arr[i] ];
                } else {
                    [ arr[0], arr[n - 1] ] = [ arr[n - 1], arr[0] ];
                }
            }
        }
    }

    permute(arr.length);

    return result;
}

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
            if (node.north && node.north.region === 0) {
                node.north.region = region;
                stack.push(node.north);
                nodes.push(node.north);
            }
            if (node.east && node.east.region === 0) {
                node.east.region = region;
                stack.push(node.east);
                nodes.push(node.east);
            }
            if (node.south && node.south.region === 0) {
                node.south.region = region;
                stack.push(node.south);
                nodes.push(node.south);
            }
            if (node.west && node.west.region === 0) {
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
    let id = 1;
    for (let i = maze.height - 1; i >= 0; --i) {
        for (let j = maze.width - 1; j >= 0; --j) {
            const tile = maze.tiles[i][j];
            if (tile.lower.region === 0) {
                nodes[id] = assignRegion(id, tile.lower, stack);
                ++id;
            }
            if (tile.upper.region === 0) {
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

function addCross(maze: Maze, tile: Tile, stack: Node[]): boolean {

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

function addCrosses(maze: Maze, crossFraction: number, stack: Node[]) {
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
        if (addCross(maze, tile, stack)) {
            ++crosses;
        }
    }
}

function mergeRegions(region1: number, region2: number, regions: Node[][]) {
    regions[region1].forEach(node => node.region = region2);
    regions[region2].push(...regions[region1]);
    regions[region1].length = 0;
}

function createSpanningTree(maze: Maze, nodes: Node[], permutations: number[][], regions: Node[][]) {

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

    outer: while (nodes.length > 0) {
        const index = Math.floor(nodes.length * Math.random());
        const node = nodes[index];
        if (!node) {
            break;
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
                    mergeRegions(westTile.lower.region, node.region, regions);
                    continue outer;
                }
            }
        }
        nodes.splice(index, 1);
    }
}

export function generateMaze(width: number, height: number, crossFraction: number): Maze {
    const maze = new Maze(width, height);
    const permutations = generatePermutations([ 0, 1, 2, 3]);
    const stack: Node[] = [];
    addCrosses(maze, crossFraction, stack);
    const regions = assignRegions(maze, stack);
    createSpanningTree(maze, stack, permutations, regions);
    return maze;
}



























