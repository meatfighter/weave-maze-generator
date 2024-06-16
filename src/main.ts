import { saveImage } from '@/maze-renderer';
import { generateMaze } from '@/maze-generator';

async function main() {
    await saveImage(generateMaze(20, 20, 0.5), 'maze.png');
}

void main();