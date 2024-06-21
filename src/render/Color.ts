export class Color {
    constructor(public readonly red: number,        // 0--255
                public readonly green: number,      // 0--255
                public readonly blue: number,       // 0--255
                public readonly alpha: number) {    // 0--1
    }

    toStyle() {
        return `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.alpha})`;
    }
}