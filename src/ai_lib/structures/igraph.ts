export interface IGraph {
    num_nodes(): number;
    add_edge(p: number, q: number, weight: number): void;
    get_edges(): Edge[];
    /** Get edges incident to the given node */
    adjacent(n: number): Edge[];
    /** Get number of edges incident to this node */
    degree(n: number): number;
}

export class Edge {
    constructor(public from: number, public to: number, public weight: number) {}

    /** Compares weights. -1 if this is less than other, 0 if same, else 1 */
    public compare(other: Edge) {
        if (this.weight < other.weight) { return -1; }
        if (this.weight > other.weight) { return 1; }
        return 0;
    }

    /** Returns the other end of the edge to the given end */
    public other(n: number): number {
        if (n === this.from) { return this.to; }
        if (n === this.to) { return this.from; }
        throw new Error('invalid node: ' + n);
    }
}
