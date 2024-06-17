import { saveImage } from '@/maze-renderer';
import { generateMaze } from '@/maze-generator';

async function main() {
    //await saveImage(generateMaze(20, 20, 0.3), 'maze.png');
    await saveImage(generateMaze(20, 20, 0.3, false), 'maze.png');
}

void main();