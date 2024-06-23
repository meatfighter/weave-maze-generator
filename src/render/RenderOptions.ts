import { Color } from '@/render/Color';
import { PaperSize } from '@/render/PaperSize';

export class RenderOptions {
    constructor(public readonly filename: string,
                public readonly paperSize = PaperSize.LETTER, // only applicable to PDF

                public readonly curved = true,
                public readonly solution = true,

                public readonly cellSize = 25,
                public readonly imageWidth = 0,
                public readonly imageHeight = 0,

                public readonly lineWidthFrac = 0.15,
                public readonly passageWidthFrac = 0.7,

                public readonly backgroundColor = new Color(255, 255, 255, 1),
                public readonly wallColor = new Color(0, 0, 0, 1),
                public readonly solutionColor = new Color(255, 0, 0, 1)) {
    }
}