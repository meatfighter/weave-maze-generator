import { saveImage } from '@/maze-renderer';
import { generateMaze } from '@/maze-generator';

// TODO
// - Loop fraction: Add loops just like crosses are added
// - Terminal placement: north, east, south, west, and 0 -- 1
// - Find a way to go between short and long corridors (0 -- 1)
// - Render to bitmap, svg, and pdf
// - Make render paths as long as possible by chaining elements
// - Solution path
// - Color options

async function main() {
    //await saveImage(generateMaze(20, 20, 0.3), 'maze.png');
    await saveImage(generateMaze(30, 30, 0.05, 0.3, false), 'maze.png');
}

void main();