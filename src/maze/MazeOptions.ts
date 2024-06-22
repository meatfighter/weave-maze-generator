import { Terminal } from '@/maze/Terminal';
import { TerminalSide } from '@/maze/TerminalSide';

export class MazeOptions {
    constructor(public width = 20,
                public height = 20,
                public loopFraction = 0.05,
                public crossFraction = .25,
                public longCorridors = false,
                public startTerminal = new Terminal(TerminalSide.WEST, 1, true),
                public endTerminal = new Terminal(TerminalSide.EAST, 0, true),
                public mask?: boolean[][]) {
    }
}