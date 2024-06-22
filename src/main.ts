import { saveMaze } from '@/render/maze-renderer';
import { generateMaze } from '@/maze/maze-generator';
import { RenderOptions } from '@/render/RenderOptions';
import { Color } from '@/render/Color';
import { loadMask } from '@/mask/mask-loader';
import { MazeOptions } from '@/maze/MazeOptions';

// TODO
// - command-line options
// - save multiple file types if no file extension is provided

// - 1x1 -- 200x200 seems to be a good range

async function main() {

    const mazeOptions = new MazeOptions();
    //mazeOptions.mask = await loadMask('maze-mask.png');
    mazeOptions.width = 40;
    mazeOptions.height = 40;

    const renderOptions = new RenderOptions('maze.pdf');
    renderOptions.backgroundColor = new Color(255, 255, 255, 0);
    renderOptions.curved = true;

    await saveMaze(generateMaze(mazeOptions), renderOptions);
}

void main();