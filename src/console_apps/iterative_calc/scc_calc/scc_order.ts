import { IGraph } from '../../../ai_lib/structures/igraph';
import { DiGraphT } from '../../../ai_lib/structures/graphT';
import { DirectedCycle } from '../../../ai_lib/algorithms/graph/directed_cycle';
import { TopoSort } from '../../../ai_lib/algorithms/graph/toposort';

/** Finds a topological order of a SCC by removing edges until the SCC no longer contains a cycle */
export class SccOrder {

    // topological order of the scc, once all cycles are removed
    private _order: number[];

    /**
     * @param _graph graph that contains one or more sccs
     * @param scc_nodes the node indexes of a single scc
     */
    constructor(private _graph: IGraph, private _scc_nodes: number[]) {
        if (_scc_nodes.length === 0) {
            throw new Error('scc nodes must not be emtpy');
        }

        for (const n of _scc_nodes) {
            const max_idx = _graph.num_nodes() - 1;
            if (n < 0 || n > max_idx) {
                throw new Error(`invalid idx in scc nodes: ${n}`);
            }
        }

        // use typed digraph, where each node is the index of the node in the original graph
        const scc_subgraph = new DiGraphT<number>();
        _scc_nodes.forEach(n => scc_subgraph.add_node(n));

        // add edges only between nodes in the SCC
        const scc_nodes_set = new Set(_scc_nodes);
        for (const scc_node of _scc_nodes) {
            const scc_adj =
                // adjacent node indexes
                _graph.adjacent(scc_node).map(e => e.other(scc_node))
                // where adjacent is in the scc
                .filter(adj => scc_nodes_set.has(adj));
            for (const adj of scc_adj) {
                scc_subgraph.add_edgeT(scc_node, adj);
            }
        }

        this._order = this.calculateOrder(scc_subgraph).map(i => _scc_nodes[i]);
    }

    public order(): number[] {
        return this._order;
    }

    // determine a topological order of the given graph, by removing edges in cycles
    // until no cycles remain
    private calculateOrder(graph: IGraph): number[] {
        let finder = new DirectedCycle(graph);
        while (finder.hasCycle()) {
            const cycle = finder.getCycle();
            // remove any edge in the cycle
            graph.remove_edge(cycle[0], cycle[1]);
            finder = new DirectedCycle(graph);
        }
        const topo = new TopoSort(graph);
        return Array.from(topo.order());
    }
}
