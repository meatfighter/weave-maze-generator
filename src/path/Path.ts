import { Segment } from '@/path/Segment';
import { Point } from '@/path/Point';
import { Line } from '@/path/Line';
import { Arc } from '@/path/Arc';

export class Paths {

    cursor = new Point();
    paths = new Map<Point, Segment[]>();
    loops: Segment[][] = [];

    private optimize(path: Segment[], loop: boolean) {
        if (path.length === 0) {
            return;
        }

        let i = 0;
        while (i + 1 !== path.length) {
            const s0 = path[i];
            const s1 = path[i + 1];
            if (s0.isLine() && s1.isLine()) {
                const l0 = s0 as Line;
                const l1 = s0 as Line;
                if (l0.merge(l1)) {
                    path.splice(i + 1, 1);
                } else {
                    ++i;
                }
            }
        }

        if (loop) {
            while (true) {
                const s0 = path[path.length - 1];
                const s1 = path[0];
                if (s0.isLine() && s1.isLine()) {
                    const l0 = s0 as Line;
                    const l1 = s0 as Line;
                    if (l0.merge(l1)) {
                        path.splice(0, 1);
                    } else {
                        break;
                    }
                }
            }
        }
    }

    optimizeAll() {
        for (const path of this.paths.values()) {
            this.optimize(path, false);
        }
        this.loops.forEach(loop => this.optimize(loop, true));
    }

    private addSegment(segment: Segment) {
        let startPath = this.paths.get(segment.getStart());
        let endPath = this.paths.get(segment.getEnd());
        if (!startPath && !endPath) {
            const path = [ segment ];
            this.paths.set(segment.getStart(), path);
            this.paths.set(segment.getEnd(), path);
        } else if (!startPath && endPath) {
            this.paths.delete(segment.getEnd());
            segment.reverse();
            endPath.push(segment);
            this.paths.set(segment.getEnd(), endPath);
        } else if (startPath && !endPath) {
            this.paths.delete(segment.getStart());
            segment.reverse();
            startPath.unshift(segment);
            this.paths.set(segment.getStart(), startPath);
        } else if (startPath && endPath) {
            if (startPath === endPath) {
                this.paths.delete(segment.getStart());
                this.paths.delete(segment.getEnd());
                segment.reverse();
                startPath.unshift(segment);
                this.loops.push(startPath);
            } else {
                this.paths.delete(segment.getStart());
                segment.reverse();
                startPath.unshift(segment);
                endPath.push(...startPath);
            }
        }
    }

    moveTo(x: number, y: number) {
        this.cursor = new Point(x, y);
    }

    lineTo(x: number, y: number) {
        const p1 = new Point(x, y);
        this.addSegment(new Line(this.cursor, p1));
        this.cursor = p1;
    }

    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number) {
        const p1 = new Point(x1, y1);
        const p2 = new Point(x2, y2);
        this.addSegment(new Arc(this.cursor, p1, p2, radius));
    }
}