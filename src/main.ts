import { saveImage } from '@/maze-renderer';
import { generateMaze } from '@/maze-generator';
import { Terminal } from '@/Terminal';
import { TerminalSide } from '@/TerminalSide';
import { Line } from '@/path/Line';
import { Point } from '@/path/Point';
import { Arc } from '@/path/Arc';
import { RenderingContext } from '@/path/RenderingContext';

// TODO
// - Find a way to go between short and long corridors (0 -- 1)
// - Render to bitmap, svg, and pdf
// - Make render paths as long as possible by chaining elements
// - Solution path
// - Color options
// - binary bitmap shapes

async function main() {
    // await saveImage(generateMaze(25, 25, 0.05, .3, false,
    //     new Terminal(TerminalSide.WEST, 1, true), new Terminal(TerminalSide.EAST, 0, true)), 'maze.png');
    // await saveImage(generateMaze(25, 25, 0.05, .3, false,
    //     new Terminal(TerminalSide.WEST, 1, true), new Terminal(TerminalSide.EAST, 0, true)), 'maze.png');

    const c = new RenderingContext();
    c.moveTo(10, 10);
    c.moveTo(10, 12);
    c.moveTo(10, 14);
    c.moveTo(10, 16);
    c.lineTo(10, 20);
    c.lineTo(20, 20);

    c.moveTo(30, 30);
    c.lineTo(30, 20);
    c.lineTo(20, 20);

    c.moveTo(30, 30);
    c.arcTo(30, 40, 40, 40, 10);

    c.minify();
    c.paths.forEach(path => {
        let s = '';
        path.forEach(segment => {
            if (s.length > 0) {
                s += ', ';
            }
            s += segment.toString();
        })
        console.log(s);
    });
}

void main();