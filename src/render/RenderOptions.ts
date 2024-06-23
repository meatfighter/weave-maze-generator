import { Color } from '@/render/Color';
import { PaperSize } from '@/render/PaperSize';

export class RenderOptions {
    constructor(public filename: string,
                public paperSize = PaperSize.LETTER, // only applicable to PDF

                public curved = true,
                public solution = true,

                public cellSize = 25,
                public imageWidth = 0,
                public imageHeight = 0,

                public lineThicknessFrac = 0.15,
                public passageWidthFrac = 0.7,

                public backgroundColor = new Color(255, 255, 255, 1),
                public wallColor = new Color(0, 0, 0, 1),
                public solutionColor = new Color(255, 0, 0, 1)) {
    }
}