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

Output:
  -o, --output "..."          Output filename (required)
                              Supported formats: png, svg, pdf
                              Separate maze and solutions files are always generated (e.g. maze.png, maze-solution.png)
                              If the filename extension is omitted, then png, svg, and pdf files will be generated.
                              If a path ending with a slash is provided, maze-timestamp.* files will be created.
                              Use ./ for the current directory.
  -p, --paper-size ...        Paper size for pdf files:                                
                                letter         8.5 x 11 in (default)         
                                tabloid        11 x 17 in
                                legal          8.5 x 14 in
                                statement      5.5 x 8.5 in
                                executive      7.25 x 10.5 in
                                folio          8.5 x 13.5 in
                                quarto         8.5 x 10 5/6 in
                                a3             297 x 420 mm
                                a4             210 x 297 mm
                                a5             148 x 210 mm
                                b4             257 x 364 mm (JIS)
                                b5             182 x 257 mm (JIS)
                                fit            establishes the paper size based the drawing dimensions
 
Shape (rectangular with a specified width and height, or arbitrary based on a mask image):
  -w, --maze-width ...        For rectangular, number of cells spanning the width (default: 40, max: 200)
  -h, --maze-height ...       For rectangular, number of cells spanning the height (default: 40, max: 200)
  -m, --mask "..."            Filename of png image containing white pixels for maze cells and black or transparent 
                              pixels for empty cells, with a maximum width and height of 200 pixels
  
Passages: 
  -x, --crosses ...           Percentage of maze cells where two passages cross (default: 25)
  -l, --loops ...             Percentage of maze cells where a passage loops over itself (default: 5)
  -L, --long                  Generate a maze with long passages
    
Dimensions (specify only one):
  -S, --cell-size ...         Square maze cell size in pixels
                              Default: 25 or (image width / maze width) or (image height / maze height)
  -W, --image-width ...       Output image width in pixels 
                              Default: (maze width x cell size) or (image height x maze width / maze height)
  -H, --image-height ...      Output image height in pixels
                              Default: (maze height x cell size) or (image width x maze height / maze width)
  
Edges:  
  -s, --square                Draw square edges instead of the default curved edges 
   
Widths (percentage of cell size):   
  -t, --thickness ...         Wall and solution path line thicknesses (default: 15)
  -P, --passage-width ...     Maze passage width (default: 70)
  
Colors (hexadecimal color codes: RRGGBB or RRGGBBAA):
  -a, --wall-color ...        Wall color 
                              Default is black (000000FF)  
  -b, --background-color ...  Background color 
                              Default is white for bitmaps (FFFFFFFF) and transparent for vector graphics (00000000)
  -c, --solution-color ...    Solution path color 
                              Default is red (FF0000FF)
  
Other:
  -v, --version               Shows version number
  -e, --help                  Shows this help message
    `);
}

async function main() {

    const mazeOptions = new MazeOptions();
    //mazeOptions.mask = await loadMask('maze-mask.png');
    mazeOptions.width = 200;
    mazeOptions.height = 200;

    const renderOptions = new RenderOptions('maze.png');
    renderOptions.backgroundColor = new Color(255, 255, 255, 0);
    renderOptions.curved = true;

    await saveMaze(generateMaze(mazeOptions), renderOptions);
}

void main();