import { DiGraphT } from '../../ai_lib/structures/graphT';
import { DirectedCycle } from '../../ai_lib/algorithms/graph/directed_cycle';

export class Cell {
    constructor(
        public label: string,
        public value = 0,
        public dependsOn: Cell[] = [],
        public calculateValue: () => number = null) {}

    public calculate(): number {
        if (this.calculateValue !== null) {
            this.value = this.calculateValue();
        }
        return this.value;
    }
}

export class CellsGraph {
    public static create(cells: Cell[]): DiGraphT<Cell> {
        const graph = new DiGraphT<Cell>();
        for (const cell of cells) {
            graph.add_node(cell);
        }
        for (const cell of cells) {
            for (const adj of cell.dependsOn) {
                graph.add_edgeT(adj, cell);
            }
        }
        return graph;
    }

    public static containsCycle(graph: DiGraphT<Cell>): boolean {
        return new DirectedCycle(graph).hasCycle();
    }
}
