export const MIN_MAZE_SIZE = 1;
export const MAX_MAZE_SIZE = 200;
export const DEFAULT_MAZE_SIZE = 40;

export const MIN_LOOP_FRACTION = 0;
export const MAX_LOOP_FRACTION = 1;
export const DEFAULT_LOOP_FRACTION = .05;

export const MIN_CROSS_FRACTION = 0;
export const MAX_CROSS_FRACTION = 1;
export const DEFAULT_CROSS_FRACTION = .25;

export const DEFAULT_LONG_PASSAGES = false;

export class MazeOptions {
    constructor(public readonly width = DEFAULT_MAZE_SIZE,
                public readonly height = DEFAULT_MAZE_HEIGHT,
                public readonly loopFraction = DEFAULT_LOOP_FRACTION,
                public readonly crossFraction = DEFAULT_CROSS_FRACTION,
                public readonly longPassages = DEFAULT_LONG_PASSAGES,
                public readonly mask?: boolean[][]) {
    }
}