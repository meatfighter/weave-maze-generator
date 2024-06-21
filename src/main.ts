import { saveImage } from '@/render/maze-renderer';
import { generateMaze } from '@/maze-generator';
import { Terminal } from '@/Terminal';
import { TerminalSide } from '@/TerminalSide';
import { Line } from '@/render/Line';
import { Point } from '@/render/Point';
import { Arc } from '@/render/Arc';
import { PathOptimizer } from '@/render/PathOptimizer';

// TODO
// - Find a way to go between short and long corridors (0 -- 1)
// - Render to bitmap, svg, and pdf
// - Make render paths as long as possible by chaining elements
// - Solution path
// - Color options
// - binary bitmap shapes
// - 200x200 seems to be a good limit

async function main() {
    // await saveImage(generateMaze(25, 25, 0.05, .3, false,
    //     new Terminal(TerminalSide.WEST, 1, true), new Terminal(TerminalSide.EAST, 0, true)), 'maze.png');
    await saveImage(generateMaze(20, 20, 0.05, .3, false,
        new Terminal(TerminalSide.WEST, 1, true), new Terminal(TerminalSide.EAST, 0, true)), false, false, 'maze.png');

    // const c = new PathOptimizer();
    // c.moveTo(10, 10);
    // c.lineTo(10, 12);
    // c.lineTo(10, 14);
    // c.lineTo(10, 16); // TODO FIX THIS!!!
    // c.lineTo(10, 20);
    // c.lineTo(15, 20);
    // c.lineTo(20, 20);
    //
    // c.moveTo(30, 30);
    // c.lineTo(30, 25);
    // c.lineTo(30, 20);
    // c.lineTo(25, 20);
    // c.lineTo(20, 20);
    //
    // c.moveTo(30, 30);
    // c.arcTo(30, 40, 40, 40, 10);
    //
    // const paths = c.getPaths();
    // paths.forEach(path => {
    //     let s = '';
    //     path.forEach(segment => {
    //         if (s.length > 0) {
    //             s += ', ';
    //         }
    //         s += segment.toString();
    //     })
    //     console.log(s);
    // });
}

void main();