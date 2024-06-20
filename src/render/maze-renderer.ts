import sharp from 'sharp';
import { Maze } from '@/Maze';
import { CanvasRenderingContext2D, createCanvas } from 'canvas';
import { RenderingContext } from '@/render/RenderingContext';
import { Segment } from '@/render/Segment';
import { Point } from '@/render/Point';
import { Line } from '@/render/Line';
import { Arc } from '@/render/Arc';

const TILE_SIZE = 25;
const THICKNESS_FRAC = 0.15;
const WALL_FRAC = 0.15;

function renderPaths(c: CanvasRenderingContext2D, paths: Segment[][], curved: boolean) {
    c.beginPath();
    paths.forEach(ss => {
        let cursor = new Point();
        ss.forEach(s => {
            const p0 = s.getStart();
            if (!p0.equals(cursor)) {
                c.moveTo(p0.x, p0.y);
            }
            if (s.isLine()) {
                const line = s as Line;
                c.lineTo(line.p1.x, line.p1.y);
                cursor = line.p1;
            } else {
                const arc = s as Arc;
                if (curved) {
                    c.arcTo(arc.p1.x, arc.p1.y, arc.p2.x, arc.p2.y, arc.radius);
                } else {
                    c.lineTo(arc.p1.x, arc.p1.y);
                    c.lineTo(arc.p2.x, arc.p2.y);
                }
                cursor = arc.p2;
            }
        });
    });
    c.stroke();
}

function renderSolution(ctx: CanvasRenderingContext2D, maze: Maze, curved: boolean) {

    const c = new RenderingContext();

    const d0 = WALL_FRAC * TILE_SIZE;
    const d1 = (1 - WALL_FRAC) * TILE_SIZE;
    const dm = TILE_SIZE / 2;

    for (let i = maze.height - 1; i >= 0; --i) {
        const oy = i * TILE_SIZE;
        for (let j = maze.width - 1; j >= 0; --j) {
            const ox = j * TILE_SIZE;
            const tile = maze.tiles[i][j];

            if (tile.upper.north2) {
                c.moveTo(ox + dm, oy);
                c.lineTo(ox + dm, oy + TILE_SIZE);
            } else if (tile.upper.east2) {
                c.moveTo(ox, oy + dm);
                c.lineTo(ox + TILE_SIZE, oy + dm);
            }

            if (tile.upper.north && tile.lower.east2) {
                c.moveTo(ox, oy + dm);
                c.lineTo(ox + d0, oy + dm);
                c.moveTo(ox + d1, oy + dm);
                c.lineTo(ox + TILE_SIZE, oy + dm);
            } else if (tile.upper.east && tile.lower.north2) {
                c.moveTo(ox + dm, oy);
                c.lineTo(ox + dm, oy + d0);
                c.moveTo(ox + dm, oy + d1);
                c.lineTo(ox + dm, oy + TILE_SIZE);
            } else {
                const lower = tile.lower;
                const value = (lower.north2 ? 0b1000 : 0) | (lower.east2 ? 0b0100 : 0) | (lower.south2 ? 0b0010 : 0)
                    | (lower.west2 ? 0b0001 : 0);

                switch (value) {
                    case 0b1100:
                        c.moveTo(ox + dm, oy);
                        c.arcTo(ox + dm, oy + dm, ox + TILE_SIZE, oy + dm, dm);
                        break;
                    case 0b0110:
                        c.moveTo(ox + TILE_SIZE, oy + dm);
                        c.arcTo(ox + dm, oy + dm, ox + dm, oy + TILE_SIZE, dm);
                        break;
                    case 0b0011:
                        c.moveTo(ox + dm, oy + TILE_SIZE);
                        c.arcTo(ox + dm, oy + dm, ox, oy + dm, dm);
                        break;
                    case 0b1001:
                        c.moveTo(ox, oy + dm);
                        c.arcTo(ox + dm, oy + dm, ox + dm, oy, dm);
                        break;

                    case 0b1010:
                        c.moveTo(ox + dm, oy);
                        c.lineTo(ox + dm, oy + TILE_SIZE);
                        break;
                    case 0b0101:
                        c.moveTo(ox, oy + dm);
                        c.lineTo(ox + TILE_SIZE, oy + dm);
                        break;
                }
            }
        }
    }

    ctx.strokeStyle = 'red';
    ctx.lineWidth = THICKNESS_FRAC * TILE_SIZE;
    ctx.lineCap = 'round';

    renderPaths(ctx, c.getPaths(), curved);
}

function renderMaze(ctx: CanvasRenderingContext2D, maze: Maze, curved: boolean) {

    const c = new RenderingContext();

    const d0 = WALL_FRAC * TILE_SIZE;
    const d1 = (1 - WALL_FRAC) * TILE_SIZE;
    const dm = TILE_SIZE / 2;
    const r0 = (d1 - d0) / 2;

    for (let i = maze.height - 1; i >= 0; --i) {
        const oy = i * TILE_SIZE;
        for (let j = maze.width - 1; j >= 0; --j) {
            const ox = j * TILE_SIZE;
            const tile = maze.tiles[i][j];

            if (tile.upper.north) {
                c.moveTo(ox + d0, oy);
                c.lineTo(ox + d0, oy + TILE_SIZE);
                c.moveTo(ox + d1, oy);
                c.lineTo(ox + d1, oy + TILE_SIZE);
                c.moveTo(ox, oy + d0);
                c.lineTo(ox + d0, oy + d0);
                c.moveTo(ox, oy + d1);
                c.lineTo(ox + d0, oy + d1);
                c.moveTo(ox + d1, oy + d0);
                c.lineTo(ox + TILE_SIZE, oy + d0);
                c.moveTo(ox + d1, oy + d1);
                c.lineTo(ox + TILE_SIZE, oy + d1);
            } else if (tile.upper.east) {
                c.moveTo(ox, oy + d0);
                c.lineTo(ox + TILE_SIZE, oy + d0);
                c.moveTo(ox, oy + d1);
                c.lineTo(ox + TILE_SIZE, oy + d1);
                c.moveTo(ox + d0, oy);
                c.lineTo(ox + d0, oy + d0);
                c.moveTo(ox + d1, oy);
                c.lineTo(ox + d1, oy + d0);
                c.moveTo(ox + d0, oy + d1);
                c.lineTo(ox + d0, oy + TILE_SIZE);
                c.moveTo(ox + d1, oy + d1);
                c.lineTo(ox + d1, oy + TILE_SIZE);
            } else {
                const lower = tile.lower;
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
                        c.moveTo(ox + TILE_SIZE, oy + d0);
                        c.lineTo(ox + dm, oy + d0);
                        c.arcTo(ox + d0, oy + d0, ox + d0, oy + dm, r0);
                        c.arcTo(ox + d0, oy + d1, ox + dm, oy + d1, r0);
                        c.lineTo(ox + TILE_SIZE, oy + d1);
                        break;
                    case 0b0010:
                        c.moveTo(ox + d0, oy + TILE_SIZE);
                        c.lineTo(ox + d0, oy + dm);
                        c.arcTo(ox + d0, oy + d0, ox + dm, oy + d0, r0);
                        c.arcTo(ox + d1, oy + d0, ox + d1, oy + dm, r0);
                        c.lineTo(ox + d1, oy + TILE_SIZE);
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
                        c.arcTo(ox + d0, oy + d1, ox + TILE_SIZE, oy + d1, d1);
                        c.moveTo(ox + d1, oy);
                        c.arcTo(ox + d1, oy + d0, ox + TILE_SIZE, oy + d0, d0);
                        break;
                    case 0b0110:
                        c.moveTo(ox + d0, oy + TILE_SIZE);
                        c.arcTo(ox + d0, oy + d0, ox + TILE_SIZE, oy + d0, d1);
                        c.moveTo(ox + d1, oy + TILE_SIZE);
                        c.arcTo(ox + d1, oy + d1, ox + TILE_SIZE, oy + d1, d0);
                        break;
                    case 0b0011:
                        c.moveTo(ox + d1, oy + TILE_SIZE);
                        c.arcTo(ox + d1, oy + d0, ox, oy + d0, d1);
                        c.moveTo(ox + d0, oy + TILE_SIZE);
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
                        c.lineTo(ox + TILE_SIZE, oy + d1);
                        c.moveTo(ox + d1, oy);
                        c.arcTo(ox + d1, oy + d0, ox + TILE_SIZE, oy + d0, d0);
                        c.moveTo(ox + d0, oy);
                        c.arcTo(ox + d0, oy + d0, ox, oy + d0, d0);
                        break;
                    case 0b1110:
                        c.moveTo(ox + d0, oy);
                        c.lineTo(ox + d0, oy + TILE_SIZE);
                        c.moveTo(ox + d1, oy);
                        c.arcTo(ox + d1, oy + d0, ox + TILE_SIZE, oy + d0, d0);
                        c.moveTo(ox + d1, oy + TILE_SIZE);
                        c.arcTo(ox + d1, oy + d1, ox + TILE_SIZE, oy + d1, d0);
                        break;
                    case 0b0111:
                        c.moveTo(ox, oy + d0);
                        c.lineTo(ox + TILE_SIZE, oy + d0);
                        c.moveTo(ox + d1, oy + TILE_SIZE);
                        c.arcTo(ox + d1, oy + d1, ox + TILE_SIZE, oy + d1, d0);
                        c.moveTo(ox + d0, oy + TILE_SIZE);
                        c.arcTo(ox + d0, oy + d1, ox, oy + d1, d0);
                        break;
                    case 0b1011:
                        c.moveTo(ox + d1, oy);
                        c.lineTo(ox + d1, oy + TILE_SIZE);
                        c.moveTo(ox + d0, oy + TILE_SIZE);
                        c.arcTo(ox + d0, oy + d1, ox, oy + d1, d0);
                        c.moveTo(ox + d0, oy);
                        c.arcTo(ox + d0, oy + d0, ox, oy + d0, d0);
                        break;

                    case 0b1111:
                        c.moveTo(ox + d1, oy);
                        c.arcTo(ox + d1, oy + d0, ox + TILE_SIZE, oy + d0, d0);
                        c.moveTo(ox + d1, oy + TILE_SIZE);
                        c.arcTo(ox + d1, oy + d1, ox + TILE_SIZE, oy + d1, d0);
                        c.moveTo(ox + d0, oy + TILE_SIZE);
                        c.arcTo(ox + d0, oy + d1, ox, oy + d1, d0);
                        c.moveTo(ox + d0, oy);
                        c.arcTo(ox + d0, oy + d0, ox, oy + d0, d0);
                        break;

                    case 0b1010:
                        c.moveTo(ox + d0, oy);
                        c.lineTo(ox + d0, oy + TILE_SIZE);
                        c.moveTo(ox + d1, oy);
                        c.lineTo(ox + d1, oy + TILE_SIZE);
                        break;
                    case 0b0101:
                        c.moveTo(ox, oy + d0);
                        c.lineTo(ox + TILE_SIZE, oy + d0);
                        c.moveTo(ox, oy + d1);
                        c.lineTo(ox + TILE_SIZE, oy + d1);
                        break;
                }
            }
        }
    }

    ctx.strokeStyle = 'black';
    ctx.lineWidth = THICKNESS_FRAC * TILE_SIZE;
    ctx.lineCap = 'round';
    renderPaths(ctx, c.getPaths(), curved);
}

export async function saveImage(maze: Maze, curved: boolean, solution: boolean, filename: string) {

    const width = TILE_SIZE * maze.width;
    const height = TILE_SIZE * maze.height;

    const canvas = createCanvas(width, height);
    const c = canvas.getContext('2d');

    c.fillStyle = 'white';
    c.fillRect(0, 0, width, height);

    if (solution && maze.solved) {
        renderSolution(c, maze, curved);
    }
    renderMaze(c, maze, curved);

    await sharp(canvas.toBuffer('image/png')).toFile(filename);
}