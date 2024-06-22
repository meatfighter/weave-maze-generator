import { Terminal } from '@/maze/Terminal';

export class MazeOptions {
    constructor(public width: number,
                public height: number,
                public loopFraction: number,
                public crossFraction: number,
                public longCorridors: boolean,
                public startTerminal: Terminal,
                public endTerminal: Terminal) {
    }
}