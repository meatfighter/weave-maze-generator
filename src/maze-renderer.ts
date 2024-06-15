import sharp from 'sharp';
import { Maze } from '@/Maze';
import { TileType } from '@/TileType';

const TILE_SIZE = 16;
const HALF_TILE_SIZE = TILE_SIZE >> 1;
const WHITE = 255;
const BLACK = 0;

export async function createMazeImage(maze: Maze, filename: string) {

    const width = TILE_SIZE * maze.width;
    const height = TILE_SIZE * maze.height;
    const data = new Uint8Array(width * height).fill(WHITE);

    function setBlack(x: number, y: number) {
        data[width * y + x] = BLACK;
    }

    function setWhite(x: number, y: number) {
        data[width * y + x] = WHITE;
    }

    for (let i = maze.height - 1; i >= 0; --i) {
        const oy = i * TILE_SIZE;
        for (let j = maze.width - 1; j >= 0; --j) {
            const ox = j * TILE_SIZE;
            switch (maze.tiles[i][j].tileType) {
                case TileType.NORTH:
                    for (let k = HALF_TILE_SIZE - 1; k >= 0; --k) {
                        setBlack(ox + HALF_TILE_SIZE, oy + k);
                    }
                    break;
                case TileType.EAST:
                    for (let k = HALF_TILE_SIZE - 1; k >= 0; --k) {
                        setBlack(ox + HALF_TILE_SIZE + k, oy + HALF_TILE_SIZE);
                    }
                    break;
                case TileType.SOUTH:
                    for (let k = HALF_TILE_SIZE - 1; k >= 0; --k) {
                        setBlack(ox + HALF_TILE_SIZE, oy + HALF_TILE_SIZE + k);
                    }
                    break;
                case TileType.WEST:
                    for (let k = HALF_TILE_SIZE - 1; k >= 0; --k) {
                        setBlack(ox + k, oy + HALF_TILE_SIZE);
                    }
                    break;

                case TileType.NORTH_EAST:
                    for (let k = HALF_TILE_SIZE - 1; k >= 0; --k) {
                        setBlack(ox + HALF_TILE_SIZE, oy + k);
                        setBlack(ox + HALF_TILE_SIZE + k, oy + HALF_TILE_SIZE);
                    }
                    break;
                case TileType.NORTH_WEST:
                    for (let k = HALF_TILE_SIZE - 1; k >= 0; --k) {
                        setBlack(ox + HALF_TILE_SIZE, oy + k);
                        setBlack(ox + k, oy + HALF_TILE_SIZE);
                    }
                    break;
                case TileType.SOUTH_EAST:
                    for (let k = HALF_TILE_SIZE - 1; k >= 0; --k) {
                        setBlack(ox + HALF_TILE_SIZE, oy + HALF_TILE_SIZE + k);
                        setBlack(ox + HALF_TILE_SIZE + k, oy + HALF_TILE_SIZE);
                    }
                    break;
                case TileType.SOUTH_WEST:
                    for (let k = HALF_TILE_SIZE - 1; k >= 0; --k) {
                        setBlack(ox + HALF_TILE_SIZE, oy + HALF_TILE_SIZE + k);
                        setBlack(ox + k, oy + HALF_TILE_SIZE);
                    }
                    break;

                case TileType.NORTH_SOUTH_EAST:
                    for (let k = HALF_TILE_SIZE - 1; k >= 0; --k) {
                        setBlack(ox + HALF_TILE_SIZE, oy + k);
                        setBlack(ox + HALF_TILE_SIZE, oy + HALF_TILE_SIZE + k);
                        setBlack(ox + HALF_TILE_SIZE + k, oy + HALF_TILE_SIZE);
                    }
                    break;
                case TileType.NORTH_SOUTH_WEST:
                    for (let k = HALF_TILE_SIZE - 1; k >= 0; --k) {
                        setBlack(ox + HALF_TILE_SIZE, oy + k);
                        setBlack(ox + HALF_TILE_SIZE, oy + HALF_TILE_SIZE + k);
                        setBlack(ox + k, oy + HALF_TILE_SIZE);
                    }
                    break;
                case TileType.EAST_WEST_NORTH:
                    for (let k = HALF_TILE_SIZE - 1; k >= 0; --k) {
                        setBlack(ox + HALF_TILE_SIZE + k, oy + HALF_TILE_SIZE);
                        setBlack(ox + k, oy + HALF_TILE_SIZE);
                        setBlack(ox + HALF_TILE_SIZE, oy + k);
                    }
                    break;
                case TileType.EAST_WEST_SOUTH:
                    for (let k = HALF_TILE_SIZE - 1; k >= 0; --k) {
                        setBlack(ox + HALF_TILE_SIZE + k, oy + HALF_TILE_SIZE);
                        setBlack(ox + k, oy + HALF_TILE_SIZE);
                        setBlack(ox + HALF_TILE_SIZE, oy + HALF_TILE_SIZE + k);
                    }
                    break;

                case TileType.NORTH_SOUTH_EAST_WEST:
                    for (let k = HALF_TILE_SIZE - 1; k >= 0; --k) {
                        setBlack(ox + HALF_TILE_SIZE, oy + k);
                        setBlack(ox + HALF_TILE_SIZE, oy + HALF_TILE_SIZE + k);
                        setBlack(ox + HALF_TILE_SIZE + k, oy + HALF_TILE_SIZE);
                        setBlack(ox + k, oy + HALF_TILE_SIZE);
                    }
                    break;
                case TileType.NORTH_SOUTH_HOPS_EAST_WEST:
                    for (let k = HALF_TILE_SIZE - 1; k >= 0; --k) {
                        setBlack(ox + HALF_TILE_SIZE, oy + k);
                        setBlack(ox + HALF_TILE_SIZE, oy + HALF_TILE_SIZE + k);
                        setBlack(ox + HALF_TILE_SIZE + k, oy + HALF_TILE_SIZE);
                        setBlack(ox + k, oy + HALF_TILE_SIZE);
                    }
                    setWhite(ox + HALF_TILE_SIZE + 1, oy + HALF_TILE_SIZE);
                    setWhite(ox + HALF_TILE_SIZE - 1, oy + HALF_TILE_SIZE);
                    break;
                case TileType.EAST_WEST_HOPS_NORTH_SOUTH: {
                    for (let k = HALF_TILE_SIZE - 1; k >= 0; --k) {
                        setBlack(ox + HALF_TILE_SIZE, oy + k);
                        setBlack(ox + HALF_TILE_SIZE, oy + HALF_TILE_SIZE + k);
                        setBlack(ox + HALF_TILE_SIZE + k, oy + HALF_TILE_SIZE);
                        setBlack(ox + k, oy + HALF_TILE_SIZE);
                    }
                    setWhite(ox + HALF_TILE_SIZE, oy + HALF_TILE_SIZE + 1);
                    setWhite(ox + HALF_TILE_SIZE, oy + HALF_TILE_SIZE - 1);
                    break;
                }
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