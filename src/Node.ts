import { Tile } from '@/Tile';

export class Node {
    north: Node | null = null;
    east: Node | null = null;
    south: Node | null = null;
    west: Node | null = null;

    _north: Node | null = null;
    _east: Node | null = null;
    _south: Node | null = null;
    _west: Node | null = null;

    constructor(public tile: Tile, public nodeType: NodeType) {
    }

    backup() {
        this._north = this.north;
        this._east = this.east;
        this._south = this.south;
        this._west = this.west;
    }

    restore() {
        this.north = this._north;
        this.east = this._east;
        this.south = this._south;
        this.west = this._west;
    }
}