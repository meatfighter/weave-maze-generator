import { saveImage } from '@/maze-renderer';
import { generateMaze } from '@/maze-generator';

async function main() {
    await saveImage(generateMaze(10, 20, 0.2), 'maze.png');
}

void main();