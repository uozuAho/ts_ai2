import { DirectedDFS } from './directed_dfs';
import { IGraph } from '../../structures/igraph';

/**
 * Copied from https://algs4.cs.princeton.edu/code/edu/princeton/cs/algs4/TransitiveClosure.java.html
 *
 *  The {@code TransitiveClosure} class represents a data type for
 *  computing the transitive closure of a digraph.
 *  <p>
 *  This implementation runs depth-first search from each vertex.
 *  The constructor takes time proportional to <em>V</em>(<em>V</em> + <em>E</em>)
 *  (in the worst case) and uses space proportional to <em>V</em><sup>2</sup>,
 *  where <em>V</em> is the number of vertices and <em>E</em> is the number of edges.
 *  <p>
 *  For large digraphs, you may want to consider a more sophisticated algorithm.
 *  <a href = "http://www.cs.hut.fi/~enu/thesis.html">Nuutila</a> proposes two
 *  algorithm for the problem (based on strong components and an interval representation)
 *  that runs in <em>E</em> + <em>V</em> time on typical digraphs.
 *
 *  For additional documentation,
 *  see <a href="https://algs4.cs.princeton.edu/42digraph">Section 4.2</a> of
 *  <i>Algorithms, 4th Edition</i> by Robert Sedgewick and Kevin Wayne.
 *
 *  @author Robert Sedgewick
 *  @author Kevin Wayne
 */
export class TransitiveClosure {
    private _tc: DirectedDFS[];  // tc[v] = reachable from v

    /**
     * Computes the transitive closure of the digraph G.
     * @param G the digraph
     */
    constructor(G: IGraph) {
        this._tc = [];
        for (let v = 0; v < G.num_nodes(); v++) {
            this._tc.push(new DirectedDFS(G, v));
        }
    }

    /**
     * Is there a directed path from vertex {@code v} to vertex {@code w} in the digraph?
     * @param  v the source vertex
     * @param  w the target vertex
     * @return {@code true} if there is a directed path from {@code v} to {@code w},
     *         {@code false} otherwise
     * @throws IllegalArgumentException unless {@code 0 <= v < V}
     * @throws IllegalArgumentException unless {@code 0 <= w < V}
     */
    public reachable(v: number, w: number): boolean {
        this.validateVertex(v);
        this.validateVertex(w);
        return this._tc[v].marked(w);
    }

    // throw an IllegalArgumentException unless {@code 0 <= v < V}
    private validateVertex(v: number) {
        const V = this._tc.length;
        if (v < 0 || v >= V) {
            throw new Error(`vertex ${v} is not between 0 and ${V - 1}`);
        }
    }
}
