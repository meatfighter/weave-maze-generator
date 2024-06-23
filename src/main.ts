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

function printUsage() {
    console.log(`
Usage: weave-maze-generator [options]

All options have default values.
 
Maze Generation Options:
  -i, --input "..."   
  -w, --maze-width ...
  -h, --maze-height ...
  -x, --crosses ...
  -l, --loops ...  
  -L, --long-corridors
    
Output Options:
  -o, --output "..."
  -n, --not-letter-sized

Dimension Options:
  -S, --cell-size ...
  -W, --image-width ...
  -H, --image-height ...
  
Style Options:  
  -s, --square  
  -t, --line-thickness ...
  -m, --cell-margin ...
  
Color Options:
  -a, --wall-color ...  
  -b, --background-color ...  
  -c, --solution-color ...
  
Other Operations:
  -v, --version              Shows version number
  -p, --help                 Shows this help message
    `);
}

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