import { Tile } from '@/Tile';

export class Node {
    north: Node | null = null;
    east: Node | null = null;
    south: Node | null = null;
    west: Node | null = null;

    north2: Node | null = null;
    east2: Node | null = null;
    south2: Node | null = null;
    west2: Node | null = null;

    visitedBy: Node | null = null;

    region = -1;

    cost = 0;
    estimatedFullCost = 0;

    constructor(public tile: Tile) {
    }

    backup() {
        this.north2 = this.north;
        this.east2 = this.east;
        this.south2 = this.south;
        this.west2 = this.west;
    }

    restore() {
        this.north = this.north2;
        this.east = this.east2;
        this.south = this.south2;
        this.west = this.west2;
    }
}