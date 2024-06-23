const MARGIN_INCHES = .25;
const DPI = 72;
const MILLIMETERS_PER_INCH = 25.4;

export const MARGIN_DOTS = DPI * MARGIN_INCHES;

enum DimensionUnits {
    INCHES,
    MILLIMETERS,
}

export class PaperSize {

    readonly widthDots: number;
    readonly heightDots: number;
    readonly printableWidthDots: number;
    readonly printableHeightDots: number;

    constructor(public name: string, public width: number, public height: number,
                public units = DimensionUnits.INCHES) {

        let widthInches = width;
        let heightInches = height;
        if (units === DimensionUnits.MILLIMETERS) {
            widthInches /= MILLIMETERS_PER_INCH;
            heightInches /= MILLIMETERS_PER_INCH;
        }
        this.widthDots = DPI * widthInches;
        this.heightDots = DPI * heightInches;
        this.printableWidthDots = this.widthDots - 2 * MARGIN_DOTS;
        this.printableHeightDots = this.heightDots - 2 * MARGIN_DOTS;
    }

    static UNSPECIFIED = new PaperSize('Unspecified', 0, 0);
    static LETTER = new PaperSize('Letter', 8.5, 11);
    static TABLOID = new PaperSize('Tabloid', 11, 17);
    static LEGAL = new PaperSize('Legal', 8.5, 14);
    static STATEMENT = new PaperSize('Statement', 5.5, 8.5);
    static EXECUTIVE = new PaperSize('Executive', 7.25, 10.5);
    static FOLIO = new PaperSize('Folio', 8.5, 13.5);
    static QUARTO = new PaperSize('Quarto', 8.5, 10 + 5/6);
    static A3 = new PaperSize('A3', 297, 420, DimensionUnits.MILLIMETERS);
    static A4 = new PaperSize('A4', 210, 297, DimensionUnits.MILLIMETERS);
    static A5 = new PaperSize('A5', 148, 210, DimensionUnits.MILLIMETERS);
    static B4_JIS = new PaperSize('B4 (JIS)', 257, 364, DimensionUnits.MILLIMETERS);
    static B5_JIS = new PaperSize('B5 (JIS)', 182, 257, DimensionUnits.MILLIMETERS);
}