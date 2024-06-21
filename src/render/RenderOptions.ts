import { FileType } from '@/render/FileType';
import { Color } from '@/render/Color';

export class RenderOptions {
    constructor(public filename: string,
                public fileType: FileType | undefined,

                public curved = true,
                public solution = true,

                public cellSize = 25,
                public imageWidth: number,
                public imageHeight: number,

                public lineThicknessFrac = 0.15,
                public cellMarginFrac = 0.15,

                public backgroundColor = new Color(255, 255, 255, 1),
                public wallColor = new Color(0, 0, 0, 1),
                public solutionColor = new Color(255, 0, 0, 1)) {
    }
}