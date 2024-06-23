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
  -n, --not-letter-sized      When saving to a PDF file, the maze is normally scaled to fit a letter-sized page. This 
                              flag disables that scaling. 

Dimension Options:

  Specify only one of the following options.

  -S, --cell-size ...         Size of each square maze cell in pixels
                              Default: 25 or (image width / maze width) or (image height / maze height)
  -W, --image-width ...       Output image width in pixels 
                              Default: (maze width x cell size) or (maze width x image height / maze height)
  -H, --image-height ...      Output image height in pixels
                              Default: (maze height x cell size) or (maze height x image width / maze width)
  
Style Options:  
  -s, --square 
  
  The following options are specified as a percentage of cell size. Both range from 0 to 100. And both default to 15.
   
  -t, --line-thickness ...    Wall and solution line thicknesses.
  -m, --cell-margin ...       Margin between walls and cell edges.
  
Color Options:
  -a, --wall-color ...  
  -b, --background-color ...  
  -c, --solution-color ...
  
Other Operations:
  -v, --version               Shows version number
  -p, --help                  Shows this help message
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