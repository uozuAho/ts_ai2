/**
 * Implements 'Union Find' (compute connected components). Operation complexities:
 * union - log(n)
 * find - log(n)
 * count - 1
 *
 * Translated from https://algs4.cs.princeton.edu/15uf/WeightedQuickUnionPathCompressionUF.java.html
*/
export class UnionFind {

    /** parent[i] = parent of i */
    private _parent: number[];

    /** size[i] = number of sites in tree rooted at i.
     *  Note: not necessarily correct if i is not a root node
     */
    private _size: number[];

    /** number of components */
    private _count: number;

    /**
     * Initializes an empty union–find data structure with n sites
     * @param n the number of sites
     * @throws if n < 0
     */
    constructor(n: number) {
        if (n < 0) { throw new Error('n must be >= 0'); }
        this._count = n;
        this._parent = [];
        this._size = [];
        for (let i = 0; i < n; i++) {
            this._parent[i] = i;
            this._size[i] = 1;
        }
    }

    /** Returns the number of components */
    public count(): number {
        return this._count;
    }

    /** Returns the component identifier for the component containing site p */
    public find(p: number): number {
        this._validate(p);
        let root = p;
        while (root !== this._parent[root]) {
            root = this._parent[root];
        }
        // compress path to root
        while (p !== root) {
            const newp = this._parent[p];
            this._parent[p] = root;
            p = newp;
        }
        return root;
    }

   /** Returns true if the the two sites are in the same component */
    public connected(p: number, q: number): boolean {
        return this.find(p) === this.find(q);
    }

    /**
     * Merges the component containing site {@code p} with the
     * the component containing site {@code q}.
     *
     * @param  p the integer representing one site
     * @param  q the integer representing the other site
     * @throws IllegalArgumentException unless
     *         both {@code 0 <= p < n} and {@code 0 <= q < n}
     */
    public union(p: number, q: number): void {
        const rootP = this.find(p);
        const rootQ = this.find(q);
        if (rootP === rootQ) { return; }

        // make smaller root point to larger one
        if (this._size[rootP] < this._size[rootQ]) {
            this._parent[rootP] = rootQ;
            this._size[rootQ] += this._size[rootP];
        } else {
            this._parent[rootQ] = rootP;
            this._size[rootP] += this._size[rootQ];
        }
        this._count--;
    }

    // validate that p is a valid index
    private _validate(p: number): void {
        const n = this._parent.length;
        if (p < 0 || p >= n) {
            throw new Error('index ' + p + ' is not between 0 and ' + (n - 1));
        }
    }
}
