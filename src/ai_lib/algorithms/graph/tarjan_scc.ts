import { DiGraph } from './../../structures/graph';
import { Assert } from '../../../libs/assert/Assert';
import { TransitiveClosure } from './transitive_closure';

/**
 * Copied from https://algs4.cs.princeton.edu/code/edu/princeton/cs/algs4/TarjanSCC.java.html
 *
 *  The {@code TarjanSCC} class represents a data type for
 *  determining the strong components in a digraph.
 *  The <em>id</em> operation determines in which strong component
 *  a given vertex lies; the <em>areStronglyConnected</em> operation
 *  determines whether two vertices are in the same strong component;
 *  and the <em>count</em> operation determines the number of strong
 *  components.

 *  The <em>component identifier</em> of a component is one of the
 *  vertices in the strong component: two vertices have the same component
 *  identifier if and only if they are in the same strong component.

 *  <p>
 *  This implementation uses Tarjan's algorithm.
 *  The constructor takes time proportional to <em>V</em> + <em>E</em>
 *  (in the worst case),
 *  where <em>V</em> is the number of vertices and <em>E</em> is the number of edges.
 *  Afterwards, the <em>id</em>, <em>count</em>, and <em>areStronglyConnected</em>
 *  operations take constant time.
 *  For alternate implementations of the same API, see
 *  {@link KosarajuSharirSCC} and {@link GabowSCC}.
 *  <p>
 *  For additional documentation,
 *  see <a href="https://algs4.cs.princeton.edu/42digraph">Section 4.2</a> of
 *  <i>Algorithms, 4th Edition</i> by Robert Sedgewick and Kevin Wayne.
 *
 *  @author Robert Sedgewick
 *  @author Kevin Wayne
 */
export class TarjanSCC {

    // marked[v] = has v been visited?
    private _marked: boolean[];
    // id[v] = id of strong component containing v
    private _id: number[];
    // low[v] = low number of v
    private _low: number[];
    // preorder number counter
    private _pre: number;
    // number of strongly-connected components
    private _count: number;
    private _stack: number[];

    /**
     * Computes the strong components of the digraph G.
     * @param G the digraph
     */
    constructor(G: DiGraph) {
        this._marked = Array(G.num_nodes()).fill(false);
        this._stack = [];
        this._id = Array(G.num_nodes()).fill(0);
        this._low = Array(G.num_nodes()).fill(0);
        for (let v = 0; v < G.num_nodes(); v++) {
            if (!this._marked[v]) {
                this.dfs(G, v);
            }
        }

        // check that id[] gives strong components
        Assert.isTrue(this.check(G));
    }

    private dfs(G: DiGraph, v: number): void {
        this._marked[v] = true;
        this._low[v] = this._pre++;
        let min = this._low[v];
        this._stack.push(v);
        for (const w of G.adjacent(v).map(e => e.other(v))) {
            if (!this._marked[w]) { this.dfs(G, w); }
            if (this._low[w] < min) { min = this._low[w]; }
        }
        if (min < this._low[v]) {
            this._low[v] = min;
            return;
        }
        let b;
        do {
            b = this._stack.pop();
            this._id[b] = this._count;
            this._low[b] = G.num_nodes();
        } while (b !== v);
        this._count++;
    }

    /**
     * Returns the number of strong components.
     * @return the number of strong components
     */
    public count(): number {
        return this._count;
    }

    /**
     * Are vertices {@code v} and {@code w} in the same strong component?
     * @param  v one vertex
     * @param  w the other vertex
     * @return {@code true} if vertices {@code v} and {@code w} are in the same
     *         strong component, and {@code false} otherwise
     * @throws IllegalArgumentException unless {@code 0 <= v < V}
     * @throws IllegalArgumentException unless {@code 0 <= w < V}
     */
    public stronglyConnected(v: number, w: number): boolean {
        this.validateVertex(v);
        this.validateVertex(w);
        return this._id[v] === this._id[w];
    }

    /**
     * Returns the component id of the strong component containing vertex v.
     * @param  v the vertex
     * @return the component id of the strong component containing vertex v
     * @throws IllegalArgumentException unless 0 <= v < V
     */
    public id(v: number): number {
        this.validateVertex(v);
        return this._id[v];
    }

    // does the id[] array contain the strongly connected components?
    private check(G: DiGraph): boolean {
        const tc = new TransitiveClosure(G);
        for (let v = 0; v < G.num_nodes(); v++) {
            for (let w = 0; w < G.num_nodes(); w++) {
                if (this.stronglyConnected(v, w)) {
                    if (!tc.reachable(v, w) || !tc.reachable(w, v)) {
                        throw new Error(`Sanity check fail: nodes ${v} and ${w} are strongly connected ` +
                                        `but not reachable from each other`);
                    }
                } else {
                    if (tc.reachable(v, w) && tc.reachable(w, v)) {
                        throw new Error(`Sanity check fail: nodes ${v} and ${w} are not strongly connected ` +
                                        `but both reachable from each other`);
                    }
                }
            }
        }
        return true;
    }

    // throw an IllegalArgumentException unless {@code 0 <= v < V}
    private validateVertex(v: number) {
        const V = this._marked.length;
        if (v < 0 || v >= V) {
            throw new Error(`vertex ${v} is not between 0 and ${V - 1}`);
        }
    }
}
