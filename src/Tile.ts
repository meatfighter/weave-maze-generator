import { Node } from '@/Node';

export class Tile {
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
}