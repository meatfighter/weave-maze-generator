import { saveMaze } from '@/render/maze-renderer';
import { generateMaze } from '@/maze-generator';
import { Terminal } from '@/Terminal';
import { TerminalSide } from '@/TerminalSide';
import { RenderOptions } from '@/render/RenderOptions';
import { Color } from '@/render/Color';

// TODO
// - binary bitmap shapes
// - command-line options

// - 1x1 -- 200x200 seems to be a good range

async function main() {

    const renderOptions = new RenderOptions('maze.png');
    renderOptions.backgroundColor = new Color(255, 255, 255, 0);
    renderOptions.curved = false;

    await saveMaze(generateMaze(30, 30, 0.05, .25, false,
        new Terminal(TerminalSide.WEST, 1, true), new Terminal(TerminalSide.EAST, 0, true)), renderOptions);
}

void main();