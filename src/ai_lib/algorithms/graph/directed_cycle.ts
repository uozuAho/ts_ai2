import { IGraph } from '../../structures/igraph';

/**
 *  Copied from https://algs4.cs.princeton.edu/code/edu/princeton/cs/algs4/DirectedCycle.java.html
 *
 *  The {@code DirectedCycle} class represents a data type for
 *  determining whether a digraph has a directed cycle.
 *  The <em>hasCycle</em> operation determines whether the digraph has
 *  a directed cycle and, and of so, the <em>cycle</em> operation
 *  returns one.
 *  <p>
 *  This implementation uses depth-first search.
 *  The constructor takes time proportional to <em>V</em> + <em>E</em>
 *  (in the worst case),
 *  where <em>V</em> is the number of vertices and <em>E</em> is the number of edges.
 *  Afterwards, the <em>hasCycle</em> operation takes constant time;
 *  the <em>cycle</em> operation takes time proportional
 *  to the length of the cycle.
 *  <p>
 *  See {@link Topological} to compute a topological order if the
 *  digraph is acyclic.
 *  <p>
 *  For additional documentation,
 *  see <a href="https://algs4.cs.princeton.edu/42digraph">Section 4.2</a> of
 *  <i>Algorithms, 4th Edition</i> by Robert Sedgewick and Kevin Wayne.
 *
 *  @author Robert Sedgewick
 *  @author Kevin Wayne
 */

/**
 * Find a cycle in a directed graph
 */
export class DirectedCycle {
    private marked: boolean[];        // marked[v] = has vertex v been marked?
    private edgeTo: number[];            // edgeTo[v] = previous vertex on path to v
    private onStack: boolean[];       // onStack[v] = is vertex on the stack?
    private _cycle: number[] = null;    // directed cycle (or null if no such cycle)

    /**
     * Determines whether the digraph {@code G} has a directed cycle and, if so,
     * finds such a cycle.
     * @param G the digraph
     */
    public constructor(G: IGraph) {
        this.marked  = Array(G.num_nodes()).fill(false);
        this.onStack = Array(G.num_nodes()).fill(false);
        this.edgeTo  = Array(G.num_nodes()).fill(0);
        for (let v = 0; v < G.num_nodes(); v++) {
            if (!this.marked[v] && this._cycle == null) {
                this.dfs(G, v);
            }
        }
    }

    // check that algorithm computes either the topological order or finds a directed cycle
    private dfs(G: IGraph, node: number) {
        this.onStack[node] = true;
        this.marked[node] = true;
        for (const adj of G.adjacent(node).map(e => e.other(node))) {

            // short circuit if directed cycle found
            if (this._cycle != null) { return; }

            // found new vertex, so recur
            else if (!this.marked[adj]) {
                this.edgeTo[adj] = node;
                this.dfs(G, adj);
            }

            // trace back directed cycle from end to start
            else if (this.onStack[adj]) {
                this._cycle = [];
                for (let x = node; x !== adj; x = this.edgeTo[x]) {
                    this._cycle.push(x);
                }
                this._cycle.push(adj);
                this._cycle.push(node);
                // reverse to get the correct cycle order
                this._cycle.reverse();
                this.check();
            }
        }
        this.onStack[node] = false;
    }

    /**
     * Does the digraph have a directed cycle?
     * @return {@code true} if the digraph has a directed cycle, {@code false} otherwise
     */
    public hasCycle(): boolean {
        return this._cycle != null;
    }

    /**
     * Returns a directed cycle if the digraph has a directed cycle, and [] otherwise.
     * @returns array of node indexes in the cycle
     */
    public getCycle(): number[] {
        return this._cycle || [];
    }

    // certify that digraph has a directed cycle if it reports one
    private check() {
        if (this.hasCycle()) {
            // verify cycle
            let first = -1, last = -1;
            for (const v of this.getCycle()) {
                if (first === -1) { first = v; }
                last = v;
            }
            if (first !== last) {
                throw new Error(`cycle begins with ${first} and ends with ${last}`);
            }
        }
    }
}
