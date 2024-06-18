import TinyQueue from 'tinyqueue';
import { Node } from '@/Node';

export class NodeQueue {
    private queue: TinyQueue<Node>;
    private set: Set<Node>;

    constructor(startNode: Node) {
        this.queue = new TinyQueue<Node>([ startNode ], (a, b) => a.estimatedFullCost - b.estimatedFullCost);
        this.set = new Set();
    }

    push(node: Node): void {
        if (!this.set.has(node)) {
            this.queue.push(node);
            this.set.add(node);
        }
    }

    pop(): Node | undefined {
        const node = this.queue.pop();
        if (node !== undefined) {
            this.set.delete(node);
        }
        return node;
    }

    size(): number {
        return this.queue.length;
    }

    peek(): Node | undefined {
        return this.queue.peek();
    }
}