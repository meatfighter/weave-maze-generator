export class MazeOptions {
    constructor(public width = 40,
                public height = 40,
                public loopFraction = 0.05,
                public crossFraction = .25,
                public longCorridors = false,
                public mask?: boolean[][]) {
    }
}