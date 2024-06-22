import { Maze } from '@/maze/Maze';
import { Cell } from '@/maze/Cell';
import { Node } from '@/maze/Node';
import { NodeQueue } from '@/maze/NodeQueue';

function heuristic(endCell: Cell, node: Node) {
    const cell = node.cell;
    return Math.abs(endCell.x - cell.x) + Math.abs(endCell.y - cell.y);
}

function reconstructPath(maze: Maze) {
    if (!maze.endCell) {
        return;
    }
    let node = maze.endCell.lower;
    while (node.visitedBy) {
        switch (node.visitedBy) {
            case node.north:
                node.north2 = node.visitedBy;
                node.visitedBy.south2 = node;
                break;
            case node.east:
                node.east2 = node.visitedBy;
                node.visitedBy.west2 = node;
                break;
            case node.south:
                node.south2 = node.visitedBy;
                node.visitedBy.north2 = node;
                break;
            case node.west:
                node.west2 = node.visitedBy;
                node.visitedBy.east2 = node;
                break;
        }
        node = node.visitedBy;
    }
}

export function solveMaze(maze: Maze) {

    if (!(maze.startCell && maze.endCell)) {
        return;
    }

    const startCell = maze.startCell;
    const endCell = maze.endCell;

    for (let i = maze.height - 1; i >= 0; --i) {
        for (let j = maze.width - 1; j >= 0; --j) {
            const cell = maze.cells[i][j];
            const lower = cell.lower;
            lower.visitedBy = null;
            lower.cost = lower.estimatedFullCost = Number.POSITIVE_INFINITY;
            const upper = cell.upper;
            upper.visitedBy = null;
            upper.cost = upper.estimatedFullCost = Number.POSITIVE_INFINITY;
            if (cell !== startCell && cell !== endCell) {
                lower.north2 = lower.east2 = lower.south2 = lower.west2 = null;
                upper.north2 = upper.east2 = upper.south2 = upper.west2 = null;
            }
        }
    }

    const endNode = maze.endCell.lower;
    const startNode = startCell.lower;
    startNode.cost = 0;
    startNode.estimatedFullCost = heuristic(endCell, startNode);

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
                neighbor.estimatedFullCost = nextCost + heuristic(endCell, neighbor);
                queue.push(neighbor);
            }
        }
    }
}