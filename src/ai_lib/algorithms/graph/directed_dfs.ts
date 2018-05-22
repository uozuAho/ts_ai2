import { DiGraph } from '../../structures/graph';

/**
 * Copied from https://algs4.cs.princeton.edu/code/edu/princeton/cs/algs4/DirectedDFS.java.html
 *
 *  The {@code DirectedDFS} class represents a data type for
 *  determining the vertices reachable from a given source vertex <em>s</em>
 *  (or set of source vertices) in a digraph. For versions that find the paths,
 *  see {@link DepthFirstDirectedPaths} and {@link BreadthFirstDirectedPaths}.
 *  <p>
 *  This implementation uses depth-first search.
 *  The constructor takes time proportional to <em>V</em> + <em>E</em>
 *  (in the worst case),
 *  where <em>V</em> is the number of vertices and <em>E</em> is the number of edges.
 *  <p>
 *  For additional documentation,
 *  see <a href="https://algs4.cs.princeton.edu/42digraph">Section 4.2</a> of
 *  <i>Algorithms, 4th Edition</i> by Robert Sedgewick and Kevin Wayne.
 *
 *  @author Robert Sedgewick
 *  @author Kevin Wayne
 */
export class DirectedDFS {
    // marked[v] = true iff v is reachable from source(s)
    private _marked: boolean[];
    // number of vertices reachable from source(s)
    private _count: number;

    /**
     * Computes the vertices in digraph {@code G} that are
     * reachable from the source vertex {@code s}.
     * @param G the digraph
     * @param s the source vertex
     * @throws IllegalArgumentException unless {@code 0 <= s < V}
     */
    constructor(G: DiGraph, s: number) {
        this._marked = Array(G.num_nodes()).fill(false);
        this.validateVertex(s);
        this.dfs(G, s);
    }

    /**
     * Computes the vertices in digraph {@code G} that are
     * connected to any of the source vertices {@code sources}.
     * @param G the graph
     * @param sources the source vertices
     * @throws IllegalArgumentException unless {@code 0 <= s < V}
     *         for each vertex {@code s} in {@code sources}
     */
    // constructor(Digraph G, sources: number[]) {
    //     marked = new boolean[G.V()];
    //     validateVertices(sources);
    //     for (int v : sources) {
    //         if (!marked[v]) dfs(G, v);
    //     }
    // }

    private dfs(G: DiGraph, v: number) {
        this._count++;
        this._marked[v] = true;
        for (const w of G.adjacent(v).map(e => e.other(v))) {
            if (!this._marked[w]) { this.dfs(G, w); }
        }
    }

    /**
     * Is there a directed path from the source vertex (or any
     * of the source vertices) and vertex {@code v}?
     * @param  v the vertex
     * @return {@code true} if there is a directed path, {@code false} otherwise
     * @throws IllegalArgumentException unless {@code 0 <= v < V}
     */
    public marked(v: number): boolean {
        this.validateVertex(v);
        return this._marked[v];
    }

    /**
     * Returns the number of vertices reachable from the source vertex
     * (or source vertices).
     * @return the number of vertices reachable from the source vertex
     *   (or source vertices)
     */
    public count(): number {
        return this._count;
    }

    // throw an IllegalArgumentException unless {@code 0 <= v < V}
    private validateVertex(v: number) {
        const V = this._marked.length;
        if (v < 0 || v >= V) {
            throw new Error(`vertex ${v} is not between 0 and ${V - 1}`);
        }
    }

    // throw an IllegalArgumentException unless {@code 0 <= v < V}
    private validateVertices(vertices: number[]) {
        if (vertices == null) {
            throw new Error('argument is null');
        }
        for (const v of vertices) {
            this.validateVertex(v);
        }
    }
}
