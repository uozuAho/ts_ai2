import { IGraph } from '../../structures/igraph';
import { FifoQueue } from '../../structures/fifo_queue';

/**
 * Copied from https://algs4.cs.princeton.edu/code/edu/princeton/cs/algs4/EulerianCycle.java.html
 *
 *  The {@code EulerianCycle} class represents a data type
 *  for finding an Eulerian cycle or path in a graph.
 *  An <em>Eulerian cycle</em> is a cycle (not necessarily simple) that
 *  uses every edge in the graph exactly once.
 *  <p>
 *  This implementation uses a nonrecursive depth-first search.
 *  The constructor runs in O(<Em>E</em> + <em>V</em>) time,
 *  and uses O(<em>E</em> + <em>V</em>) extra space, where <em>E</em> is the
 *  number of edges and <em>V</em> the number of vertices
 *  All other methods take O(1) time.
 *  <p>
 *  To compute Eulerian paths in graphs, see {@link EulerianPath}.
 *  To compute Eulerian cycles and paths in digraphs, see
 *  {@link DirectedEulerianCycle} and {@link DirectedEulerianPath}.
 *  <p>
 *  For additional documentation,
 *  see <a href="https://algs4.cs.princeton.edu/41graph">Section 4.1</a> of
 *  <i>Algorithms, 4th Edition</i> by Robert Sedgewick and Kevin Wayne.
 *
 *  @author Robert Sedgewick
 *  @author Kevin Wayne
 *  @author Nate Liu
 */

/** Find an Eulerian cycle in a graph, if one exists. */
export class EulerianCycle {
    // Eulerian cycle; null if no such cycle
    private _cycle: number[] = null;

    /**
     * Computes an Eulerian cycle in the specified graph, if one exists.
     *
     * @param G the graph
     */
    constructor(G: IGraph) {

        // necessary condition: all vertices have even degree
        // (this test is needed or it might find an Eulerian path instead of cycle)
        for (let v = 0; v < G.num_nodes(); v++) {
            if (G.degree(v) % 2 !== 0) {
                return;
            }
        }

        // create local view of adjacency lists, to iterate one vertex at a time
        // the helper Edge data type is used to avoid exploring both copies of an edge v-w
        const adj: FifoQueue<Edge>[] = [];
        for (let v = 0; v < G.num_nodes(); v++) {
            adj[v] = new FifoQueue<Edge>();
        }

        for (let v = 0; v < G.num_nodes(); v++) {
            let selfLoops = 0;
            for (const w of G.adjacent(v).map(e => e.other(v))) {
                // careful with self loops
                if (v === w) {
                    if (selfLoops % 2 === 0) {
                        const e = new Edge(v, w);
                        adj[v].push(e);
                        adj[w].push(e);
                    }
                    selfLoops++;
                }
                else if (v < w) {
                    const e = new Edge(v, w);
                    adj[v].push(e);
                    adj[w].push(e);
                }
            }
        }

        // initialize stack with any non-isolated vertex
        const s = this.nonIsolatedVertex(G);
        const stack: number[] = [];
        stack.push(s);

        // greedily search through edges in iterative DFS style
        this._cycle = [];
        while (stack.length > 0) {
            let v = stack.pop();
            while (!adj[v].isEmpty()) {
                const edge = adj[v].pop();
                if (edge.isUsed) { continue; }
                edge.isUsed = true;
                stack.push(v);
                v = edge.other(v);
            }
            // push vertex with no more leaving edges to cycle
            this._cycle.push(v);
        }

        // check if all edges are used
        if (this._cycle.length !== G.num_edges() + 1) {
            this._cycle = null;
        }

        this.certifySolution(G);
    }

    /**
     * Returns the sequence of vertices on an Eulerian cycle.
     *
     * @return the sequence of vertices on an Eulerian cycle;
     *         {@code null} if no such cycle
     */
    public* cycle(): IterableIterator<number> {
        if (this._cycle !== null) {
            for (const i of this._cycle) {
                yield i;
            }
        }
    }

    /**
     * Returns true if the graph has an Eulerian cycle.
     *
     * @return {@code true} if the graph has an Eulerian cycle;
     *         {@code false} otherwise
     */
    public hasEulerianCycle(): boolean {
        return this._cycle != null;
    }

    // returns any non-isolated vertex; -1 if no such vertex
    private nonIsolatedVertex(G: IGraph): number {
        for (let v = 0; v < G.num_nodes(); v++) {
            if (G.degree(v) > 0) {
                return v;
            }
        }
        return -1;
    }

    /**************************************************************************
     *
     *  The code below is solely for testing correctness of the data type.
     *
     **************************************************************************/

    // Determines whether a graph has an Eulerian cycle using necessary
    // and sufficient conditions (without computing the cycle itself):
    //    - at least one edge
    //    - degree(v) is even for every vertex v
    //    - the graph is connected (ignoring isolated vertices)
    private satisfiesNecessaryAndSufficientConditions(G: IGraph) {

        // Condition 0: at least 1 edge
        if (G.num_edges() === 0) {
            throw new Error('must contain at least one edge');
        }

        // Condition 1: degree(v) is even for every vertex
        for (let v = 0; v < G.num_nodes(); v++) {
            if (G.degree(v) % 2 !== 0) {
                throw new Error(`degree of vertex ${v} is odd`);
            }
        }

        // Condition 2: graph is connected, ignoring isolated vertices
        // todo: this. needs BreadthFirstPaths
        // const s = this.nonIsolatedVertex(G);
        // BreadthFirstPaths bfs = new BreadthFirstPaths(G, s);
        // for (int v = 0; v < G.V(); v++)
        //     if (G.degree(v) > 0 && !bfs.hasPathTo(v))
        //         return false;
    }

    // check that solution is correct
    private certifySolution(G: IGraph) {

        // internal consistency check
        if (this.hasEulerianCycle() === (Array.from(this.cycle()).length === 0)) {
            throw new Error('hasEulerianCycle but cycle() is empty');
        }

        if (this.hasEulerianCycle()) {
            this.satisfiesNecessaryAndSufficientConditions(G);
        }

        // nothing else to check if no Eulerian cycle
        if (this._cycle == null) {
            return;
        }

        // check that cycle() uses correct number of edges
        if (this._cycle.length !== G.num_edges() + 1) {
            throw new Error('cycle must contain E + 1 edges');
        }

        // check that first and last vertices in cycle() are the same
        let first = -1, last = -1;
        for (const v of this.cycle()) {
            if (first === -1) {
                first = v;
            }
            last = v;
        }
        if (first !== last) {
            throw new Error('first and last index of cycle must be equal');
        }
    }
}

/** an undirected edge, with a field to indicate whether the edge has already been used */
class Edge {
    public isUsed: boolean;

    constructor(private v: number, private w: number) {
        this.isUsed = false;
    }

    // returns the other vertex of the edge
    public other(vertex: number) {
        if      (vertex === this.v) { return this.w; }
        else if (vertex === this.w) { return this.v; }
        else {
            throw new Error('Illegal endpoint');
        }
    }
}
