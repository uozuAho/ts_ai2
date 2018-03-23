import { Edge } from '../../structures/igraph';
import { DiGraph } from '../../structures/graph';
import { IndexedPriorityQueue } from '../../structures/indexed_priority_queue';
import { Assert } from '../../../libs/assert/Assert';

/******************************************************************************
 *
 * Copied from https://algs4.cs.princeton.edu/code/edu/princeton/cs/algs4/DijkstraSP.java.html
 *
 * todo: make these unit tests:
 *
 *  % java DijkstraSP tinyEWD.txt 0
 *  0 to 0 (0.00)
 *  0 to 1 (1.05)  0->4  0.38   4->5  0.35   5->1  0.32
 *  0 to 2 (0.26)  0->2  0.26
 *  0 to 3 (0.99)  0->2  0.26   2->7  0.34   7->3  0.39
 *  0 to 4 (0.38)  0->4  0.38
 *  0 to 5 (0.73)  0->4  0.38   4->5  0.35
 *  0 to 6 (1.51)  0->2  0.26   2->7  0.34   7->3  0.39   3->6  0.52
 *  0 to 7 (0.60)  0->2  0.26   2->7  0.34
 *
 *  % java DijkstraSP mediumEWD.txt 0
 *  0 to 0 (0.00)
 *  0 to 1 (0.71)  0->44  0.06   44->93  0.07   ...  107->1  0.07
 *  0 to 2 (0.65)  0->44  0.06   44->231  0.10  ...  42->2  0.11
 *  0 to 3 (0.46)  0->97  0.08   97->248  0.09  ...  45->3  0.12
 *  0 to 4 (0.42)  0->44  0.06   44->93  0.07   ...  77->4  0.11
 *  ...
 *
 ******************************************************************************/

/**
 *  The {@code DijkstraSP} class represents a data type for solving the
 *  single-source shortest paths problem in edge-weighted digraphs
 *  where the edge weights are nonnegative.
 *  <p>
 *  This implementation uses Dijkstra's algorithm with a binary heap.
 *  The constructor takes time proportional to <em>E</em> log <em>V</em>,
 *  where <em>V</em> is the number of vertices and <em>E</em> is the number of edges.
 *  Each call to {@code distTo(int)} and {@code hasPathTo(int)} takes constant time;
 *  each call to {@code pathTo(int)} takes time proportional to the number of
 *  edges in the shortest path returned.
 *  <p>
 *  For additional documentation,
 *  see <a href="https://algs4.cs.princeton.edu/44sp">Section 4.4</a> of
 *  <i>Algorithms, 4th Edition</i> by Robert Sedgewick and Kevin Wayne.
 *
 *  @author Robert Sedgewick
 *  @author Kevin Wayne
 */

/**
 *  Dijkstra's algorithm. Computes the shortest path tree.
 *  Assumes all weights are nonnegative.
 */
export class DijkstraSP {
    private _distTo: number[];          // distTo[v] = distance  of shortest s->v path
    private _edgeTo: Edge[];    // edgeTo[v] = last edge on shortest s->v path
    private pq: IndexedPriorityQueue<number>;    // priority queue of vertices

    /**
     * Computes a shortest-paths tree from the source vertex {@code s} to every other
     * vertex in the edge-weighted digraph {@code G}.
     *
     * @param  G the edge-weighted digraph
     * @param  s the source vertex
     * @throws IllegalArgumentException if an edge weight is negative
     * @throws IllegalArgumentException unless {@code 0 <= s < V}
     */
    constructor (G: DiGraph, s: number) {
        for (const e of G.get_edges()) {
            if (e.weight < 0) {
                throw new Error(`edge (${e.from}, ${e.to}) has negative weight`);
            }
        }

        this._distTo = Array(G.num_nodes()).fill(0);
        this._edgeTo = Array(G.num_nodes()).fill(null);

        this.validateVertex(s);

        for (let v = 0; v < G.num_nodes(); v++) {
            this._distTo[v] = Number.MAX_VALUE;
        }
        this._distTo[s] = 0.0;

        // relax vertices in order of distance from s
        this.pq = new IndexedPriorityQueue<number>(G.num_nodes());
        this.pq.insert(s, this._distTo[s]);
        while (!this.pq.isEmpty()) {
            const v = this.pq.delMin();
            for (const edge of G.adjacent(v)) {
                this.relax(edge);
            }
        }

        this.throwIfInvalid(G, s);
    }

    // relax edge e and update pq if changed
    private relax(e: Edge) {
        const v = e.from, w = e.to;
        if (this._distTo[w] > this._distTo[v] + e.weight) {
            this._distTo[w] = this._distTo[v] + e.weight;
            this._edgeTo[w] = e;
            if (this.pq.contains(w)) { this.pq.decreaseKey(w, this._distTo[w]); }
            else                     { this.pq.insert(w, this._distTo[w]); }
        }
    }

    /**
     * Returns the length of a shortest path from the source vertex {@code s} to vertex {@code v}.
     * @param  v the destination vertex
     * @return the length of a shortest path from the source vertex {@code s} to vertex {@code v};
     *         {@code Number.MAX_VALUE} if no such path
     * @throws IllegalArgumentException unless {@code 0 <= v < V}
     */
    public distTo(v: number): number {
        this.validateVertex(v);
        return this._distTo[v];
    }

    /**
     * Returns true if there is a path from the source vertex {@code s} to vertex {@code v}.
     *
     * @param  v the destination vertex
     * @return {@code true} if there is a path from the source vertex
     *         {@code s} to vertex {@code v}; {@code false} otherwise
     * @throws IllegalArgumentException unless {@code 0 <= v < V}
     */
    public hasPathTo(v: number): boolean {
        this.validateVertex(v);
        return this._distTo[v] < Number.MAX_VALUE;
    }

    /**
     * Returns a shortest path from the source vertex {@code s} to vertex {@code v}.
     *
     * @param  v the destination vertex
     * @return a shortest path from the source vertex {@code s} to vertex {@code v}
     *         as an iterable of edges, and {@code null} if no such path
     * @throws IllegalArgumentException unless {@code 0 <= v < V}
     */
    public* pathTo(v: number): IterableIterator<Edge> {
        this.validateVertex(v);
        if (!this.hasPathTo(v)) { return; }
        const path: Edge[] = [];
        for (let e = this._edgeTo[v]; e != null; e = this._edgeTo[e.from]) {
            path.push(e);
        }
        while (path.length > 0) {
            yield path.pop();
        }
    }

    // check optimality conditions:
    // (i) for all edges e:            distTo[e.to()] <= distTo[e.from()] + e.weight()
    // (ii) for all edge e on the SPT: distTo[e.to()] == distTo[e.from()] + e.weight()
    private throwIfInvalid(G: DiGraph, s: number) {

        // check that edge weights are nonnegative
        for (const e of G.get_edges()) {
            if (e.weight < 0) {
                throw new Error('negative edge weight detected');
            }
        }

        // check that distTo[v] and edgeTo[v] are consistent
        if (this._distTo[s] !== 0.0) {
            throw new Error('distTo[source] should be 0');
        }
        if (this._edgeTo[s] !== null) {
            throw new Error('there should be no edge to the source vertex');
        }
        for (let v = 0; v < G.num_nodes(); v++) {
            if (v === s) { continue; }
            if (this._edgeTo[v] == null && this._distTo[v] !== Number.MAX_VALUE) {
                throw new Error('distTo[] and edgeTo[] inconsistent');
            }
        }

        // check that all edges e = v->w satisfy distTo[w] <= distTo[v] + e.weight()
        for (let v = 0; v < G.num_nodes(); v++) {
            for (const e of G.adjacent(v)) {
                const w = e.to;
                if (this._distTo[v] + e.weight < this._distTo[w]) {
                    throw new Error(`edge ${e} not relaxed`);
                }
            }
        }

        // check that all edges e = v->w on SPT satisfy distTo[w] == distTo[v] + e.weight()
        for (let w = 0; w < G.num_nodes(); w++) {
            if (this._edgeTo[w] == null) { continue; }
            const e = this._edgeTo[w];
            const v = e.from;
            if (w !== e.to) {
                throw new Error(`edgeTo[${w}] does not point to vertex ${w}`);
            }
            if (this._distTo[v] + e.weight !== this._distTo[w]) {
                throw new Error(`edge ${e} on shortest path not tight`);
            }
        }
    }

    // throw an IllegalArgumentException unless {@code 0 <= v < V}
    private validateVertex(v: number) {
        const V = this._distTo.length;
        if (v < 0 || v >= V) {
            throw new Error(`vertex ${v} is not between 0 and ${V - 1}`);
        }
    }
}
