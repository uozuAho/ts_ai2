import { IGraph, Edge } from '../../../ai_lib/structures/igraph';
import { DiGraph } from '../../../ai_lib/structures/graph';
import { TarjanSCC } from '../../../ai_lib/algorithms/graph/tarjan_scc';

export class SccGraph extends DiGraph {

    // map of scc node: source graph nodes
    private _sourceNodes: number[][];

    public constructor(graph: IGraph) {
        const scc = new TarjanSCC(graph);

        // build graph using sccs as nodes
        super(scc.count());

        for (const e of graph.get_edges()) {
            const sccFrom = scc.id(e.from), sccTo = scc.id(e.to);
            if (sccFrom !== sccTo) {
                this.add_edge(sccFrom, sccTo);
            }
        }

        // map scc nodes to original graph node(s)
        this._sourceNodes = Array(scc.count()).fill(null);
        for (let srcNode = 0; srcNode < graph.num_nodes(); srcNode++) {
            const sccIdx = scc.id(srcNode);
            if (this._sourceNodes[sccIdx] === null) {
                this._sourceNodes[sccIdx] = [srcNode];
            } else {
                this._sourceNodes[sccIdx].push(srcNode);
            }
        }
    }

    /** Get the nodes of the input graph that form the given scc node */
    public sourceNodes(n: number): number[] {
        return this._sourceNodes[n];
    }
}
