import sharp from 'sharp';
import { Maze } from '@/Maze';
import { createCanvas } from 'canvas';

const TILE_SIZE = 40;
const HALF_TILE_SIZE = TILE_SIZE >> 1;
const WHITE = 255;
const BLACK = 0;

const THICKNESS_FRAC = 0.15;
const WALL_FRAC = 0.15;

export async function saveImage(maze: Maze, filename: string) {

    const width = TILE_SIZE * maze.width;
    const height = TILE_SIZE * maze.height;

    const d0 = WALL_FRAC * TILE_SIZE;
    const d1 = (1 - WALL_FRAC) * TILE_SIZE;
    const dm = TILE_SIZE / 2;
    const r0 = (d1 - d0) / 2;

    const canvas = createCanvas(width, height);
    const c = canvas.getContext('2d');

    c.fillStyle = 'white';
    c.fillRect(0, 0, width, height);

    c.strokeStyle = 'black';
    c.lineWidth = THICKNESS_FRAC * TILE_SIZE;
    c.lineCap = 'round';

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

                c.beginPath();
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

            c.stroke();
        }
    }

    await sharp(canvas.toBuffer('image/png')).toFile(filename);
}

export async function saveImageSquare(maze: Maze, filename: string) {

    const width = TILE_SIZE * maze.width;
    const height = TILE_SIZE * maze.height;

    const d0 = WALL_FRAC * TILE_SIZE;
    const d1 = (1 - WALL_FRAC) * TILE_SIZE;

    const canvas = createCanvas(width, height);
    const c = canvas.getContext('2d');

    c.fillStyle = 'white';
    c.fillRect(0, 0, width, height);

    c.strokeStyle = 'black';
    c.lineWidth = THICKNESS_FRAC * TILE_SIZE;
    c.lineCap = 'square';

    for (let i = maze.height - 1; i >= 0; --i) {
        const oy = i * TILE_SIZE;
        for (let j = maze.width - 1; j >= 0; --j) {
            const ox = j * TILE_SIZE;
            const tile = maze.tiles[i][j];

            c.beginPath();

            if (tile.lower.north || tile.upper.north) {
                c.moveTo(ox + d0, oy);
                c.lineTo(ox + d0, oy + d0);
                c.moveTo(ox + d1, oy);
                c.lineTo(ox + d1, oy + d0);
            } else {
                c.moveTo(ox + d0, oy + d0);
                c.lineTo(ox + d1, oy + d0);
            }

            if (tile.lower.east || tile.upper.east) {
                c.moveTo(ox + d1, oy + d0);
                c.lineTo(ox + TILE_SIZE, oy + d0);
                c.moveTo(ox + d1, oy + d1);
                c.lineTo(ox + TILE_SIZE, oy + d1);
            } else {
                c.moveTo(ox + d1, oy + d0);
                c.lineTo(ox + d1, oy + d1);
            }

            if (tile.lower.south || tile.upper.south) {
                c.moveTo(ox + d0, oy + d1);
                c.lineTo(ox + d0, oy + TILE_SIZE);
                c.moveTo(ox + d1, oy + d1);
                c.lineTo(ox + d1, oy + TILE_SIZE);
            } else {
                c.moveTo(ox + d0, oy + d1);
                c.lineTo(ox + d1, oy + d1);
            }

            if (tile.lower.west || tile.upper.west) {
                c.moveTo(ox, oy + d0);
                c.lineTo(ox + d0, oy + d0);
                c.moveTo(ox, oy + d1);
                c.lineTo(ox + d0, oy + d1);
            } else {
                c.moveTo(ox + d0, oy + d0);
                c.lineTo(ox + d0, oy + d1);
            }

            if (tile.upper.north) {
                c.moveTo(ox + d1, oy + d0);
                c.lineTo(ox + d1, oy + d1);
                c.moveTo(ox + d0, oy + d0);
                c.lineTo(ox + d0, oy + d1);
            } else if (tile.upper.east) {
                c.moveTo(ox + d0, oy + d0);
                c.lineTo(ox + d1, oy + d0);
                c.moveTo(ox + d0, oy + d1);
                c.lineTo(ox + d1, oy + d1);
            }

            c.stroke();
        }
    }

    await sharp(canvas.toBuffer('image/png')).toFile(filename);
}

export async function saveImageOld(maze: Maze, filename: string) {

    const width = TILE_SIZE * maze.width;
    const height = TILE_SIZE * maze.height;
    const data = new Uint8Array(width * height).fill(WHITE);

    function setPixel(x: number, y: number, value: number) {
        data[width * y + x] = value;
    }

    for (let i = maze.height - 1; i >= 0; --i) {
        const oy = i * TILE_SIZE;
        for (let j = maze.width - 1; j >= 0; --j) {
            const ox = j * TILE_SIZE;
            const tile = maze.tiles[i][j];

            if (tile.lower.north || tile.upper.north) {
                for (let k = HALF_TILE_SIZE; k >= 0; --k) {
                    setPixel(ox + HALF_TILE_SIZE, oy + k, BLACK);
                }
            }
            if (tile.lower.east || tile.upper.east) {
                for (let k = HALF_TILE_SIZE - 1; k >= 0; --k) {
                    setPixel(ox + HALF_TILE_SIZE + k, oy + HALF_TILE_SIZE, BLACK);
                }
            }
            if (tile.lower.south || tile.upper.south) {
                for (let k = HALF_TILE_SIZE - 1; k >= 0; --k) {
                    setPixel(ox + HALF_TILE_SIZE, oy + HALF_TILE_SIZE + k, BLACK);
                }
            }
            if (tile.lower.west || tile.upper.west) {
                for (let k = HALF_TILE_SIZE; k >= 0; --k) {
                    setPixel(ox + k, oy + HALF_TILE_SIZE, BLACK);
                }
            }

            if (tile.upper.north) {
                setPixel(ox + HALF_TILE_SIZE + 1, oy + HALF_TILE_SIZE, WHITE);
                setPixel(ox + HALF_TILE_SIZE - 1, oy + HALF_TILE_SIZE, WHITE);
            } else if (tile.upper.east) {
                setPixel(ox + HALF_TILE_SIZE, oy + HALF_TILE_SIZE + 1, WHITE);
                setPixel(ox + HALF_TILE_SIZE, oy + HALF_TILE_SIZE - 1, WHITE);
            }
        }
    }

    await sharp(data, {
        raw: {
            channels: 1,
            width,
            height,
        }
    }).toFile(filename);
}