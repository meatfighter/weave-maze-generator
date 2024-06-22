import { saveMaze } from '@/render/maze-renderer';
import { generateMaze } from '@/maze/maze-generator';
import { Terminal } from '@/maze/Terminal';
import { TerminalSide } from '@/maze/TerminalSide';
import { RenderOptions } from '@/render/RenderOptions';
import { Color } from '@/render/Color';
import { loadMask } from '@/mask/mask-loader';

// TODO
// - binary bitmap shapes
// - command-line options

// - 1x1 -- 200x200 seems to be a good range

async function main() {

    const mask = await loadMask('maze-mask.png');

    const renderOptions = new RenderOptions('maze.png');
    renderOptions.backgroundColor = new Color(255, 255, 255, 0);
    renderOptions.curved = true;

    await saveMaze(generateMaze(mask[0].length, mask.length, 0.05, .25, false,
        new Terminal(TerminalSide.WEST, 1, true), new Terminal(TerminalSide.EAST, 0, true), mask), renderOptions);
}

void main();