import { Segment } from '@/Segment';

export class Arc implements Segment {
    constructor(public x0: number, public y0: number,
                public xm: number, public ym: number,
                public x1: number, public y1: number) {
    }
}