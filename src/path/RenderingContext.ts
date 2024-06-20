import { Point } from '@/path/Point';
import { Line } from '@/path/Line';
import { Arc } from '@/path/Arc';
import { Segment } from '@/path/Segment';
import { HashMap } from '@/collections/HashMap';
import { PathNode } from '@/path/PathNode';

export class RenderingContext {

    cursor = new Point();
    segments: Segment[] = [];

    moveTo(x: number, y: number) {
        this.cursor = new Point(x, y);
    }

    lineTo(x: number, y: number) {
        const p1 = new Point(x, y);
        this.segments.push(new Line(this.cursor, p1));
        this.cursor = p1;
    }

    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number) {
        const p1 = new Point(x1, y1);
        const p2 = new Point(x2, y2);
        this.segments.push(new Arc(this.cursor, p1, p2, radius));
        this.cursor = p2;
    }

    minify() {
        const map = new HashMap<Point, Segment>();
        this.segments.forEach(segment => {
            const startSegment = map.get(segment.getStart());
            if (startSegment) {
                map.delete(startSegment.getStart());
                map.delete(startSegment.getEnd());
                if (startSegment.getStart().equals(segment.getStart())) {
                    startSegment.reverse();
                }
                segment = new PathNode(startSegment, segment);
            }

            const endSegment = map.get(segment.getEnd());
            if (endSegment) {
                map.delete(endSegment.getStart());
                map.delete(endSegment.getEnd());
                if (endSegment.getEnd().equals(segment.getEnd())) {
                    endSegment.reverse();
                }
                segment = new PathNode(segment, endSegment);
            }

            map.set(segment.getStart(), segment);
            map.set(segment.getEnd(), segment);
        });
        map.values().forEach(segment => {
            if (!segment.getStart().equals(segment.getEnd())) {
                map.delete(segment.getEnd());
            }
        });
        this.segments.length = 0;
        this.segments.push(...map.values());
    }
}