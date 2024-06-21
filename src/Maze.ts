import { Cell } from '@/Cell';

export class Maze {
    width: number;
    height: number;
    cells: Cell[][];
    startCell: Cell;
    endCell: Cell;

    solved = false;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.cells = new Array<Cell[]>(height);
        for (let i = height - 1; i >= 0; --i) {
            this.cells[i] = new Array<Cell>(width);
            for (let j = width - 1; j >= 0; --j) {
                this.cells[i][j] = new Cell(j, i);
            }
        }
        this.startCell = this.cells[height - 1][0];
        this.endCell = this.cells[0][width - 1];
    }
}