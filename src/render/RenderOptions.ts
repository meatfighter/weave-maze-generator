import { FileType } from '@/render/FileType';
import { Color } from '@/render/Color';

export class RenderOptions {
    constructor(public fileType: FileType | null,
                public filename: string,

                public curved: boolean,
                public solution: boolean,

                public tileSize: number,
                public imageWidth: number,
                public imageHeight: number,

                public lineThicknessFrac: number,
                public tileMarginFrac: number,

                public backgroundColor: Color,
                public wallColor: Color,
                public solutionColor: Color) {
    }
}