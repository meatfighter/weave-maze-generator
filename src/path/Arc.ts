import { Point } from '@/path/Point';
import { Segment } from '@/path/Segment';

export class Arc implements Segment {

    constructor(public p0: Point, public p1: Point, public p2: Point, public radius: number) {
    }

    isLine(): boolean {
        return false;
    }

    getStart(): Point {
        return this.p0;
    }

    getEnd(): Point {
        return this.p2;
    }

    reverse() {
        const t = this.p0;
        this.p0 = this.p2;
        this.p2 = t;
    }
}