import { IGraph } from '../../../ai_lib/structures/igraph';
import { TopoSort } from '../../../ai_lib/algorithms/graph/toposort';
import { SubgraphOrder } from './subgraph_order';
import { SccGraph } from './scc_graph';

/** Get a ... good... order of nodes in a digraph that may contain cycles.
 *  If no cycles, order will be topological. If cycles, order will be topological
 *  order of SCCs, with order within SCCs determined by topological sort after
 *  removing all cycles.
 *
 *  Trying to do what I did with scc_cells_calculator, but just for visualisation
 *  instead of calculating cell values.
 */
export class CycleOrderer {

    /** Number of times to repeat nodes in sccs when returning entire node order */
    public sccIterations = 2;

    /** Topological order of the sccs as nodes */
    private _sccNodeOrder: number[];
    /** Topological order of nodes within each scc, after removing cycles */
    private _sccSubNodeOrders: number[][] = [];

    constructor(source_graph: IGraph) {
        // build a new graph from the source, where each node is a scc
        const sccGraph = new SccGraph(source_graph);
        // topological order of the scc graph
        this._sccNodeOrder = Array.from(new TopoSort(sccGraph).order());
        // find the order of each scc
        for (let i = 0; i < sccGraph.num_nodes(); i++) {
            const order = SubgraphOrder.order(source_graph, sccGraph.sourceNodes(i));
            this._sccSubNodeOrders[i] = order;
        }
    }

    public *order(): IterableIterator<number> {
        for (const sccNodeIdx of this._sccNodeOrder) {
            const thisSccOrder = this._sccSubNodeOrders[sccNodeIdx];
            if (thisSccOrder.length === 1) {
                yield thisSccOrder[0];
            } else {
                for (let iterCount = 0; iterCount < this.sccIterations; iterCount++) {
                    for (const n of this._sccSubNodeOrders[sccNodeIdx]) {
                        yield n;
                    }
                }
            }
        }
    }
}
