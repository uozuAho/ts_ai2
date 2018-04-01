import { FifoQueue } from '../../structures/fifo_queue';
import { IGraph } from '../../structures/igraph';

/**
 *  Copied from https://algs4.cs.princeton.edu/code/edu/princeton/cs/algs4/DepthFirstOrder.java.html
 *
 *  The {@code DepthFirstOrder} class represents a data type for
 *  determining depth-first search ordering of the vertices in a digraph
 *  or edge-weighted digraph, including preorder, postorder, and reverse postorder.
 *  <p>
 *  This implementation uses depth-first search.
 *  The constructor takes time proportional to <em>V</em> + <em>E</em>
 *  (in the worst case),
 *  where <em>V</em> is the number of vertices and <em>E</em> is the number of edges.
 *  Afterwards, the <em>preorder</em>, <em>postorder</em>, and <em>reverse postorder</em>
 *  operation takes take time proportional to <em>V</em>.
 *  <p>
 *  For additional documentation,
 *  see <a href="https://algs4.cs.princeton.edu/42digraph">Section 4.2</a> of
 *  <i>Algorithms, 4th Edition</i> by Robert Sedgewick and Kevin Wayne.
 *
 *  @author Robert Sedgewick
 *  @author Kevin Wayne
 */

/** Compute preorder and postorder for a digraph or edge-weighted digraph.
 *  Runs in O(E + V) time. */
export class DepthFirstOrder {
    private marked: boolean[];          // marked[v] = has v been marked in dfs?
    private _pre: number[];                 // pre[v]    = preorder  number of v
    private _post: number[];                // post[v]   = postorder number of v
    private preorder: FifoQueue<number>;   // vertices in preorder
    private postorder: FifoQueue<number>;  // vertices in postorder
    private preCounter = 0;            // counter or preorder numbering
    private postCounter = 0;           // counter for postorder numbering

    /**
     * Determines a depth-first order for the digraph {@code G}.
     * @param G the digraph
     */
    public constructor(G: IGraph) {
        this._pre    = Array(G.num_nodes()).fill(0);
        this._post   = Array(G.num_nodes()).fill(0);
        this.postorder = new FifoQueue();
        this.preorder  = new FifoQueue();
        this.marked    = Array(G.num_nodes()).fill(false);
        for (let v = 0; v < G.num_nodes(); v++) {
            if (!this.marked[v]) { this.dfs(G, v); }
        }
        this.check();
    }

    // run DFS in digraph G from vertex v and compute preorder/postorder
    private dfs(G: IGraph, v: number) {
        this.marked[v] = true;
        this._pre[v] = this.preCounter++;
        this.preorder.push(v);
        for (const w of G.adjacent(v).map(e => e.other(v))) {
            if (!this.marked[w]) {
                this.dfs(G, w);
            }
        }
        this.postorder.push(v);
        this._post[v] = this.postCounter++;
    }

    /**
     * Returns the preorder number of vertex {@code v}.
     * @param  v the vertex
     * @return the preorder number of vertex {@code v}
     * @throws IllegalArgumentException unless {@code 0 <= v < V}
     */
    public preOf(v: number): number {
        this.validateVertex(v);
        return this._pre[v];
    }

    /**
     * Returns the postorder number of vertex {@code v}.
     * @param  v the vertex
     * @return the postorder number of vertex {@code v}
     * @throws IllegalArgumentException unless {@code 0 <= v < V}
     */
    public postOf(v: number): number {
        this.validateVertex(v);
        return this._post[v];
    }

    /**
     * Returns the vertices in postorder.
     * @return the vertices in postorder, as an iterable of vertices
     */
    public* post(): IterableIterator<number> {
        yield* this.postorder.items();
    }

    /**
     * Returns the vertices in preorder.
     * @return the vertices in preorder, as an iterable of vertices
     */
    public* pre(): IterableIterator<number> {
        yield* this.preorder.items();
    }

    /**
     * Returns the vertices in reverse postorder.
     * @return the vertices in reverse postorder, as an iterable of vertices
     */
    public* reversePost(): IterableIterator<number> {
        const reverse: number[] = [];
        for (const v of this.post()) {
            reverse.push(v);
        }
        while (reverse.length > 0) {
            yield reverse.pop();
        }
    }

    // check that pre() and post() are consistent with pre(v) and post(v)
    private check() {
        // check that post(v) is consistent with post()
        let r = 0;
        for (const v of this.post()) {
            if (this.postOf(v) !== r) {
                throw new Error('post(v) and post() inconsistent');
            }
            r++;
        }
        // check that pre(v) is consistent with pre()
        r = 0;
        for (const v of this.pre()) {
            if (this.preOf(v) !== r) {
                throw new Error('pre(v) and pre() inconsistent');
            }
            r++;
        }
    }

    // throw an IllegalArgumentException unless {@code 0 <= v < V}
    private validateVertex(v: number) {
        const V = this.marked.length;
        if (v < 0 || v >= V) {
            throw new Error(`vertex ${v} is not between 0 and ${V - 1}`);
        }
    }
}
