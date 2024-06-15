import { Tile } from '@/Tile';

export class Maze {
    width: number;
    height: number;
    tiles: Tile[][];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.tiles = new Array<Tile[]>(height);
        for (let i = height - 1; i >= 0; --i) {
            this.tiles[i] = new Array<Tile>(width);
            for (let j = width - 1; j >= 0; --j) {
                this.tiles[i][j] = new Tile(j, i);
            }
        }
    }
}