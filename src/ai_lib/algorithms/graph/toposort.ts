import { IGraph } from '../../structures/igraph';
import { DirectedCycle } from './directed_cycle';
import { DepthFirstOrder } from './depth_first_order';

/**
 *  Copied from https://algs4.cs.princeton.edu/code/edu/princeton/cs/algs4/Topological.java.html
 *
 *  The {@code Topological} class represents a data type for
 *  determining a topological order of a directed acyclic graph (DAG).
 *  Recall, a digraph has a topological order if and only if it is a DAG.
 *  The <em>hasOrder</em> operation determines whether the digraph has
 *  a topological order, and if so, the <em>order</em> operation
 *  returns one.
 *  <p>
 *  This implementation uses depth-first search.
 *  The constructor takes time proportional to <em>V</em> + <em>E</em>
 *  (in the worst case),
 *  where <em>V</em> is the number of vertices and <em>E</em> is the number of edges.
 *  Afterwards, the <em>hasOrder</em> and <em>rank</em> operations takes constant time;
 *  the <em>order</em> operation takes time proportional to <em>V</em>.
 *  <p>
 *  See {@link DirectedCycle}, {@link DirectedCycleX}, and
 *  {@link EdgeWeightedDirectedCycle} to compute a
 *  directed cycle if the digraph is not a DAG.
 *  See {@link TopologicalX} for a nonrecursive queue-based algorithm
 *  to compute a topological order of a DAG.
 *  <p>
 *  For additional documentation,
 *  see <a href="https://algs4.cs.princeton.edu/42digraph">Section 4.2</a> of
 *  <i>Algorithms, 4th Edition</i> by Robert Sedgewick and Kevin Wayne.
 *
 *  @author Robert Sedgewick
 *  @author Kevin Wayne
 */

/**
 * Calculates a topological order for the given DiGraph.
 */
export class TopoSort {
    private _order: number[] = null;  // topological order
    private _rank: number[] = null;               // rank[v] = rank of vertex v in order

    /**
     * Determines whether the digraph {@code G} has a topological order and, if so,
     * finds such a topological order.
     * @param G the digraph
     */
    public constructor(G: IGraph) {
        const finder = new DirectedCycle(G);
        if (!finder.hasCycle()) {
            const dfs = new DepthFirstOrder(G);
            this._order = Array.from(dfs.reversePost());
            this._rank = Array(G.num_nodes()).fill(0);
            let i = 0;
            for (const v of this._order) {
                this.rank[v] = i++;
            }
        }
    }

    /**
     * Returns a topological order if the digraph has a topologial order,
     * and {@code null} otherwise.
     * @return a topological order of the vertices (as an interable) if the
     *    digraph has a topological order (or equivalently, if the digraph is a DAG),
     *    and {@code null} otherwise
     */
    public* order(): IterableIterator<number> {
        if (this._order !== null) {
            yield* this._order;
        }
    }

    /**
     * Does the digraph have a topological order?
     * @return {@code true} if the digraph has a topological order (or equivalently,
     *    if the digraph is a DAG), and {@code false} otherwise
     */
    public hasOrder(): boolean {
        return this._order != null;
    }

    /**
     * The the rank of vertex {@code v} in the topological order;
     * -1 if the digraph is not a DAG
     *
     * @param v the vertex
     * @return the position of vertex {@code v} in a topological order
     *    of the digraph; -1 if the digraph is not a DAG
     * @throws IllegalArgumentException unless {@code 0 <= v < V}
     */
    public rank(v: number): number {
        this.validateVertex(v);
        if (this.hasOrder()) { return this._rank[v]; }
        else { return -1; }
    }

    // throw an IllegalArgumentException unless {@code 0 <= v < V}
    private validateVertex(v: number) {
        const V = this._rank.length;
        if (v < 0 || v >= V) {
            throw new Error(`vertex ${v} is not between 0 and ${V - 1}`);
        }
    }
}
