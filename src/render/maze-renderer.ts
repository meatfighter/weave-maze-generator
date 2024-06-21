import { promises as fs } from 'fs';
import { Maze } from '@/Maze';
import { CanvasRenderingContext2D, createCanvas } from 'canvas';
import { PathOptimizer } from '@/render/PathOptimizer';
import { Segment } from '@/render/Segment';
import { Point } from '@/render/Point';
import { Line } from '@/render/Line';
import { Arc } from '@/render/Arc';
import { RenderOptions } from '@/render/RenderOptions';
import { FileType } from '@/render/FileType';
import { extractFilenameExtension } from '@/files';

function renderPaths(ctx: CanvasRenderingContext2D, paths: Segment[][], curved: boolean) {
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
                if (curved) {
                    ctx.arcTo(arc.p1.x, arc.p1.y, arc.p2.x, arc.p2.y, arc.radius);
                } else {
                    ctx.lineTo(arc.p1.x, arc.p1.y);
                    ctx.lineTo(arc.p2.x, arc.p2.y);
                }
                cursor = arc.p2;
            }
        });
    });
}

function renderSolution(c: PathOptimizer, maze: Maze, cellSize: number, cellMarginFrac: number) {
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
}

function renderMaze(ctx: CanvasRenderingContext2D, maze: Maze, cellSize: number, cellMarginFrac: number,
                    curved: boolean) {

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

    renderPaths(ctx, c.getPaths(), curved);
}

function toCanvasType(filename: string): 'pdf' | 'svg' | undefined {
    switch (extractFilenameExtension(filename)) {
        case 'pdf':
            return 'pdf';
        case 'svg':
            return 'svg';
        default:
            return undefined;
    }
}

export async function saveMaze(renderOptions: RenderOptions, maze: Maze) {

    let canvasWidth: number;
    let canvasHeight: number;
    let cellSize: number;
    if (renderOptions.cellSize > 0) {
        cellSize = renderOptions.cellSize;
        canvasWidth = cellSize * maze.width;
        canvasHeight = cellSize * maze.height;
    } else if (renderOptions.imageWidth > 0) {
        canvasWidth = renderOptions.imageWidth;
        cellSize = canvasWidth / maze.width;
        canvasHeight = cellSize * maze.height;
    } else if (renderOptions.imageHeight > 0) {
        canvasHeight = renderOptions.imageHeight;
        cellSize = canvasHeight / maze.height;
        canvasWidth = cellSize * maze.width;
    } else {
        throw new Error('cellSize, imageWidth, or imageHeight must be >= 0');
    }

    const canvas = createCanvas(canvasWidth, canvasHeight, toCanvasType(renderOptions.fileType));
    const ctx = canvas.getContext('2d');

    const b = renderOptions.backgroundColor;
    ctx.fillStyle = `rgba(${b.red}, ${b.green}, ${b.blue}, ${b.alpha})`;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.lineWidth = renderOptions.lineThicknessFrac * cellSize;
    ctx.lineCap = 'round';

    // if (solution && maze.solved) {
    //     renderSolution(c, maze, curved);
    // }
    renderMaze(ctx, maze, cellSize, renderOptions.cellMarginFrac, renderOptions.curved);

    await fs.writeFile(renderOptions.filename, canvas.toBuffer());
}