import { UnionFind } from "./union_find";
import { Edge, IGraph } from "../../structures/igraph";
import { Graph } from "../../structures/graph";

/** Finds a minimum spanning tree (MST) (or forest) for graphs */
export class Mst implements IGraph {

    _edges: Edge[];
    _graph: IGraph;

    constructor(graph: IGraph) {
        this._edges = Mst._solve(graph);
        this._graph = Mst._to_graph(graph.num_nodes(), this._edges);
    }

    public num_nodes(): number {
        return this._graph.num_nodes();
    }

    public add_edge(p: number, q: number, weight: number): void {
        this._graph.add_edge(p, q, weight);
    }

    public get_edges(): Edge[] {
        return this._edges;
    }

    public adjacent(n: number): Edge[] {
        return this._graph.adjacent(n);
    }

    public degree(n: number): number {
        return this._graph.degree(n);
    }

    private static _to_graph(num_nodes: number, edges: Edge[]) {
        let graph = new Graph(num_nodes);
        for (const edge of edges) {
            graph.add_edge(edge.from, edge.to, edge.weight);
        }
        return graph;
    }

    /** Returns the edges of an MST (or forest) for the given graph. Uses the ALG-GROW algorithm
     * from ai book. Runs in O(E log E) time.
     * Looks pretty similar to Kruskal's algorithm (https://en.wikipedia.org/wiki/Kruskal%27s_algorithm),
     * which runs in O(E log E) time */
    private static _solve(graph: IGraph): Edge[] {
        let mst_edges: Edge[] = [];
        // sort the edges by ascending weight
        let sorted_edges = graph.get_edges().sort((a,b) => a.compare(b));
        let uf = new UnionFind(graph.num_nodes());
        for (const edge of sorted_edges) {
            if (!uf.connected(edge.from, edge.to)) {
                // add edge to mst if there's no path between edge endpoints
                mst_edges.push(edge);
                uf.union(edge.from, edge.to);
            }
        }
        return mst_edges;
    }
}