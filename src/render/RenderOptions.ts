import { FileType } from '@/render/FileType';

export class RenderOptions {
    constructor(public fileType: FileType | null,
                public fileName: string,

                public curved: boolean,
                public solution: boolean,

                public tileSize: number,
                public imageWidth: number,
                public imageHeight: number,

                public wallThicknessFrac: number,
                public tileMarginFrac: number,

                public backgroundColor = 'FFFFFFFF',
                public wallColor = '000000FF',
                public solutionColor = 'FF0000FF') {
    }
}