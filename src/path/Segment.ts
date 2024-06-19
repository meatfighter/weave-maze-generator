import { Point } from '@/path/Point';

export interface Segment {
    getStart(): Point;
    getEnd(): Point;
    reverse(): void;
    isLine(): boolean;
}