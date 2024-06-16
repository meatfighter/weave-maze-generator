import { Tile } from '@/Tile';

export class WalkElement {
    constructor(public tile: Tile, public nodeStateIndex: number, public direction: Direction) {
    }
}