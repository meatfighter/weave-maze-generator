import {
    DEFAULT_CROSS_FRAC,
    DEFAULT_LONG_PASSAGES,
    DEFAULT_LOOP_FRAC,
    DEFAULT_MAZE_SIZE,
    MAX_CROSS_FRAC,
    MAX_LOOP_FRAC,
    MAX_MAZE_SIZE, MazeOptions,
    MIN_CROSS_FRAC,
    MIN_LOOP_FRAC,
    MIN_MAZE_SIZE
} from '@/maze/MazeOptions';
import { extractArgs, ParamType } from '@/utils/args';
import { PaperSize, toPaperSize } from '@/render/PaperSize';
import {
    DEFAULT_CELL_SIZE,
    DEFAULT_FILENAME_PREFIX,
    DEFAULT_LINE_WIDTH_FRAC,
    DEFAULT_PASSAGE_WIDTH_FRAC,
    DEFAULT_SOLUTION,
    DEFAULT_SOLUTION_COLOR,
    DEFAULT_TIMESTAMP,
    DEFAULT_WALL_COLOR,
    MAX_IMAGE_SIZE,
    MAX_LINE_WIDTH_FRAC,
    MAX_PASSAGE_WIDTH_FRAC,
    MIN_CELL_SIZE,
    MIN_IMAGE_SIZE,
    MIN_LINE_WIDTH_FRAC,
    MIN_PASSAGE_WIDTH_FRAC, RenderOptions
} from '@/render/RenderOptions';
import { checkFileExists, ensureDirectoryExists } from '@/utils/files';
import { loadMask } from '@/mask/mask-loader';
import { Color, toColor } from '@/render/Color';
import { FileFormat, toFileFormat } from '@/render/FileFormat';
import { generateMaze } from '@/maze/maze-generator';
import { saveMaze } from '@/render/maze-renderer';
import * as console from 'console';

const DEFAULT_CROSS_PER = Math.round(100 * DEFAULT_CROSS_FRAC);
const DEFAULT_LOOP_PER = Math.round(100 * DEFAULT_LOOP_FRAC);

function printUsage() {
    console.log(`
Usage: weave-maze-generator [options]

Output:
  -d, --destination "..."     Output directory (required)
  -f, --format                Output file format: png | svg | pdf (default: all three formats)
  -p, --prefix                Output filename prefix (default: ${DEFAULT_FILENAME_PREFIX})
  -n, --no-timestamp          Disables output filename timestamp
  -N, --no-solution           Disables solution file generation
  -P, --paper-size ...        Paper size for pdf files:
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
  -w, --maze-width ...        Number of cells spanning the width (default: ${DEFAULT_MAZE_SIZE}, max: ${MAX_MAZE_SIZE})
  -h, --maze-height ...       Number of cells spanning the height (default: ${DEFAULT_MAZE_SIZE}, max: ${MAX_MAZE_SIZE})
  
Custom-shaped Mazes:
  -m, --mask "..."            Filename of png image containing white pixels for maze cells and black or transparent
                              pixels for empty cells, with a maximum width and height of 200 pixels

Passages:
  -x, --crosses ...           Percentage of maze cells where two passages cross (default: ${DEFAULT_CROSS_PER})
  -l, --loops ...             Percentage of maze cells where a passage loops over itself (default: ${DEFAULT_LOOP_PER})
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
  -i, --line-width ...        Wall and solution path line width (default: 15)
  -g, --passage-width ...     Maze passage width (default: 70)

Colors (hexadecimal color codes: RRGGBB or RRGGBBAA):
  -a, --wall-color ...        Wall color; default black (000000FF)
  -b, --background-color ...  Background color; default white for png (FFFFFFFF), transparent for svg and pdf (00000000)
  -c, --solution-color ...    Solution path color; default red (FF0000FF)

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
                key: 'destination',
                flags: [ '-d', '--destination' ],
                type: ParamType.STRING,
            },
            {
                key: 'format',
                flags: [ '-f', '--format' ],
                type: ParamType.STRING,
            },
            {
                key: 'prefix',
                flags: [ '-p', '--prefix' ],
                type: ParamType.STRING,
            },
            {
                key: 'no-timestamp',
                flags: [ '-n', '--no-timestamp' ],
                type: ParamType.NONE,
            },
            {
                key: 'no-solution',
                flags: [ '-N', '--no-solution' ],
                type: ParamType.NONE,
            },
            {
                key: 'paper-size',
                flags: [ '-P', '--paper-size' ],
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
                flags: [ '-x', '--crosses' ],
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
                flags: [ '-i', '--line-width' ],
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

    let outputDirectory = args.get('destination') as string | undefined;
    if (!outputDirectory) {
        printUsage();
        return;
    }
    outputDirectory = outputDirectory.trim();

    let fileFormat: FileFormat;
    try {
        fileFormat = toFileFormat(args.get('format') as string | undefined);
    } catch (e) {
        console.log((e as Error).message);
        return;
    }

    let filenamePrefix = args.get('prefix') as string | undefined;
    if (!filenamePrefix) {
        filenamePrefix = DEFAULT_FILENAME_PREFIX;
    } else {
        filenamePrefix = filenamePrefix.trim();
    }

    let timestamp = args.get('no-timestamp') as boolean | undefined;
    if (timestamp === undefined) {
        timestamp = DEFAULT_TIMESTAMP;
    } else {
        timestamp = !timestamp;
    }

    let solution = args.get('no-solution') as boolean | undefined;
    if (solution === undefined) {
        solution = DEFAULT_SOLUTION;
    } else {
        solution = !solution;
    }

    let paperSize: PaperSize;
    try {
        paperSize = toPaperSize(args.get('paper-size') as string | undefined);
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
            console.log('\nSpecify either maze dimensions or a mask image, but not both.\n');
            return;
        }
        if (!(await checkFileExists(maskFilename))) {
            console.log('\nMask file not found.\n');
            return;
        }
        try {
            mask = await loadMask(maskFilename);
        } catch {
            console.log('\nFailed to load mask file.\n');
            return;
        }
        mazeHeight = mask.length;
        if (mazeHeight < MIN_MAZE_SIZE || mazeHeight > MAX_MAZE_SIZE) {
            console.log(`\nMask height must be between ${MIN_MAZE_SIZE} and ${MAX_MAZE_SIZE}.\n`);
            return;
        }
        mazeWidth = mask[0].length;
        if (mazeWidth < MIN_MAZE_SIZE || mazeWidth > MAX_MAZE_SIZE) {
            console.log(`\nMask width must be between ${MIN_MAZE_SIZE} and ${MAX_MAZE_SIZE}.\n`);
            return;
        }
    } else {
        if (mazeWidth === undefined) {
            mazeWidth = DEFAULT_MAZE_SIZE;
        }
        if (!Number.isInteger(mazeWidth) || mazeWidth < MIN_MAZE_SIZE || mazeWidth > MAX_MAZE_SIZE) {
            console.log(`\nMaze width must be an integer between ${MIN_MAZE_SIZE} and ${MAX_MAZE_SIZE}.\n`);
            return;
        }
        if (mazeHeight === undefined) {
            mazeHeight = DEFAULT_MAZE_SIZE;
        }
        if (!Number.isInteger(mazeHeight) || mazeHeight < MIN_MAZE_SIZE || mazeHeight > MAX_MAZE_SIZE) {
            console.log(`\nMaze height must be an integer between ${MIN_MAZE_SIZE} and ${MAX_MAZE_SIZE}.\n`);
            return;
        }
    }

    let crossFrac = args.get('crosses') as number | undefined;
    if (crossFrac === undefined) {
        crossFrac = DEFAULT_CROSS_FRAC;
    } else {
        crossFrac /= 100;
    }
    if (crossFrac < MIN_CROSS_FRAC || crossFrac > MAX_CROSS_FRAC) {
        console.log(`\nCrosses must be between ${100 * MIN_CROSS_FRAC} and ${100 * MAX_CROSS_FRAC}.\n`);
        return;
    }

    let loopsFrac = args.get('loops') as number | undefined;
    if (loopsFrac === undefined) {
        loopsFrac = DEFAULT_LOOP_FRAC;
    } else {
        loopsFrac /= 100;
    }
    if (loopsFrac < MIN_LOOP_FRAC || loopsFrac > MAX_LOOP_FRAC) {
        console.log(`\nLoops must be between ${100 * MIN_LOOP_FRAC} and ${100 * MAX_LOOP_FRAC}.\n`);
        return;
    }

    let longPassages = args.get('long') as boolean | undefined;
    if (longPassages === undefined) {
        longPassages = DEFAULT_LONG_PASSAGES;
    }

    let cellSize = args.get('cell-size') as number | undefined;
    let imageWidth = args.get('image-width') as number | undefined;
    let imageHeight = args.get('image-height') as number | undefined;
    if (cellSize === undefined && imageWidth === undefined && imageHeight === undefined) {
        cellSize = DEFAULT_CELL_SIZE;
    }
    if (cellSize !== undefined) {
        if (imageWidth !== undefined || imageHeight !== undefined) {
            console.log('\nExclusively specify either cell size, image width, or image height.\n');
            return;
        }
        if (cellSize < MIN_CELL_SIZE) {
            console.log(`\nCell size must be at least ${MIN_CELL_SIZE}.\n`);
            return;
        }
        imageWidth = cellSize * mazeWidth;
        imageHeight = cellSize * mazeHeight;
        if (imageWidth > MAX_IMAGE_SIZE || imageHeight > MAX_IMAGE_SIZE) {
            console.log('\nCell size too big.\n');
            return;
        }
    } else if (imageWidth !== undefined) {
        if (imageHeight !== undefined) {
            console.log('\nExclusively specify either cell size, image width, or image height.\n');
            return;
        }
        if (imageWidth < MIN_IMAGE_SIZE || imageWidth > MAX_IMAGE_SIZE) {
            console.log(`\nImage width must be between ${MIN_IMAGE_SIZE} and ${MAX_IMAGE_SIZE}.\n`);
            return;
        }
        cellSize = imageWidth / mazeWidth;
        imageHeight = cellSize * mazeHeight;
    } else if (imageHeight !== undefined) {
        if (imageHeight < MIN_IMAGE_SIZE || imageHeight > MAX_IMAGE_SIZE) {
            console.log(`\nImage height must be between ${MIN_IMAGE_SIZE} and ${MAX_IMAGE_SIZE}.\n`);
            return;
        }
        cellSize = imageHeight / mazeHeight;
        imageWidth = cellSize * mazeWidth;
    }

    const roundedCorners = !(args.get('square') as boolean | undefined);

    let lineWidthFrac = args.get('line-width') as number | undefined;
    if (lineWidthFrac === undefined) {
        lineWidthFrac = DEFAULT_LINE_WIDTH_FRAC;
    } else {
        lineWidthFrac /= 100;
    }
    if (lineWidthFrac < MIN_LINE_WIDTH_FRAC || lineWidthFrac > MAX_LINE_WIDTH_FRAC) {
        console.log(`\nLine width must be between ${100 * MIN_LINE_WIDTH_FRAC} and ${100 * MAX_LINE_WIDTH_FRAC}.\n`);
        return;
    }

    let passageWidthFrac = args.get('passage-width') as number | undefined;
    if (passageWidthFrac === undefined) {
        passageWidthFrac = DEFAULT_PASSAGE_WIDTH_FRAC;
    } else {
        passageWidthFrac /= 100;
    }
    if (passageWidthFrac < MIN_PASSAGE_WIDTH_FRAC || passageWidthFrac > MAX_PASSAGE_WIDTH_FRAC) {
        console.log(`\nPassage width must be between ${100 * MIN_PASSAGE_WIDTH_FRAC} and ` +
                `${100 * MAX_PASSAGE_WIDTH_FRAC}.\n`);
        return;
    }
    
    const wallColorStr = args.get('wall-color') as string | undefined;
    let wallColor: Color;
    if (wallColorStr) {
        try {
            wallColor = toColor(wallColorStr);
        } catch {
            console.log('\nInvalid wall color.\n');
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
            console.log('\nInvalid background color.\n');
            return;
        }
    }
    
    const solutionColorStr = args.get('solution-color') as string | undefined;
    let solutionColor: Color;
    if (solutionColorStr) {
        try {
            solutionColor = toColor(solutionColorStr);
        } catch {
            console.log('\nInvalid solution color.\n');
            return;
        }
    } else {
        solutionColor = DEFAULT_SOLUTION_COLOR;
    }

    if (!(await ensureDirectoryExists(outputDirectory))) {
        console.log('\nFailed to created output directory.\n');
        return;
    }

    await saveMaze(generateMaze(new MazeOptions(mazeWidth, mazeHeight, loopsFrac, crossFrac, longPassages, mask)),
            new RenderOptions(outputDirectory, fileFormat, filenamePrefix, timestamp, solution, paperSize, cellSize,
                    imageWidth, imageHeight, roundedCorners, lineWidthFrac, passageWidthFrac, wallColor, solutionColor,
                    backgroundColor));
}

void main();