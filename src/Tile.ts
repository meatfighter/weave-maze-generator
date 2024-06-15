import { TileType } from '@/TileType';
import { Region } from '@/Region';

export class Tile {
    tileType = TileType.EMPTY;
    upperRegion = Region.UNVISITED;
    lowerRegion = Region.UNVISITED;

    constructor(public x: number, public y: number) {
    }
}