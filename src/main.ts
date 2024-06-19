import { saveImage } from '@/maze-renderer';
import { generateMaze } from '@/maze-generator';
import { Terminal } from '@/Terminal';
import { TerminalSide } from '@/TerminalSide';

// TODO
// - Find a way to go between short and long corridors (0 -- 1)
// - Render to bitmap, svg, and pdf
// - Make render paths as long as possible by chaining elements
// - Solution path
// - Color options
// - binary bitmap shapes

async function main() {
    // await saveImage(generateMaze(250, 250, 0.05, .3, false,
    //         new Terminal(TerminalSide.WEST, 1, true), new Terminal(TerminalSide.EAST, 0, true)), 'maze.png');
    await saveImage(generateMaze(25, 25, 0.05, .3, false,
        new Terminal(TerminalSide.WEST, 1, true), new Terminal(TerminalSide.EAST, 0, true)), 'maze.png');
}

void main();