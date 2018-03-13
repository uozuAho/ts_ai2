import { Edge, IGraph } from './igraph';

/** Weighted graph, uses numbers to represent nodes */
abstract class GraphBase {

    /** Number of nodes */
    protected _n: number;

    /** adjacency list */
    protected _adj: Edge[][];

    constructor(n: number = 0) {
        this._n = n;
        this._adj = [];
    }

    public num_nodes(): number {
        return this._n;
    }

    public set_num_nodes(n: number): void {
        this._n = n;
    }

    /** Get edges incident to the given node */
    public adjacent(n: number): Edge[] {
        this.validate_idx(n);
        const adj = this._adj[n];
        return adj === undefined ? [] : adj;
    }

    public degree(n: number): number {
        return this.adjacent(n).length;
    }

    /** Add edge from p to q */
    protected add_directed_edge(p: number, q: number, weight: number = 1): void {
        this.validate_idx(p);
        this.validate_idx(q);
        const edge = new Edge(p, q, weight);
        if (this._adj[p] === undefined) {
            this._adj[p] = [edge];
        } else {
            this._adj[p].push(edge);
        }
    }

    protected validate_idx(n: number): void {
        if (n < 0 || n >= this._n) { throw new Error('invalid index: ' + n); }
    }
}

/** Undirected weighted graph */
export class Graph extends GraphBase implements IGraph {

    /** Add an undirected edge from p to q. */
    public add_edge(p: number, q: number, weight: number = 1): void {
        this.add_directed_edge(p, q, weight);
        // add the return edge. Don't duplicate this yourself!!
        this.add_directed_edge(q, p, weight);
    }

    /** Return all undirected edges.
     *  cheers to princeton algs for this: https://algs4.cs.princeton.edu/43mst/EdgeWeightedGraph.java.html
     */
    public get_edges(): Edge[] {
        const edges: Edge[] = [];
        for (let v = 0; v < this._n; v++) {
            let self_loop = 0;
            for (const edge of this.adjacent(v)) {
                if (edge.other(v) > v) {
                    // Since each undirected edge consists of two directed edges, return one of each
                    edges.push(edge);
                } else if (edge.other(v) === v) {
                    if (self_loop % 2 === 0) { edges.push(edge); }
                    self_loop++;
                }
            }
        }
        return edges;
    }
}

/** Directed weighted graph */
export class DiGraph extends GraphBase implements IGraph {

    public add_edge(p: number, q: number, weight: number): void {
        this.add_directed_edge(p, q, weight);
    }

    public get_edges(): Edge[] {
        const edges: Edge[] = [];
        for (const adj of this._adj) {
            if (adj !== undefined) {
                edges.concat(adj);
            }
        }
        return edges;
    }
}
