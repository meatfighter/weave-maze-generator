import { TerminalSide } from '@/TerminalSide';

export class Terminal {
    constructor(public side: TerminalSide, public position: number, public open: boolean) {
    }
}