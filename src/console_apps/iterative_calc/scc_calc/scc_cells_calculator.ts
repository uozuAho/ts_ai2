import { BaseCalculator, CellsCalculator, CalculationResults } from '../cells_calculator';
import { Cell, CellsGraph } from '../cell';
import { TarjanSCC } from '../../../ai_lib/algorithms/graph/tarjan_scc';
import { IGraph } from '../../../ai_lib/structures/igraph';
import { DiGraph } from '../../../ai_lib/structures/graph';

/**
 * Calculates cells in an efficient order, even when the
 * cells contain dependency cycles (strongly connected components, hence SCC).
 */
export class SccCellsCalculator extends BaseCalculator implements CellsCalculator {

    calculate(cells: Cell[]): CalculationResults {
        const graph = CellsGraph.create(cells);
        const scc = new TarjanSCC(graph);
        // todo
        // - build graph with each scc as node
        const sccGraph = this.createSccGraph(graph, scc);
        // - get topo order of scc graph
        // - get topo order of each scc by edge cutting
        // - calc in scc graph topo order, following scc topo order when reaching an scc
        return <CalculationResults> {
            numCalculations: [],
            calculationLimitReached: true,
            converged: false,
            totalCalculations: 1
        };
    }

    private createSccGraph(graph: IGraph, scc: TarjanSCC): IGraph {
        const num_nodes = scc.count();
        const sccGraph = new DiGraph(num_nodes);
        for (let n = 0; n < num_nodes; n++) {
            // adjacents in original graph
            const adj = graph.adjacent(n).map(e => e.other(n));
            // find unique adjacents in scc graph
            const scc_adj = new Set(adj.map(a => scc.id(a)));
            for (const a of scc_adj) {
                sccGraph.add_edge(n, a);
            }
        }
        return sccGraph;
    }
}
