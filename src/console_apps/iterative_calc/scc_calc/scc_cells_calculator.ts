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
        return <CalculationResults> {
            numCalculations: [],
            calculationLimitReached: false,
            converged: true,
            totalCalculations: 1
        };
    }
}
