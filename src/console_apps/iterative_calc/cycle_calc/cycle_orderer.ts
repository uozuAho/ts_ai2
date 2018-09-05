import { IGraph } from '../../../ai_lib/structures/igraph';
import { DirectedCycle } from '../../../ai_lib/algorithms/graph/directed_cycle';
import { TopoSort } from '../../../ai_lib/algorithms/graph/toposort';

/** Returns a topological order obtained by removing edges until the graph is a DAG.
 *  NOTE: modifies the passed graph
*/
export class CycleOrderer {

    public order: number[];

    constructor(graph: IGraph) {
        let finder = new DirectedCycle(graph);
        while (finder.hasCycle()) {
            const cycle = finder.getCycle();
            // remove any edge in the cycle
            graph.remove_edge(cycle[0], cycle[1]);
            finder = new DirectedCycle(graph);
        }
        const topo = new TopoSort(graph);
        this.order = Array.from(topo.order());
    }
}
