import {
    DEFAULT_CROSS_FRACTION,
    DEFAULT_LONG_PASSAGES,
    DEFAULT_LOOP_FRACTION,
    DEFAULT_MAZE_SIZE,
    MAX_CROSS_FRACTION,
    MAX_LOOP_FRACTION,
    MAX_MAZE_SIZE,
    MIN_CROSS_FRACTION,
    MIN_LOOP_FRACTION,
    MIN_MAZE_SIZE
} from '@/maze/MazeOptions';
import { extractArgs, ParamType } from '@/utils/args';
import { PaperSize, toPaperSize } from '@/render/PaperSize';
import {
    DEFAULT_LINE_WIDTH_FRAC, DEFAULT_PASSAGE_WIDTH_FRAC, DEFAULT_SOLUTION_COLOR, DEFAULT_WALL_COLOR,
    MAX_IMAGE_SIZE, MAX_LINE_WIDTH_FRAC, MAX_PASSAGE_WIDTH_FRAC,
    MIN_CELL_SIZE,
    MIN_IMAGE_SIZE,
    MIN_LINE_WIDTH_FRAC, MIN_PASSAGE_WIDTH_FRAC
} from '@/render/RenderOptions';
import { checkFileExists } from '@/utils/files';
import { loadMask } from '@/mask/mask-loader';
import { Color, toColor } from '@/render/Color';

// TODO
// - command-line options
// - save multiple file types if no file extension is provided

// - 1x1 -- 200x200 seems to be a good range

function printUsage() {
    console.log(`
Usage: weave-maze-generator [options]

Output:
  -o, --output "..."          Output filename or output directory (required)
                              Supported formats: png, svg, pdf                              
                              If a dir is provided or the filename lacks an extension, files of all formats are created.
  -n, --no-solution           Disables solution file generation.
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

Rectangle Mazes:
  -w, --maze-width ...        Number of cells spanning the width (default: 40, max: 200)
  -h, --maze-height ...       Number of cells spanning the height (default: 40, max: 200)
  
Custom-shaped Mazes:
  -m, --mask "..."            Filename of png image containing white pixels for maze cells and black or transparent
                              pixels for empty cells, with a maximum width and height of 200 pixels

Passages:
  -x, --crosses ...           Percentage of maze cells where two passages cross (default: 25)
  -l, --loops ...             Percentage of maze cells where a passage loops over itself (default: 5)
  -L, --long                  Enables long passage generation.

Dimensions (specify one only):
  -S, --cell-size ...         Square maze cell size in pixels
                              Default: 25 or (image width / maze width) or (image height / maze height)
  -W, --image-width ...       Output image width in pixels
                              Default: (maze width x cell size) or (image height x maze width / maze height)
  -H, --image-height ...      Output image height in pixels
                              Default: (maze height x cell size) or (image width x maze height / maze width)

Corners:
  -s, --square                Enables square corners instead of the default rounded corners.

Widths (percentage of cell size):
  -d, --line-width ...        Wall and solution path line width (default: 15)
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
                key: 'no-solution',
                flags: [ '-n', '--no-solution' ],
                type: ParamType.NONE,
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
                flags: [ '-d', '--line-width' ],
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

    const noSolution = !!(args.get('no-solution') as boolean | undefined);

    let paperSize: PaperSize;
    try {
        toPaperSize(args.get('paper-size') as string | undefined);
    } catch (e) {
        console.log((e as Error).message);
        return;
    }

    let mazeWidth = args.get('maze-width') as number | undefined;
    let mazeHeight = args.get('maze-height') as number | undefined;
    const maskFilename = args.get('mask') as string | undefined;
    let mask: boolean[][] | undefined;
    if (maskFilename) {
        if (mazeWidth !== undefined || mazeHeight !== undefined) {
            console.log('Specify either maze dimensions or a mask image, but not both.');
            return;
        }
        if (!(await checkFileExists(maskFilename))) {
            console.log('Mask file not found.');
            return;
        }
        try {
            mask = await loadMask(maskFilename);
        } catch {
            console.log('Failed to load mask file.');
            return;
        }
        if (mask.length < MIN_MAZE_SIZE || mask.length > MAX_MAZE_SIZE) {
            console.log(`Mask height must be between ${MIN_MAZE_SIZE} and ${MAX_MAZE_SIZE}.`);
            return;
        }
        if (mask[0].length < MIN_MAZE_SIZE || mask[0].length > MAX_MAZE_SIZE) {
            console.log(`Mask width must be between ${MIN_MAZE_SIZE} and ${MAX_MAZE_SIZE}.`);
            return;
        }
    } else {
        if (mazeWidth === undefined) {
            mazeWidth = DEFAULT_MAZE_SIZE;
        }
        if (!Number.isInteger(mazeWidth) || mazeWidth < MIN_MAZE_SIZE || mazeWidth > MAX_MAZE_SIZE) {
            console.log(`Maze width must be an integer between ${MIN_MAZE_SIZE} and ${MAX_MAZE_SIZE}.`);
            return;
        }
        if (mazeHeight === undefined) {
            mazeHeight = DEFAULT_MAZE_SIZE;
        }
        if (!Number.isInteger(mazeHeight) || mazeHeight < MIN_MAZE_SIZE || mazeHeight > MAX_MAZE_SIZE) {
            console.log(`Maze height must be an integer between ${MIN_MAZE_SIZE} and ${MAX_MAZE_SIZE}.`);
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

    let cellSize = args.get('cell-size') as number | undefined;
    let imageWidth = args.get('image-width') as number | undefined;
    let imageHeight = args.get('image-height') as number | undefined;
    if (cellSize !== undefined) {
        if (imageWidth !== undefined || imageHeight !== undefined) {
            console.log('Exclusively specify either cell size, image width, or image height.');
            return;
        }
        if (cellSize < MIN_CELL_SIZE) {
            console.log(`Cell size must be at least ${MIN_CELL_SIZE}.`);
            return;
        }
        if ((mazeWidth && cellSize * mazeWidth > MAX_IMAGE_SIZE)
                || (mazeHeight && cellSize * mazeHeight > MAX_IMAGE_SIZE)
                || (mask && cellSize * mask.length > MAX_IMAGE_SIZE)
                || (mask && cellSize * mask[0].length > MAX_IMAGE_SIZE)) {
            console.log('Cell size too big.');
            return;
        }
    } else if (imageWidth !== undefined) {
        if (imageHeight !== undefined) {
            console.log('Exclusively specify either cell size, image width, or image height.');
            return;
        }
        if (imageWidth < MIN_IMAGE_SIZE || imageWidth > MAX_IMAGE_SIZE) {
            console.log(`Image width must be between ${MIN_IMAGE_SIZE} and ${MAX_IMAGE_SIZE}.`);
            return;
        }
    } else if (imageHeight !== undefined) {
        if (imageHeight < MIN_IMAGE_SIZE || imageHeight > MAX_IMAGE_SIZE) {
            console.log(`Image height must be between ${MIN_IMAGE_SIZE} and ${MAX_IMAGE_SIZE}.`);
            return;
        }
    }

    const roundedCorners = !(args.get('square') as boolean | undefined);

    let lineWidthFrac = args.get('line-width') as number | undefined;
    if (lineWidthFrac === undefined) {
        lineWidthFrac = DEFAULT_LINE_WIDTH_FRAC;
    } else {
        lineWidthFrac /= 100;
    }
    if (lineWidthFrac < MIN_LINE_WIDTH_FRAC || lineWidthFrac > MAX_LINE_WIDTH_FRAC) {
        console.log(`Line width must be between ${100 * MIN_LINE_WIDTH_FRAC} and ${100 * MAX_LINE_WIDTH_FRAC}.`);
        return;
    }

    let passageWidthFrac = args.get('passage-width') as number | undefined;
    if (passageWidthFrac === undefined) {
        passageWidthFrac = DEFAULT_PASSAGE_WIDTH_FRAC;
    } else {
        passageWidthFrac /= 100;
    }
    if (passageWidthFrac < MIN_PASSAGE_WIDTH_FRAC || passageWidthFrac > MAX_PASSAGE_WIDTH_FRAC) {
        console.log(`Passage width must be between ${100 * MIN_PASSAGE_WIDTH_FRAC} and ` +
                `${100 * MAX_PASSAGE_WIDTH_FRAC}.`);
        return;
    }
    
    const wallColorStr = args.get('wall-color') as string | undefined;
    let wallColor: Color;
    if (wallColorStr) {
        try {
            wallColor = toColor(wallColorStr);
        } catch {
            console.log('Invalid wall color.');
            return;
        }
    } else {
        wallColor = DEFAULT_WALL_COLOR;
    }

    const backgroundColorStr = args.get('background-color') as string | undefined;
    let backgroundColor: Color | undefined;
    if (backgroundColorStr) {
        try {
            backgroundColor = toColor(backgroundColorStr);
        } catch {
            console.log('Invalid background color.');
            return;
        }
    }
    
    const solutionColorStr = args.get('solution-color') as string | undefined;
    let solutionColor: Color;
    if (solutionColorStr) {
        try {
            solutionColor = toColor(solutionColorStr);
        } catch {
            console.log('Invalid solution color.');
            return;
        }
    } else {
        solutionColor = DEFAULT_SOLUTION_COLOR;
    }    

    // const mazeOptions = new MazeOptions();
    // //mazeOptions.mask = await loadMask('maze-mask.png');
    // mazeOptions.width = 200;
    // mazeOptions.height = 200;
    //
    // const renderOptions = new RenderOptions('maze.png');
    // renderOptions.backgroundColor = new Color(255, 255, 255, 0);
    // renderOptions.roundedCorners = true;
    //
    // await saveMaze(generateMaze(mazeOptions), renderOptions);
}

void main();