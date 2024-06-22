export class MazeOptions {
    constructor(public width = 30,
                public height = 30,
                public loopFraction = 0.05,
                public crossFraction = .25,
                public longCorridors = false,
                public mask?: boolean[][]) {
    }
}