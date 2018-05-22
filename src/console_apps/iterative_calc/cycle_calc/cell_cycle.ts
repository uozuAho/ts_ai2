import { BaseCalculator, CalculationResults } from '../cells_calculator';
import { Cell } from '../cell';
import { CycleOrderer } from './cycle_orderer';
import { IGraph } from '../../../ai_lib/structures/igraph';
import { DiGraph } from '../../../ai_lib/structures/graph';

/** A set of cells that form a simple or non-simple cycle
 *  todo: (probably). Rename this to StrongComponent or similar:
 *  https://en.wikipedia.org/wiki/Strongly_connected_component
 */
export class CellCycle extends BaseCalculator {

    private _order: number[];

    constructor(
        public cells: Cell[],
        calcLimit: number,
        convergenceThreshold: number
    ) {
        super(calcLimit, convergenceThreshold);
        this._order = this.computeOrder();
    }

    public calculate(): CalculationResults {
        return this.calculateInOrder(this.cells, this._order);
    }

    /** Get the order to calculate cells in this cycle */
    private computeOrder(): number[] {
        const graph = this.createCellsGraph();
        return new CycleOrderer(graph).order;
    }

    /** Create a directed graph of this cycle's cells */
    private createCellsGraph(): IGraph {
        const graph = new DiGraph(this.cells.length);
        const cellIdxMap = new Map<Cell, number>();
        for (let i = 0; i < this.cells.length; i++) {
            cellIdxMap.set(this.cells[i], i);
        }
        for (const cell of this.cells) {
            for (const dep of cell.dependsOn) {
                if (cellIdxMap.has(dep)) {
                    const cellIdx = cellIdxMap.get(cell);
                    const depIdx = cellIdxMap.get(dep);
                    graph.add_edge(depIdx, cellIdx);
                }
            }
        }
        return graph;
    }
}
