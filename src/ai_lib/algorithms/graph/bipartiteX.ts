/**
 *  Copied from https://algs4.cs.princeton.edu/41graph/BipartiteX.java.html.
 *
 *  Original docs:
 *
 *  The {@code BipartiteX} class represents a data type for
 *  determining whether an undirected graph is bipartite or whether
 *  it has an odd-length cycle.
 *  The <em>isBipartite</em> operation determines whether the graph is
 *  bipartite. If so, the <em>color</em> operation determines a
 *  bipartition; if not, the <em>oddCycle</em> operation determines a
 *  cycle with an odd number of edges.
 *  <p>
 *  This implementation uses breadth-first search and is nonrecursive.
 *  The constructor takes time proportional to <em>V</em> + <em>E</em>
 *  (in the worst case),
 *  where <em>V</em> is the number of vertices and <em>E</em> is the number of edges.
 *  Afterwards, the <em>isBipartite</em> and <em>color</em> operations
 *  take constant time; the <em>oddCycle</em> operation takes time proportional
 *  to the length of the cycle.
 *  See {@link Bipartite} for a recursive version that uses depth-first search.
 *  <p>
 *  For additional documentation,
 *  see <a href="https://algs4.cs.princeton.edu/41graph">Section 4.1</a>
 *  of <i>Algorithms, 4th Edition</i> by Robert Sedgewick and Kevin Wayne.
 *
 *  @author Robert Sedgewick
 *  @author Kevin Wayne
 */

import { IGraph } from '../../structures/igraph';
import { FifoQueue } from '../../structures/fifo_queue';

const WHITE = false;
const BLACK = true;

/** Given a graph, find either (i) a bipartition or (ii) an odd-length cycle.
 *  Runs in O(E + V) time.
 */
export class BipartiteX {

    private _isBipartite: boolean;
    /** color of each node */
    private _color: boolean[];
    /** marked[v] = true if v has been visited in DFS */
    private _marked: boolean[];
    /** edgeTo[v] = last edge on path to v */
    private _edgeTo: number[];
    /** odd-length cycle */
    private _cycle: FifoQueue<number>;

    /**
     * Determines whether an undirected graph is bipartite and finds either a
     * bipartition or an odd-length cycle.
     */
    constructor(graph: IGraph) {
        this._isBipartite = true;
        this._color  = [];
        this._marked = [];
        this._edgeTo = [];
        for (let i = 0; i < graph.num_nodes(); i++) {
            this._color[i] = WHITE;
            this._marked[i] = false;
            this._edgeTo[i] = 0;
        }

        for (let v = 0; v < graph.num_nodes() && this._isBipartite; v++) {
            if (!this._marked[v]) {
                this.bfs(graph, v);
            }
        }
    }

    private bfs(G: IGraph, s: number) {
        const q = new FifoQueue<number>();
        this._color[s] = WHITE;
        this._marked[s] = true;
        q.push(s);

        while (!q.isEmpty()) {
            const v = q.pop();
            for (const w of G.adjacent(v).map(e => e.to)) {
                if (!this._marked[w]) {
                    this._marked[w] = true;
                    this._edgeTo[w] = v;
                    this._color[w] = !this._color[v];
                    q.push(w);
                }
                else if (this._color[w] === this._color[v]) {
                    this._isBipartite = false;

                    // to form odd cycle, consider s-v path and s-w path
                    // and let x be closest node to v and w common to two paths
                    // then (w-x path) + (x-v path) + (edge v-w) is an odd-length cycle
                    // Note: distTo[v] == distTo[w];
                    this._cycle = new FifoQueue<number>();
                    const stack: number[] = [];
                    let x = v, y = w;
                    while (x !== y) {
                        stack.push(x);
                        this._cycle.push(y);
                        x = this._edgeTo[x];
                        y = this._edgeTo[y];
                    }
                    stack.push(x);
                    while (stack.length > 0) {
                        this._cycle.push(stack.pop());
                    }
                    this._cycle.push(w);
                    return;
                }
            }
        }
    }

    public isBipartite(): boolean {
        return this._isBipartite;
    }

    /**
     * Returns the side of the bipartite that vertex v is on.
     *
     * @param  v the vertex
     * @return the side of the bipartition that vertex v is on; two vertices
     *         are in the same side of the bipartition if and only if they have the
     *         same color
     * @throws if index is invalid or graph is not bipartite
     */
    public color(v: number): boolean {
        this.validateVertex(v);
        if (!this._isBipartite) {
            throw new Error('Graph is not bipartite');
        }
        return this._color[v];
    }

    /**
     * Returns an odd-length cycle if the graph is not bipartite,
     * else an empty iterable.
     */
    public* oddCycle(): IterableIterator<number> {
        if (this._cycle !== undefined) {
            yield* this._cycle.items();
        }
    }

    /** throw unless 0 <= v < V */
    private validateVertex(v: number) {
        const V = this._marked.length;
        if (v < 0 || v >= V) {
            throw new Error(`vertex ${v} is not between 0 and ${(V - 1)}`);
        }
    }
}
