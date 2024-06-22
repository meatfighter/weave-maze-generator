import { promises as fs } from 'fs'; // TODO REMOVE
import { createCanvas, ImageData, loadImage } from 'canvas';
import { Cell } from '@/mask/Cell';

function mergeRegions(cells: Cell[][], width: number, height: number, cell: Cell, c: Cell) {
    let sourceRegion: number;
    let targetRegion: number;
    if (cell.region > c.region) {
        sourceRegion = cell.region;
        targetRegion = c.region;
    } else {
        sourceRegion = c.region;
        targetRegion = cell.region;
    }
    for (let y = height - 1; y >= 0; --y) {
        for (let x = width - 1; x >= 0; --x) {
            const cell = cells[y][x];
            if (cell.region === sourceRegion) {
                cell.region = targetRegion;
            }
        }
    }

    while (cell.visitedBy && !cell.white) {
        cell.white = true;
        cell = cell.visitedBy;
    }
    while (c.visitedBy && !c.white) {
        c.white = true;
        c = c.visitedBy;
    }
}

function enqueue(cells: Cell[][], queue: Cell[], cell: Cell, x: number, y: number) {
    const c = cells[y][x];
    if (!(c.white || c.visitedBy)) {
        c.visitedBy = cell;
        c.region = cell.region;
        queue.push(c);
    }
}

function merge(cells: Cell[][], width: number, height: number, queue: Cell[], cell: Cell, x: number, y: number) {
    const c = cells[y][x];
    if (c.visitedBy || c.white) {
        if (c.region !== cell.region) {
            mergeRegions(cells, width, height, cell, c);
        }
    } else {
        c.visitedBy = cell;
        c.region = cell.region;
        queue.push(c);
    }
}

function joinRegions(cells: Cell[][], width: number, height: number) {
    const queue: Cell[] = [];
    for (let y = height - 1; y >= 0; --y) {
        for (let x = width - 1; x >= 0; --x) {
            const cell = cells[y][x];
            if (cell.white) {
                if (cell.y > 0) {
                    enqueue(cells, queue, cell, cell.x, cell.y - 1);
                }
                if (cell.x < width - 1) {
                    enqueue(cells, queue, cell, cell.x + 1, cell.y);
                }
                if (cell.y < height - 1) {
                    enqueue(cells, queue, cell, cell.x, cell.y + 1);
                }
                if (cell.x > 0) {
                    enqueue(cells, queue, cell, cell.x - 1, cell.y);
                }
            }
        }
    }

    while (true) {
        const cell = queue.shift();
        if (!cell) {
            break;
        }
        if (cell.y > 0) {
            merge(cells, width, height, queue, cell, cell.x, cell.y - 1);
        }
        if (cell.x < width - 1) {
            merge(cells, width, height, queue, cell, cell.x + 1, cell.y);
        }
        if (cell.y < height - 1) {
            merge(cells, width, height, queue, cell, cell.x, cell.y + 1);
        }
        if (cell.x > 0) {
            merge(cells, width, height, queue, cell, cell.x - 1, cell.y);
        }
    }
}

function pushRegion(cells: Cell[][], stack: Cell[], region: number, x: number, y: number) {
    const c = cells[y][x];
    if (c.white && c.region < 0) {
        c.region = region;
        stack.push(c);
    }
}

function fillRegion(cells: Cell[][], width: number, height: number, seed: Cell, region: number) {
    seed.region = region;
    const stack: Cell[] = [ seed ];
    while (true) {
        const cell = stack.pop();
        if (!cell) {
            break;
        }
        if (cell.y > 0) {
            pushRegion(cells, stack, region, cell.x, cell.y - 1);
        }
        if (cell.x < width - 1) {
            pushRegion(cells, stack, region, cell.x + 1, cell.y);
        }
        if (cell.y < height - 1) {
            pushRegion(cells, stack, region, cell.x, cell.y + 1);
        }
        if (cell.x > 0) {
            pushRegion(cells, stack, region, cell.x - 1, cell.y);
        }
    }
}

function findRegions(cells: Cell[][], width: number, height: number) {
    let region = 0;
    for (let y = height - 1; y >= 0; --y) {
        for (let x = width - 1; x >= 0; --x) {
            const cell = cells[y][x];
            if (cell.white && cell.region < 0) {
                fillRegion(cells, width, height, cell, region++);
            }
        }
    }
}

function createCells(data: Uint8ClampedArray, width: number, height: number): Cell[][] {
    const stride = 4 * width;
    const cells = new Array<Cell[]>(height);
    for (let y = height - 1; y >= 0; --y) {
        cells[y] = new Array<Cell>(width);
        const yOffset = stride * y;
        for (let x = width - 1; x >= 0; --x) {
            cells[y][x] = new Cell(x, y);
            const i = yOffset + 4 * x;
            cells[y][x].white = data[i + 3] >= 128 && .299 * data[i] + .587 * data[i + 1] + .114 * data[i + 2] >= 128;
        }
    }
    return cells;
}

export async function loadMask(filename: string) {
    const image = await loadImage(filename);
    const { width, height } = image;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    const cells = createCells(ctx.getImageData(0, 0, canvas.width, canvas.height).data, width, height);
    findRegions(cells, width, height);
    joinRegions(cells, width, height);

    // TODO TESTING
    const data = new Uint8ClampedArray(4 * width * height);
    for (let y = 0, i = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x, i += 4) {
            data[i] = data[i + 1] = data[i + 2] = cells[y][x].white ? 255 : 0;
            data[i + 3] = 255;
        }
    }
    const imageData = new ImageData(data, width, height);
    ctx.putImageData(imageData, 0, 0);
    await fs.writeFile('test.png', canvas.toBuffer());
}