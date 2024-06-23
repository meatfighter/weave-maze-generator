import { saveMaze } from '@/render/maze-renderer';
import { generateMaze } from '@/maze/maze-generator';
import { RenderOptions } from '@/render/RenderOptions';
import { Color } from '@/render/Color';
import {
    DEFAULT_CROSS_FRACTION, DEFAULT_LONG_PASSAGES, DEFAULT_LOOP_FRACTION,
    DEFAULT_MAZE_HEIGHT,
    DEFAULT_MAZE_WIDTH, MAX_CROSS_FRACTION, MAX_LOOP_FRACTION, MAX_MAZE_HEIGHT,
    MAX_MAZE_WIDTH,
    MazeOptions, MIN_CROSS_FRACTION, MIN_LOOP_FRACTION, MIN_MAZE_HEIGHT,
    MIN_MAZE_WIDTH
} from '@/maze/MazeOptions';
import { extractArgs, ParamType } from '@/utils/args';
import { PaperSize, toPaperSize } from '@/render/PaperSize';

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
                              If the filename extension is omitted, then png, svg, and pdf files are generated.
                              If a path ending with a slash is provided, multiple timestamped files are created.
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
                                fit            drawing dimensions establish the paper size 

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
  -n, --line-width ...        Wall and solution path line width (default: 15)
  -g, --passage-width ...     Maze passage width (default: 70)

Colors (hexadecimal color codes: RRGGBB or RRGGBBAA):
  -a, --wall-color ...        Wall color
                              Default is black (000000FF)
  -b, --background-color ...  Background color
                              Default is white for png (FFFFFFFF) and transparent for svg and pdf (00000000)
  -c, --solution-color ...    Solution path color
                              Default is red (FF0000FF)

Other:
  -v, --version               Shows version number
  -e, --help                  Shows this help message
    `);
}

async function main() {
    let args: Map<string, string | boolean | number | string[]>;
    try {
        args = extractArgs([
            {
                key: 'output',
                flags: [ '-o', '--output' ],
                type: ParamType.STRING,
            },
            {
                key: 'paper-size',
                flags: [ '-p', '--paper-size' ],
                type: ParamType.STRING,
            },
            {
                key: 'maze-width',
                flags: [ '-w', '--maze-width' ],
                type: ParamType.INTEGER,
            },
            {
                key: 'maze-height',
                flags: [ '-h', '--maze-height' ],
                type: ParamType.INTEGER,
            },
            {
                key: 'mask',
                flags: [ '-m', '--mask' ],
                type: ParamType.STRING,
            },
            {
                key: 'crosses',
                flags: [ '-x, --crosses' ],
                type: ParamType.FLOAT,
            },
            {
                key: 'loops',
                flags: [ '-l', '--loops' ],
                type: ParamType.FLOAT,
            },
            {
                key: 'long',
                flags: [ '-L', '--long' ],
                type: ParamType.NONE,
            },
            {
                key: 'cell-size',
                flags: [ '-S', '--cell-size' ],
                type: ParamType.FLOAT,
            },
            {
                key: 'image-width',
                flags: [ '-W', '--image-width' ],
                type: ParamType.FLOAT,
            },
            {
                key: 'image-height',
                flags: [ '-H', '--image-height' ],
                type: ParamType.FLOAT,
            },
            {
                key: 'square',
                flags: [ '-s', '--square' ],
                type: ParamType.NONE,
            },
            {
                key: 'line-width',
                flags: [ '-n', '--line-width' ],
                type: ParamType.FLOAT,
            },
            {
                key: 'passage-width',
                flags: [ '-g', '--passage-width' ],
                type: ParamType.FLOAT,
            },
            {
                key: 'wall-color',
                flags: [ '-a', '--wall-color' ],
                type: ParamType.STRING,
            },
            {
                key: 'background-color',
                flags: [ '-b', '--background-color' ],
                type: ParamType.STRING,
            },
            {
                key: 'solution-color',
                flags: [ '-c', '--solution-color' ],
                type: ParamType.STRING,
            },
            {
                key: 'version',
                flags: [ '-v', '--version' ],
                type: ParamType.NONE,
            },
            {
                key: 'help',
                flags: [ '-e', '--help' ],
                type: ParamType.NONE,
            },
        ]);
    } catch (e) {
        console.log();
        console.log((e as Error).message);
        printUsage();
        return;
    }

    if (args.get('version') as boolean | undefined) {
        console.log('\n1.0.0\n');
        return;
    }

    if (args.get('help') as boolean | undefined) {
        printUsage();
        return;
    }

    const outputFilename = args.get('output') as string | undefined;
    if (!outputFilename) {
        printUsage();
        return;
    }

    let paperSize: PaperSize;
    try {
        toPaperSize(args.get('paper-size') as string | undefined);
    } catch (e) {
        console.log((e as Error).message);
        return;
    }

    let mazeWidth = args.get('maze-width') as number | undefined;
    let mazeHeight = args.get('maze-height') as number | undefined;
    const mask = args.get('mask') as string | undefined;
    if (mask) {
        if (mazeWidth !== undefined || mazeHeight !== undefined) {
            console.log('Specify either maze dimensions or a mask image, but not both.');
            return;
        }
    } else {
        if (mazeWidth === undefined) {
            mazeWidth = DEFAULT_MAZE_WIDTH;
        }
        if (!Number.isInteger(mazeWidth) || mazeWidth < MIN_MAZE_WIDTH || mazeWidth > MAX_MAZE_WIDTH) {
            console.log(`Maze width must be an integer between ${MIN_MAZE_WIDTH} and ${MAX_MAZE_WIDTH}.`);
            return;
        }
        if (mazeHeight === undefined) {
            mazeHeight = DEFAULT_MAZE_HEIGHT;
        }
        if (!Number.isInteger(mazeHeight) || mazeHeight < MIN_MAZE_HEIGHT || mazeHeight > MAX_MAZE_HEIGHT) {
            console.log(`Maze height must be an integer between ${MIN_MAZE_HEIGHT} and ${MAX_MAZE_HEIGHT}.`);
            return;
        }
    }

    let crossFrac = args.get('crosses') as number | undefined;
    if (crossFrac === undefined) {
        crossFrac = DEFAULT_CROSS_FRACTION;
    } else {
        crossFrac /= 100;
    }
    if (crossFrac < MIN_CROSS_FRACTION || crossFrac > MAX_CROSS_FRACTION) {
        console.log(`Crosses must be between ${100 * MIN_CROSS_FRACTION} and ${100 * MAX_CROSS_FRACTION}.`);
        return;
    }

    let loopsFrac = args.get('loops') as number | undefined;
    if (loopsFrac === undefined) {
        loopsFrac = DEFAULT_LOOP_FRACTION;
    } else {
        loopsFrac /= 100;
    }
    if (loopsFrac < MIN_LOOP_FRACTION || loopsFrac > MAX_LOOP_FRACTION) {
        console.log(`Crosses must be between ${100 * MIN_LOOP_FRACTION} and ${100 * MAX_LOOP_FRACTION}.`);
        return;
    }

    let longPassages = args.get('long') as boolean | undefined;
    if (longPassages === undefined) {
        longPassages = DEFAULT_LONG_PASSAGES;
    }

    


    // const mazeOptions = new MazeOptions();
    // //mazeOptions.mask = await loadMask('maze-mask.png');
    // mazeOptions.width = 200;
    // mazeOptions.height = 200;
    //
    // const renderOptions = new RenderOptions('maze.png');
    // renderOptions.backgroundColor = new Color(255, 255, 255, 0);
    // renderOptions.curved = true;
    //
    // await saveMaze(generateMaze(mazeOptions), renderOptions);
}

void main();