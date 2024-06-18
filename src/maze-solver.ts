import { Maze } from '@/Maze';
import { Tile } from '@/Tile';
import { Node } from '@/Node';
import { NodeQueue } from '@/NodeQueue';

function heuristic(endTile: Tile, node: Node) {
    const tile = node.tile;
    return Math.abs(endTile.x - tile.x) + Math.abs(endTile.y - tile.y);
}

function reconstructPath(maze: Maze) {
    let node = maze.endTile.lower;
    while (node.visitedBy) {
        switch (node.visitedBy) {
            case node.north:
                node.north2 = node.visitedBy;
                break;
            case node.east:
                node.east2 = node.visitedBy;
                break;
            case node.south:
                node.south2 = node.visitedBy;
                break;
            case node.west:
                node.west2 = node.visitedBy;
                break;
        }
        node = node.visitedBy;
    }
}

export function solveMaze(maze: Maze) {
    for (let i = maze.height - 1; i >= 0; --i) {
        for (let j = maze.width - 1; j >= 0; --j) {
            const tile = maze.tiles[i][j];
            const lower = tile.lower;
            lower.visitedBy = lower.north2 = lower.east2 = lower.south2 = lower.west2 = null;
            lower.cost = lower.estimatedFullCost = Number.POSITIVE_INFINITY;
            const upper = tile.upper;
            upper.visitedBy = upper.north2 = upper.east2 = upper.south2 = upper.west2 = null;
            upper.cost = upper.estimatedFullCost = Number.POSITIVE_INFINITY;
        }
    }

    const endTile = maze.endTile;
    const endNode = maze.endTile.lower;

    const startNode = maze.startTile.lower;
    startNode.cost = 0;
    startNode.estimatedFullCost = heuristic(endTile, startNode);

    const queue = new NodeQueue(startNode);
    while (true) {
        const node = queue.pop();
        if (!node) {
            break;
        }
        if (node === endNode) {
            reconstructPath(maze);
            maze.solved = true;
            break;
        }
        const nextCost = node.cost + 1;
        for (let i = 3; i >= 0; --i) {
            let neighbor: Node | null = null;
            switch (i) {
                case 0:
                    neighbor = node.north;
                    break;
                case 1:
                    neighbor = node.east;
                    break;
                case 2:
                    neighbor = node.south;
                    break;
                default:
                    neighbor = node.west;
                    break;
            }
            if (!neighbor) {
                continue;
            }
            if (nextCost < neighbor.cost) {
                neighbor.visitedBy = node;
                neighbor.cost = nextCost;
                neighbor.estimatedFullCost = nextCost + heuristic(endTile, neighbor);
                queue.push(neighbor);
            }
        }
    }
}