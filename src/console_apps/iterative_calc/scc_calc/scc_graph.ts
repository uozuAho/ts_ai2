import { IGraph, Edge } from '../../../ai_lib/structures/igraph';
import { DiGraph } from '../../../ai_lib/structures/graph';
import { TarjanSCC } from '../../../ai_lib/algorithms/graph/tarjan_scc';

export class SccGraph implements IGraph {

    // graph where each scc of the original graph is a single node
    private sccGraph: DiGraph;
    // map of scc node: source graph nodes
    private _sourceNodes: number[][] = [];

    public constructor(sourceGraph: IGraph) {
        const scc = new TarjanSCC(sourceGraph);
        const num_source_nodes = sourceGraph.num_nodes();
        this.sccGraph = new DiGraph(scc.count());
        for (let source_idx = 0; source_idx < num_source_nodes; source_idx++) {
            // map scc node idx to source node(s)
            const scc_idx = scc.id(source_idx);
            if (this._sourceNodes[scc_idx] === undefined) {
                this._sourceNodes[scc_idx] = [source_idx];
            } else {
                this._sourceNodes[scc_idx].push(source_idx);
            }
            // add edges between scc nodes
            const source_adjs = sourceGraph.adjacent(source_idx).map(e => e.other(source_idx));
            const scc_adjs = new Set(source_adjs.map(a => scc.id(a)));
            for (const scc_adj of scc_adjs) {
                // don't add self loops to scc graph
                if (scc_idx === scc_adj) { continue; }
                this.sccGraph.add_edge(scc_idx, scc_adj);
            }
        }
    }

    public sourceNodes(n: number): number[] {
        return this._sourceNodes[n];
    }

    // IGraph interface
    public num_nodes(): number { return this.sccGraph.num_nodes(); }
    public num_edges(): number { return this.sccGraph.num_edges(); }
    public get_edges(): Edge[] { return this.sccGraph.get_edges(); }
    public adjacent(n: number): Edge[] { return this.sccGraph.adjacent(n); }
    public degree(n: number): number { return this.sccGraph.degree(n); }
    public add_edge(p: number, q: number, weight: number): void {
        this.sccGraph.add_edge(p, q, weight);
    }
    public remove_edge(from: number, to: number) {
        this.sccGraph.remove_edge(from, to);
    }
}
