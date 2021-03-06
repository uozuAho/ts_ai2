import { IGraph } from '../../../ai_lib/structures/igraph';
import { MetaNode } from './meta_node';
import { DirectedCycle } from '../../../ai_lib/algorithms/graph/directed_cycle';
import { Assert } from '../../../libs/assert/Assert';
import { DiGraph } from '../../../ai_lib/structures/graph';

/** Represents a DAG of any directed graph, where cycles have been converted
 *  to 'meta nodes', which house all nodes in the cycle. Note that edges
 *  within cycles are not conserved.
 */
export class MetaDag {

    /** MetaNode graph */
    public graph: IGraph;
    /** MetaNodes - either a node from the original graph, or a set of strongly connected nodes */
    public nodes: MetaNode[];

    /** Convert a directed graph to a DAG by extracting all cycles to MetaNodes */
    constructor(graph: IGraph) {
        let tempGraph = graph;
        let oldNodes = this.createMetaNodes(graph.num_nodes());
        let tempNodes = this.createMetaNodes(graph.num_nodes());
        let finder = new DirectedCycle(graph);

        let loopCounter = 0;
        while (finder.hasCycle()) {
            if (loopCounter++ > 1000) {
                console.log(`num nodes: ${graph.num_nodes()}`);
                console.log(`edges:`);
                for (const e of graph.get_edges()) {
                    console.log(`${e.from}, ${e.to}`);
                }
                throw new Error('Cycle exists after 1000 edge cuts - this is probably wrong');
            }
            const cycle = new Set(finder.getCycle());
            tempNodes = this.replaceCycleWithMetaNode(tempGraph, oldNodes, cycle);

            Assert.isTrue(tempNodes.length === oldNodes.length - cycle.size + 1,
                'number of nodes should be reduced by number of nodes in cycle, +1 for added meta node');

            tempGraph = MetaDag.rebuildGraph(graph, oldNodes, tempNodes);
            oldNodes = tempNodes;
            finder = new DirectedCycle(tempGraph);
        }

        this.graph = tempGraph;
        this.nodes = tempNodes;
    }

    private createMetaNodes(n: number): MetaNode[] {
        const nodes: MetaNode[] = [];
        for (let i = 0; i < n; i++) {
            nodes.push(new MetaNode(false, i, null));
        }
        return nodes;
    }

    /** create new MetaNode array: [{nodes not in cycle}, MetaNode(nodes in cycle)] */
    private replaceCycleWithMetaNode(graph: IGraph, nodes: MetaNode[], cycle: Set<number>): MetaNode[] {
        // extract all nodes (not meta nodes) in the cycle into a new MetaNode
        let cycleNodes: number[] = [];
        for (const idx of cycle) {
            const node = nodes[idx];
            if (node.isSet) {
                cycleNodes = cycleNodes.concat(node.nodes);
            } else {
                cycleNodes.push(node.node);
            }
        }
        const newMeta = MetaNode.fromNodes(cycleNodes);
        return nodes.filter((n, idx) => !cycle.has(idx)).concat(newMeta);
    }

    /** Rebuild a graph whose nodes have changed. Nodes may have been moved and/or
     *  grouped into single node sets. Edges within node sets are not replaced, however
     *  edges to/from sets are maintained.
     * @param graph:    The old graph
     * @param oldNodes: The nodes corresponding to the old graph
     * @param newNodes: The new nodes.
     */
    public static rebuildGraph(graph: IGraph, oldNodes: MetaNode[], newNodes: MetaNode[]) {
        // map of new nodes to array indexes
        const newIdxMap = new Map<MetaNode, number>();
        newNodes.forEach((node, idx) => newIdxMap.set(node, idx));

        // create new graph with new meta nodes
        const newGraph = new DiGraph(newNodes.length);
        // map old edges to new edges
        for (const oldEdge of graph.get_edges()) {
            const oldNodeFrom = oldNodes[oldEdge.from];
            const oldNodeTo = oldNodes[oldEdge.to];
            if (!newIdxMap.has(oldNodeFrom) && !newIdxMap.has(oldNodeTo)) {
                // both 'from' and 'to' nodes are in the cycle (thus not in the new node set)
                // ignore self loops to the cycle
                continue;
            }
            // Find the index of the old nodes in the new set.
            // If they're not in the new set, they're part of the cycle.
            const getIdx = (node: MetaNode) => {
                const idx = newIdxMap.get(node);
                return idx === undefined ? newNodes.length - 1 : idx;
            };
            const fromIdx = getIdx(oldNodeFrom);
            const toIdx = getIdx(oldNodeTo);
            newGraph.add_edge(fromIdx, toIdx);
        }
        return newGraph;
    }
}
