import { Color } from '@/render/Color';
import { PaperSize } from '@/render/PaperSize';

export const DEFAULT_PAPER_SIZE = PaperSize.LETTER;
export const DEFAULT_CURVED = true;
export const DEFAULT_SOLUTION = true;
export const DEFAULT_CELL_SIZE = 25;

export const MAX_IMAGE_WIDTH = 10_000;
export const MAX_IMAGE_HEIGHT = 10_000;

export const MIN_LINE_WIDTH_FRAC = 0;
export const MAX_LINE_WIDTH_FRAC = 1;
export const DEFAULT_LINE_WIDTH_FRAC = 0.15;

export const MIN_PASSAGE_WIDTH_FRAC = 0;
export const MAX_PASSAGE_WIDTH_FRAC = 1;
export const DEFAULT_PASSAGE_WIDTH_FRAC = 0.7;

export class RenderOptions {
    constructor(public readonly filename: string,
                public readonly paperSize = DEFAULT_PAPER_SIZE, // only applicable to PDF

                public readonly curved = DEFAULT_CURVED,
                public readonly solution = DEFAULT_SOLUTION,

                public readonly cellSize = DEFAULT_CELL_SIZE,
                public readonly imageWidth = 0,
                public readonly imageHeight = 0,

                public readonly lineWidthFrac = DEFAULT_LINE_WIDTH_FRAC,
                public readonly passageWidthFrac = DEFAULT_PASSAGE_WIDTH_FRAC,

                public readonly backgroundColor = new Color(255, 255, 255, 1),
                public readonly wallColor = new Color(0, 0, 0, 1),
                public readonly solutionColor = new Color(255, 0, 0, 1)) {
    }
}