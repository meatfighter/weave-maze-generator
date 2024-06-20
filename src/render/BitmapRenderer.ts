import { RenderOptions } from '@/render/RenderOptions';
import { Renderer } from '@/render/Renderer';
import { MazeOptions } from '@/MazeOptions';
import { createCanvas } from 'canvas';

export class BitmapRenderer implements Renderer {

    init(mazeOptions: MazeOptions, renderOptions: RenderOptions) {
        let tileSize: number;
        let canvasWidth: number;
        let canvasHeight: number;
        if (renderOptions.tileSize > 0) {
            tileSize = renderOptions.tileSize;
            canvasWidth = tileSize * mazeOptions.width;
            canvasHeight = tileSize * mazeOptions.height;
        } else if (renderOptions.imageWidth > 0) {
            canvasWidth = renderOptions.imageWidth;
            tileSize = canvasWidth / mazeOptions.width;
            canvasHeight = tileSize * mazeOptions.height;
        } else if (renderOptions.imageHeight > 0) {
            canvasHeight = renderOptions.imageHeight;
            tileSize = canvasHeight / mazeOptions.height;
            canvasWidth = tileSize * mazeOptions.width;
        } else {
            throw new Error('tileSize, imageWidth, or imageHeight must be >= 0');
        }

        const canvas = createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = `#${renderOptions.backgroundColor}`;
        ctx.fillRect(0, 0, width, height);
    }

    beginSolution() {
        throw new Error('Method not implemented.');
    }

    beginWalls() {
        throw new Error('Method not implemented.');
    }

    moveTo(x: number, y: number) {
        throw new Error('Method not implemented.');
    }

    lineTo(x: number, y: number) {
        throw new Error('Method not implemented.');
    }

    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number) {
        throw new Error('Method not implemented.');
    }

    stroke() {
        throw new Error('Method not implemented.');
    }
}