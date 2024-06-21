import { saveMaze } from '@/render/maze-renderer';
import { generateMaze } from '@/maze-generator';
import { Terminal } from '@/Terminal';
import { TerminalSide } from '@/TerminalSide';
import { RenderOptions } from '@/render/RenderOptions';
import { FileType } from '@/render/FileType';

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

    const renderOptions = new RenderOptions('maze.png', FileType.PNG);

    await saveMaze(generateMaze(20, 20, 0.05, .3, false,
        new Terminal(TerminalSide.WEST, 1, true), new Terminal(TerminalSide.EAST, 0, true)), renderOptions);
}

void main();