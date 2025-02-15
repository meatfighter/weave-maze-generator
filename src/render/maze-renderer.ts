import * as path from 'path';
import { promises as fs } from 'fs';
import { Maze } from '@/maze/Maze';
import { Canvas, CanvasRenderingContext2D, createCanvas } from 'canvas';
import { PathOptimizer } from '@/render/PathOptimizer';
import { Segment } from '@/render/Segment';
import { Point } from '@/render/Point';
import { Line } from '@/render/Line';
import { Arc } from '@/render/Arc';
import {
    DEFAULT_PNG_BACKGROUND_COLOR,
    DEFAULT_SVG_AND_PDF_BACKGROUND_COLOR,
    RenderOptions
} from '@/render/RenderOptions';
import { PaperSize } from '@/render/PaperSize';
import { getTimestamp } from '@/utils/time';
import { toFileExtensions } from '@/render/FileFormat';

function renderPaths(ctx: CanvasRenderingContext2D, paths: Segment[][], roundedCorners: boolean) {
    ctx.beginPath();
    paths.forEach(path => {
        let cursor = new Point();
        path.forEach(segment => {
            const p0 = segment.getStart();
            if (!p0.equals(cursor)) {
                ctx.moveTo(p0.x, p0.y);
            }
            if (segment.isLine()) {
                const line = segment as Line;
                ctx.lineTo(line.p1.x, line.p1.y);
                cursor = line.p1;
            } else {
                const arc = segment as Arc;
                if (roundedCorners) {
                    ctx.arcTo(arc.p1.x, arc.p1.y, arc.p2.x, arc.p2.y, arc.radius);
                } else {
                    ctx.lineTo(arc.p1.x, arc.p1.y);
                    ctx.lineTo(arc.p2.x, arc.p2.y);
                }
                cursor = arc.p2;
            }
        });
    });
    ctx.stroke();
}

function generateSolutionPaths(maze: Maze, cellSize: number, cellMarginFrac: number): Segment[][] {

    const c = new PathOptimizer();

    const d0 = cellMarginFrac * cellSize;
    const d1 = (1 - cellMarginFrac) * cellSize;
    const dm = cellSize / 2;

    for (let i = maze.height - 1; i >= 0; --i) {
        const oy = i * cellSize;
        for (let j = maze.width - 1; j >= 0; --j) {
            const ox = j * cellSize;
            const cell = maze.cells[i][j];

            if (cell.upper.north2) {
                c.moveTo(ox + dm, oy);
                c.lineTo(ox + dm, oy + cellSize);
            } else if (cell.upper.east2) {
                c.moveTo(ox, oy + dm);
                c.lineTo(ox + cellSize, oy + dm);
            }

            if (cell.upper.north && cell.lower.east2) {
                c.moveTo(ox, oy + dm);
                c.lineTo(ox + d0, oy + dm);
                c.moveTo(ox + d1, oy + dm);
                c.lineTo(ox + cellSize, oy + dm);
            } else if (cell.upper.east && cell.lower.north2) {
                c.moveTo(ox + dm, oy);
                c.lineTo(ox + dm, oy + d0);
                c.moveTo(ox + dm, oy + d1);
                c.lineTo(ox + dm, oy + cellSize);
            } else {
                const lower = cell.lower;
                const value = (lower.north2 ? 0b1000 : 0) | (lower.east2 ? 0b0100 : 0) | (lower.south2 ? 0b0010 : 0)
                    | (lower.west2 ? 0b0001 : 0);

                switch (value) {
                    case 0b1100:
                        c.moveTo(ox + dm, oy);
                        c.arcTo(ox + dm, oy + dm, ox + cellSize, oy + dm, dm);
                        break;
                    case 0b0110:
                        c.moveTo(ox + cellSize, oy + dm);
                        c.arcTo(ox + dm, oy + dm, ox + dm, oy + cellSize, dm);
                        break;
                    case 0b0011:
                        c.moveTo(ox + dm, oy + cellSize);
                        c.arcTo(ox + dm, oy + dm, ox, oy + dm, dm);
                        break;
                    case 0b1001:
                        c.moveTo(ox, oy + dm);
                        c.arcTo(ox + dm, oy + dm, ox + dm, oy, dm);
                        break;

                    case 0b1010:
                        c.moveTo(ox + dm, oy);
                        c.lineTo(ox + dm, oy + cellSize);
                        break;
                    case 0b0101:
                        c.moveTo(ox, oy + dm);
                        c.lineTo(ox + cellSize, oy + dm);
                        break;
                }
            }
        }
    }

    return c.getPaths();
}

function generateWallPaths(maze: Maze, cellSize: number, cellMarginFrac: number): Segment[][] {

    const c = new PathOptimizer();

    const d0 = cellMarginFrac * cellSize;
    const d1 = (1 - cellMarginFrac) * cellSize;
    const dm = cellSize / 2;
    const r0 = (d1 - d0) / 2;

    for (let i = maze.height - 1; i >= 0; --i) {
        const oy = i * cellSize;
        for (let j = maze.width - 1; j >= 0; --j) {
            const ox = j * cellSize;
            const cell = maze.cells[i][j];

            if (cell.upper.north) {
                c.moveTo(ox + d0, oy);
                c.lineTo(ox + d0, oy + cellSize);
                c.moveTo(ox + d1, oy);
                c.lineTo(ox + d1, oy + cellSize);
                c.moveTo(ox, oy + d0);
                c.lineTo(ox + d0, oy + d0);
                c.moveTo(ox, oy + d1);
                c.lineTo(ox + d0, oy + d1);
                c.moveTo(ox + d1, oy + d0);
                c.lineTo(ox + cellSize, oy + d0);
                c.moveTo(ox + d1, oy + d1);
                c.lineTo(ox + cellSize, oy + d1);
            } else if (cell.upper.east) {
                c.moveTo(ox, oy + d0);
                c.lineTo(ox + cellSize, oy + d0);
                c.moveTo(ox, oy + d1);
                c.lineTo(ox + cellSize, oy + d1);
                c.moveTo(ox + d0, oy);
                c.lineTo(ox + d0, oy + d0);
                c.moveTo(ox + d1, oy);
                c.lineTo(ox + d1, oy + d0);
                c.moveTo(ox + d0, oy + d1);
                c.lineTo(ox + d0, oy + cellSize);
                c.moveTo(ox + d1, oy + d1);
                c.lineTo(ox + d1, oy + cellSize);
            } else {
                const lower = cell.lower;
                const value = (lower.north ? 0b1000 : 0) | (lower.east ? 0b0100 : 0) | (lower.south ? 0b0010 : 0)
                    | (lower.west ? 0b0001 : 0);

                switch (value) {
                    case 0b1000:
                        c.moveTo(ox + d0, oy);
                        c.lineTo(ox + d0, oy + dm);
                        c.arcTo(ox + d0, oy + d1, ox + dm, oy + d1, r0);
                        c.arcTo(ox + d1, oy + d1, ox + d1, oy + dm, r0);
                        c.lineTo(ox + d1, oy);
                        break;
                    case 0b0100:
                        c.moveTo(ox + cellSize, oy + d0);
                        c.lineTo(ox + dm, oy + d0);
                        c.arcTo(ox + d0, oy + d0, ox + d0, oy + dm, r0);
                        c.arcTo(ox + d0, oy + d1, ox + dm, oy + d1, r0);
                        c.lineTo(ox + cellSize, oy + d1);
                        break;
                    case 0b0010:
                        c.moveTo(ox + d0, oy + cellSize);
                        c.lineTo(ox + d0, oy + dm);
                        c.arcTo(ox + d0, oy + d0, ox + dm, oy + d0, r0);
                        c.arcTo(ox + d1, oy + d0, ox + d1, oy + dm, r0);
                        c.lineTo(ox + d1, oy + cellSize);
                        break;
                    case 0b0001:
                        c.moveTo(ox, oy + d0);
                        c.lineTo(ox + dm, oy + d0);
                        c.arcTo(ox + d1, oy + d0, ox + d1, oy + dm, r0);
                        c.arcTo(ox + d1, oy + d1, ox + dm, oy + d1, r0);
                        c.lineTo(ox, oy + d1);
                        break;

                    case 0b1100:
                        c.moveTo(ox + d0, oy);
                        c.arcTo(ox + d0, oy + d1, ox + cellSize, oy + d1, d1);
                        c.moveTo(ox + d1, oy);
                        c.arcTo(ox + d1, oy + d0, ox + cellSize, oy + d0, d0);
                        break;
                    case 0b0110:
                        c.moveTo(ox + d0, oy + cellSize);
                        c.arcTo(ox + d0, oy + d0, ox + cellSize, oy + d0, d1);
                        c.moveTo(ox + d1, oy + cellSize);
                        c.arcTo(ox + d1, oy + d1, ox + cellSize, oy + d1, d0);
                        break;
                    case 0b0011:
                        c.moveTo(ox + d1, oy + cellSize);
                        c.arcTo(ox + d1, oy + d0, ox, oy + d0, d1);
                        c.moveTo(ox + d0, oy + cellSize);
                        c.arcTo(ox + d0, oy + d1, ox, oy + d1, d0);
                        break;
                    case 0b1001:
                        c.moveTo(ox + d1, oy);
                        c.arcTo(ox + d1, oy + d1, ox, oy + d1, d1);
                        c.moveTo(ox + d0, oy);
                        c.arcTo(ox + d0, oy + d0, ox, oy + d0, d0);
                        break;

                    case 0b1101:
                        c.moveTo(ox, oy + d1);
                        c.lineTo(ox + cellSize, oy + d1);
                        c.moveTo(ox + d1, oy);
                        c.arcTo(ox + d1, oy + d0, ox + cellSize, oy + d0, d0);
                        c.moveTo(ox + d0, oy);
                        c.arcTo(ox + d0, oy + d0, ox, oy + d0, d0);
                        break;
                    case 0b1110:
                        c.moveTo(ox + d0, oy);
                        c.lineTo(ox + d0, oy + cellSize);
                        c.moveTo(ox + d1, oy);
                        c.arcTo(ox + d1, oy + d0, ox + cellSize, oy + d0, d0);
                        c.moveTo(ox + d1, oy + cellSize);
                        c.arcTo(ox + d1, oy + d1, ox + cellSize, oy + d1, d0);
                        break;
                    case 0b0111:
                        c.moveTo(ox, oy + d0);
                        c.lineTo(ox + cellSize, oy + d0);
                        c.moveTo(ox + d1, oy + cellSize);
                        c.arcTo(ox + d1, oy + d1, ox + cellSize, oy + d1, d0);
                        c.moveTo(ox + d0, oy + cellSize);
                        c.arcTo(ox + d0, oy + d1, ox, oy + d1, d0);
                        break;
                    case 0b1011:
                        c.moveTo(ox + d1, oy);
                        c.lineTo(ox + d1, oy + cellSize);
                        c.moveTo(ox + d0, oy + cellSize);
                        c.arcTo(ox + d0, oy + d1, ox, oy + d1, d0);
                        c.moveTo(ox + d0, oy);
                        c.arcTo(ox + d0, oy + d0, ox, oy + d0, d0);
                        break;

                    case 0b1111:
                        c.moveTo(ox + d1, oy);
                        c.arcTo(ox + d1, oy + d0, ox + cellSize, oy + d0, d0);
                        c.moveTo(ox + d1, oy + cellSize);
                        c.arcTo(ox + d1, oy + d1, ox + cellSize, oy + d1, d0);
                        c.moveTo(ox + d0, oy + cellSize);
                        c.arcTo(ox + d0, oy + d1, ox, oy + d1, d0);
                        c.moveTo(ox + d0, oy);
                        c.arcTo(ox + d0, oy + d0, ox, oy + d0, d0);
                        break;

                    case 0b1010:
                        c.moveTo(ox + d0, oy);
                        c.lineTo(ox + d0, oy + cellSize);
                        c.moveTo(ox + d1, oy);
                        c.lineTo(ox + d1, oy + cellSize);
                        break;
                    case 0b0101:
                        c.moveTo(ox, oy + d0);
                        c.lineTo(ox + cellSize, oy + d0);
                        c.moveTo(ox, oy + d1);
                        c.lineTo(ox + cellSize, oy + d1);
                        break;
                }
            }
        }
    }

    return c.getPaths();
}

async function renderAndSave(solutionPaths: Segment[][] | undefined, wallPaths: Segment[][],
                             canvasType: 'pdf' | 'svg' | undefined, filename: string,
                             renderOptions: RenderOptions) {

    let canvas: Canvas;
    let ctx: CanvasRenderingContext2D;
    if (canvasType === 'pdf' && renderOptions.paperSize !== PaperSize.FIT) {
        const width = renderOptions.imageWidth;
        const height = renderOptions.imageHeight;
        const { paperSize } = renderOptions;

        let w1 = paperSize.printableWidthDots;
        let s1 = w1 / width;
        let h1 = s1 * height;
        if (h1 > paperSize.printableHeightDots) {
            h1 = paperSize.printableHeightDots;
            s1 = h1 / height;
            w1 = s1 * width;
        }

        let w2 = paperSize.printableHeightDots;
        let s2 = w2 / width;
        let h2 = s2 * height;
        if (h2 > paperSize.printableWidthDots) {
            h2 = paperSize.printableWidthDots;
            s2 = h2 / height;
            w2 = s2 * width;
        }

        if (w1 >= w2) {
            canvas = createCanvas(paperSize.widthDots, paperSize.heightDots, 'pdf');
            ctx = canvas.getContext('2d');
            ctx.translate((paperSize.widthDots - w1) / 2, (paperSize.heightDots - h1) / 2);
            ctx.beginPath();
            ctx.rect(0, 0, w1, h1);
            ctx.clip();
            ctx.scale(s1, s1);
        } else {
            canvas = createCanvas(paperSize.heightDots, paperSize.widthDots, 'pdf');
            ctx = canvas.getContext('2d');
            ctx.translate((paperSize.heightDots - w2) / 2, (paperSize.widthDots - h2) / 2);
            ctx.beginPath();
            ctx.rect(0, 0, w2, h2);
            ctx.clip();
            ctx.scale(s2, s2);
        }
    } else {
        canvas = createCanvas(renderOptions.imageWidth, renderOptions.imageHeight, canvasType);
        ctx = canvas.getContext('2d');
    }

    ctx.lineWidth = renderOptions.lineWidthFrac * renderOptions.cellSize;
    ctx.lineCap = renderOptions.roundedCorners ? 'round' : 'square';

    let backgroundColor = renderOptions.backgroundColor;
    if (!backgroundColor) {
        backgroundColor = canvasType ? DEFAULT_SVG_AND_PDF_BACKGROUND_COLOR : DEFAULT_PNG_BACKGROUND_COLOR;
    }
    if (backgroundColor.alpha > 0) {
        ctx.fillStyle = backgroundColor.toStyle();
        ctx.fillRect(0, 0, renderOptions.imageWidth, renderOptions.imageHeight);
    }

    if (solutionPaths && renderOptions.solutionColor.alpha > 0) {
        ctx.strokeStyle = renderOptions.solutionColor.toStyle();
        renderPaths(ctx, solutionPaths, renderOptions.roundedCorners);
    }

    if (renderOptions.wallColor.alpha > 0) {
        ctx.strokeStyle = renderOptions.wallColor.toStyle();
        renderPaths(ctx, wallPaths, renderOptions.roundedCorners);
    }

    await fs.writeFile(filename, canvas.toBuffer());
}

export async function saveMaze(maze: Maze, renderOptions: RenderOptions) {
    const cellMarginFrac = (1 - renderOptions.passageWidthFrac) / 2;
    const solutionPaths: Segment[][] | undefined = renderOptions.solution
            ? generateSolutionPaths(maze, renderOptions.cellSize, cellMarginFrac) : undefined;
    const wallPaths = generateWallPaths(maze, renderOptions.cellSize, cellMarginFrac);
    const timestamp = getTimestamp();

    for (const extension of toFileExtensions(renderOptions.fileFormat)) {
        const canvasType = (extension === 'png') ? undefined : (extension as 'pdf' | 'svg');
        for (const solution of renderOptions.solution ? [ false, true ] : [ false ]) {
            let filename = renderOptions.outputDirectory + path.sep + renderOptions.filenamePrefix;
            if (solution) {
                filename += '-' + renderOptions.filenameSuffix;
            }
            if (renderOptions.timestamp) {
                filename += '-' + timestamp;
            }
            filename += '.' + extension;
            await renderAndSave(solution ? solutionPaths : undefined, wallPaths, canvasType, filename, renderOptions);
        }
    }
}