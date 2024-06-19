import { Point } from '@/path/Point';
import { Segment } from '@/path/Segment';

export class Line implements Segment {

    private readonly horizontal: boolean;

    constructor(public p0: Point, public p1: Point) {
        this.horizontal = p0.compareY(p1);
    }

    isLine(): boolean {
        return true;
    }

    getStart(): Point {
        return this.p0;
    }

    getEnd(): Point {
        return this.p1;
    }

    reverse() {
        const t = this.p0;
        this.p0 = this.p1;
        this.p1 = t;
    }

    merge(line: Line): boolean {
        if (this.horizontal === line.horizontal) {
            this.p1 = line.p1;
            return true;
        }

        return false;
    }
}