import { Tile } from '@/Tile';

export class Node {
    constructor(public tile: Tile, public lower: boolean) {
    }
}