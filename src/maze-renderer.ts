import sharp from 'sharp';
import { Maze } from '@/Maze';
import { EAST, LOWER, NORTH, SOUTH, UPPER, WEST } from '@/Constants';

const TILE_SIZE = 16;
const HALF_TILE_SIZE = TILE_SIZE >> 1;
const WHITE = 255;
const BLACK = 0;

export async function saveImage(maze: Maze, filename: string) {

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
                for (let k = HALF_TILE_SIZE - 1; k >= 0; --k) {
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
                for (let k = HALF_TILE_SIZE - 1; k >= 0; --k) {
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