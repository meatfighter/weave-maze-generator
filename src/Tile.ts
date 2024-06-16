import { Node } from '@/Node';
import { NodeType } from '@/NodeType';

export class Tile {
    lower = new Node(this, NodeType.LOWER);
    upper = new Node(this, NodeType.UPPER);

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