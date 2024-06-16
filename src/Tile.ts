import { TileType } from '@/TileType';
import { NodeState } from '@/NodeState';

export class Tile {
    north = false;
    east = false;
    south = false;
    west = false;
    tileType = TileType.FLAT;
    nodeStates = [ NodeState.UNVISITED ];

    constructor(public x: number, public y: number) {
    }
}