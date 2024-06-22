import { Node } from '@/maze/Node';

export class Cell {
    lower = new Node(this);
    upper = new Node(this);

    constructor(public x: number, public y: number) {
    }

    backup() {
        this.lower.backup();
        this.upper.backup();
    }

    restore() {
        this.lower.restore();
        this.upper.restore();
    }

    isFlat() {
        return !this.isNotFlat();
    }

    isNotFlat() {
        return this.upper.north || this.upper.east || this.upper.south || this.upper.west;
    }
}