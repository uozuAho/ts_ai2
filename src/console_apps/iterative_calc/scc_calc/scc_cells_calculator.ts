import { BaseCalculator, CellsCalculator, CalculationResults } from '../cells_calculator';
import { Cell, CellsGraph } from '../cell';
import { TopoSort } from '../../../ai_lib/algorithms/graph/toposort';
import { SccGraph } from './scc_graph';

/**
 * Calculates cells in an efficient order, even when the
 * cells contain dependency cycles (strongly connected components, hence SCC).
 */
export class SccCellsCalculator extends BaseCalculator implements CellsCalculator {

    public calculate(cells: Cell[]): CalculationResults {
        const cellsGraph = CellsGraph.create(cells);
        const sccGraph = new SccGraph(cellsGraph);
        const sccGraphOrder = new TopoSort(sccGraph).order();
        const results = <CalculationResults> {
            numCalculations: Array(cells.length).fill(0),
            calculationLimitReached: false,
            converged: true,
            totalCalculations: 0
        };
        for (const scc_idx of sccGraphOrder) {
            const source_idxs = sccGraph.sourceNodes(scc_idx);
            if (source_idxs.length === 1) {
                // scc graph node is a single source node, just calculate source value
                const source_idx = source_idxs[0];
                const source_cell = cells[source_idx];
                source_cell.calculate();
                results.numCalculations[source_idx]++;
                results.totalCalculations++;
            } else {
                // scc graph node contains multiple source nodes, calculate iteratively
                const source_cells = source_idxs.map(i => cells[i]);
                // just calculate in node order
                // todo: calculate in topo order after removing edges
                const sccResult = this.calculateInOrder(source_cells, [...Array(source_cells.length).keys()]);
                for (let i = 0; i < source_idxs.length; i++) {
                    const source_idx = source_idxs[i];
                    results.numCalculations[source_idx] = sccResult.numCalculations[i];
                }
                results.totalCalculations += sccResult.totalCalculations;
                if (!results.calculationLimitReached) {
                    results.calculationLimitReached = sccResult.calculationLimitReached;
                    results.converged = sccResult.converged;
                }
            }
        }
        return results;
    }
}
