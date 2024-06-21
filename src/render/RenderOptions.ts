import { Color } from '@/render/Color';

export class RenderOptions {
    constructor(public filename: string,

                public curved = true,
                public solution = true,

                public cellSize = 25,
                public imageWidth = 0,
                public imageHeight = 0,

                public lineThicknessFrac = 0.15,
                public cellMarginFrac = 0.15,

                public backgroundColor = new Color(255, 255, 255, 1),
                public wallColor = new Color(0, 0, 0, 1),
                public solutionColor = new Color(255, 0, 0, 1)) {
    }
}