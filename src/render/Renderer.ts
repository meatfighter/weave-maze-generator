import { RenderOptions } from '@/render/RenderOptions';
import { MazeOptions } from '@/MazeOptions';

export interface Renderer {
    init(mazeOptions: MazeOptions, renderOptions: RenderOptions): void;
    beginSolution(): void;
    beginWalls(): void;
    moveTo(x: number, y: number): void;
    lineTo(x: number, y: number): void;
    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
    stroke(): void;
}