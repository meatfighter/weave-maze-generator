import { saveImage } from '@/maze-renderer';
import { generateMaze } from '@/maze-generator';
import { Terminal } from '@/Terminal';
import { TerminalSide } from '@/TerminalSide';
import { Paths } from '@/path/Path';
import { Line } from '@/path/Line';
import { Point } from '@/path/Point';
import { Arc } from '@/path/Arc';

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

    const paths = new Paths();
    paths.moveTo(10, 10);
    paths.lineTo(10, 20);

    console.log('start paths:');
    paths.startPaths.forEach((path, p) => console.log(`${p}: ${Paths.asString(path)}`));
    console.log('end paths:');
    paths.endPaths.forEach((path, p) => console.log(`${p}: ${Paths.asString(path)}`));

    console.log('---');
    paths.lineTo(20, 20);

    paths.moveTo(30, 30);
    paths.lineTo(30, 20);
    paths.lineTo(20, 20);

    console.log('start paths:');
    paths.startPaths.forEach((path, p) => console.log(`${p}: ${Paths.asString(path)}`));

    console.log('end paths:');
    paths.endPaths.forEach((path, p) => console.log(`${p}: ${Paths.asString(path)}`));
}

void main();