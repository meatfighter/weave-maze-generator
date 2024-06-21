import { RenderOptions } from '@/render/RenderOptions';
import { Renderer } from '@/render/Renderer';
import { MazeOptions } from '@/MazeOptions';
import { Canvas, CanvasRenderingContext2D, createCanvas } from 'canvas';
import sharp from 'sharp';

export class BitmapRenderer implements Renderer {

    private readonly canvas: Canvas;
    private readonly ctx: CanvasRenderingContext2D;
    private readonly tileSize: number;
    private readonly renderOptions: RenderOptions;

    constructor(mazeOptions: MazeOptions, renderOptions: RenderOptions) {
        this.renderOptions = renderOptions;

        let canvasWidth: number;
        let canvasHeight: number;
        if (renderOptions.tileSize > 0) {
            this.tileSize = renderOptions.tileSize;
            canvasWidth = this.tileSize * mazeOptions.width;
            canvasHeight = this.tileSize * mazeOptions.height;
        } else if (renderOptions.imageWidth > 0) {
            canvasWidth = renderOptions.imageWidth;
            this.tileSize = canvasWidth / mazeOptions.width;
            canvasHeight = this.tileSize * mazeOptions.height;
        } else if (renderOptions.imageHeight > 0) {
            canvasHeight = renderOptions.imageHeight;
            this.tileSize = canvasHeight / mazeOptions.height;
            canvasWidth = this.tileSize * mazeOptions.width;
        } else {
            throw new Error('tileSize, imageWidth, or imageHeight must be >= 0');
        }

        this.canvas = createCanvas(canvasWidth, canvasHeight);
        this.ctx = this.canvas.getContext('2d');

        const b = renderOptions.backgroundColor;
        this.ctx.fillStyle = `rgba(${b.red}, ${b.green}, ${b.blue}, ${b.alpha})`;
        this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    beginSolution() {
        const s = this.renderOptions.solutionColor;
        this.ctx.lineWidth = this.renderOptions.lineThicknessFrac * this.tileSize;
        this.ctx.strokeStyle = `rgba(${s.red}, ${s.green}, ${s.blue}, ${s.alpha})`;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
    }

    beginWalls() {
        const w = this.renderOptions.wallColor;
        this.ctx.lineWidth = this.renderOptions.lineThicknessFrac * this.tileSize;
        this.ctx.strokeStyle = `rgba(${w.red}, ${w.green}, ${w.blue}, ${w.alpha})`;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
    }

    moveTo(x: number, y: number) {
        this.ctx.moveTo(x, y);
    }

    lineTo(x: number, y: number) {
        this.ctx.lineTo(x, y);
    }

    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number) {
        this.ctx.arc(x1, y1, x2, y2, radius);
    }

    stroke() {
        this.ctx.stroke();
    }

    async save() {
        // TODO TYPE BASED ON FILE EXTENSION
        await sharp(this.canvas.toBuffer('image/png')).toFile(this.renderOptions.filename);
    }
}