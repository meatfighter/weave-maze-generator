import { saveMaze } from '@/render/maze-renderer';
import { generateMaze } from '@/maze-generator';
import { Terminal } from '@/Terminal';
import { TerminalSide } from '@/TerminalSide';
import { RenderOptions } from '@/render/RenderOptions';
import { Color } from '@/render/Color';

// TODO
// - Find a way to go between short and long corridors (0 -- 1)
// - binary bitmap shapes
// - command-line options
// - should cross frac refer to remaining percent?

// - 1x1 -- 200x200 seems to be a good range

async function main() {
    // await saveImage(generateMaze(25, 25, 0.05, .3, false,
    //     new Terminal(TerminalSide.WEST, 1, true), new Terminal(TerminalSide.EAST, 0, true)), 'maze.png');

    const renderOptions = new RenderOptions('maze.png');
    renderOptions.backgroundColor = new Color(255, 255, 255, 0);
    renderOptions.curved = false;

    await saveMaze(generateMaze(1, 1, 0.05, .3, false,
        new Terminal(TerminalSide.WEST, 1, true), new Terminal(TerminalSide.EAST, 0, true)), renderOptions);
}

void main();