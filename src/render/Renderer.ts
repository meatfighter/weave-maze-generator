import { RenderOptions } from '@/render/RenderOptions';
import { MazeOptions } from '@/MazeOptions';
import { RenderingContext } from '@/render/RenderingContext';

export type RendererConstructor = new (mazeOptions: MazeOptions, renderOptions: RenderOptions) => Renderer;

export function createRenderer(ctor: RendererConstructor,
                               mazeOptions: MazeOptions, renderOptions: RenderOptions): Renderer {
    return new ctor(mazeOptions, renderOptions);
}

export interface Renderer extends RenderingContext {
    beginSolution(): void;
    beginWalls(): void;
    stroke(): void;
    save(): void;
}