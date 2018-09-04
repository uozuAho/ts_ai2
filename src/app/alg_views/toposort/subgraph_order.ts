import { IGraph } from '../../../ai_lib/structures/igraph';
import { DirectedCycle } from '../../../ai_lib/algorithms/graph/directed_cycle';
import { DiGraph } from '../../../ai_lib/structures/graph';
import { TopoSort } from '../../../ai_lib/algorithms/graph/toposort';

export class SubgraphOrder {
    /** Return a topological order of the given subgraph, by incrementally removing edges
     *  in cycles then topo sorting */
    public static order(graph: IGraph, nodes: number[]): number[] {
        const subGraph = this.buildSccSubgraph(graph, nodes);
        const subGraphOrder = this.removeCyclesThenTopoSort(subGraph);
        return subGraphOrder.map(i => nodes[i]);
    }

    /** Build a subgraph of the given graph, containing only the given nodes and edges between them */
    private static buildSccSubgraph(graph: IGraph, nodes: number[]): DiGraph {
        const notInNodes = -1;
        // map original node numbers to subgraph node numbers
        const nodeMap = Array(graph.num_nodes()).fill(notInNodes);
        for (let i = 0; i < nodes.length; i++) {
            const source_node = nodes[i];
            nodeMap[source_node] = i;
        }
        const subGraph = new DiGraph(nodes.length);
        for (const node of nodes) {
            for (const adj of graph.adjacent(node)) {
                const subFrom = nodeMap[adj.from];
                const subTo = nodeMap[adj.to];
                if (subFrom !== notInNodes && subTo !== notInNodes) {
                    subGraph.add_edge(subFrom, subTo);
                }
            }
        }
        return subGraph;
    }

    /** Returns the topological sorting of the nodes in the given graph,
     *  after removing all cycles by removing cycle edges one by one.
     */
    private static removeCyclesThenTopoSort(graph: IGraph): number[] {
        let finder = new DirectedCycle(graph);
        while (finder.hasCycle()) {
            const cycle = finder.getCycle();
            // remove any edge in the cycle
            // todo: prove that this conserves the (total?) order of the nodes
            graph.remove_edge(cycle[0], cycle[1]);
            finder = new DirectedCycle(graph);
        }
        const topo = new TopoSort(graph);
        return Array.from(topo.order());
    }
}