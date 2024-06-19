import { Segment } from '@/Segment';

export class Line implements Segment {
    constructor(public x0: number, public y0: number, public x1: number, public y1: number) {
    }
}