import { Assert } from '../../libs/assert/Assert';

/**
 * Copied from https://algs4.cs.princeton.edu/code/edu/princeton/cs/algs4/IndexMinPQ.java.html
 *
 *  The {@code IndexMinPQ} class represents an indexed priority queue of generic keys.
 *  It supports the usual <em>insert</em> and <em>delete-the-minimum</em>
 *  operations, along with <em>delete</em> and <em>change-the-key</em>
 *  methods. In order to let the client refer to keys on the priority queue,
 *  an integer between {@code 0} and {@code maxN - 1}
 *  is associated with each key—the client uses this integer to specify
 *  which key to delete or change.
 *  It also supports methods for peeking at the minimum key,
 *  testing if the priority queue is empty, and iterating through
 *  the keys.
 *  <p>
 *  This implementation uses a binary heap along with an array to associate
 *  keys with integers in the given range.
 *  The <em>insert</em>, <em>delete-the-minimum</em>, <em>delete</em>,
 *  <em>change-key</em>, <em>decrease-key</em>, and <em>increase-key</em>
 *  operations take logarithmic time.
 *  The <em>is-empty</em>, <em>size</em>, <em>min-index</em>, <em>min-key</em>,
 *  and <em>key-of</em> operations take constant time.
 *  Construction takes time proportional to the specified capacity.
 *  <p>
 *  For additional documentation, see <a href="https://algs4.cs.princeton.edu/24pq">Section 2.4</a> of
 *  <i>Algorithms, 4th Edition</i> by Robert Sedgewick and Kevin Wayne.
 *
 *  @author Robert Sedgewick
 *  @author Kevin Wayne
 *
 *  @param <Key> the generic type of key on this priority queue
 */

/** Indexed PQ implementation using a binary heap. */
export class IndexedPriorityQueue<T> {
    private maxN: number;        // maximum number of elements on PQ
    private n: number;           // number of elements on PQ
    private pq: number[];        // binary heap using 1-based indexing
    private qp: number[];        // inverse of pq - qp[pq[i]] = pq[qp[i]] = i
    private keys: T[];      // keys[i] = priority of i
    private _compare: (a: T, b: T) => number;

    /**
     * Initializes an empty indexed priority queue with indices between {@code 0}
     * and {@code maxN - 1}.
     * @param  maxN the keys on this priority queue are index from {@code 0}
     *         {@code maxN - 1}
     * @throws IllegalArgumentException if {@code maxN < 0}
     */
    constructor(maxN: number, compare: (a: T, b: T) => number) {
        if (maxN < 0) {
            throw new Error();
        }
        this.maxN = maxN;
        this.n = 0;
        this.keys = [];
        this.pq = Array(maxN + 1).fill(0);
        this.qp = Array(maxN + 1).fill(-1);
        for (let i = 0; i <= maxN; i++) {
            this.qp[i] = -1;
        }
        this._compare = compare;
    }

    /**
     * Returns true if this priority queue is empty.
     *
     * @return {@code true} if this priority queue is empty;
     *         {@code false} otherwise
     */
    public isEmpty(): boolean {
        return this.n === 0;
    }

    /**
     * Is {@code i} an index on this priority queue?
     *
     * @param  i an index
     * @return {@code true} if {@code i} is an index on this priority queue;
     *         {@code false} otherwise
     * @throws IllegalArgumentException unless {@code 0 <= i < maxN}
     */
    public contains(i: number): boolean {
        this.throwIfInvalidIndex(i);
        return this.qp[i] !== -1;
    }

    /**
     * Returns the number of keys on this priority queue.
     *
     * @return the number of keys on this priority queue
     */
    public size(): number {
        return this.n;
    }

    /**
     * Associates key with index {@code i}.
     *
     * @param  i an index
     * @param  key the key to associate with index {@code i}
     * @throws IllegalArgumentException unless {@code 0 <= i < maxN}
     * @throws IllegalArgumentException if there already is an item associated
     *         with index {@code i}
     */
    public insert(i: number, key: T) {
        this.throwIfInvalidIndex(i);
        if (this.contains(i)) {
            throw new Error('index is already in the priority queue');
        }
        this.n++;
        this.qp[i] = this.n;
        this.pq[this.n] = i;
        this.keys[i] = key;
        this.swim(this.n);
    }

    /**
     * Returns an index associated with a minimum key.
     *
     * @return an index associated with a minimum key
     * @throws NoSuchElementException if this priority queue is empty
     */
    public minIndex(): number {
        this.throwIfEmpty();
        return this.pq[1];
    }

    /**
     * Returns a minimum key.
     *
     * @return a minimum key
     * @throws NoSuchElementException if this priority queue is empty
     */
    public minKey(): T {
        this.throwIfEmpty();
        return this.keys[this.pq[1]];
    }

    /**
     * Removes a minimum key and returns its associated index.
     * @return an index associated with a minimum key
     * @throws NoSuchElementException if this priority queue is empty
     */
    public delMin(): number {
        this.throwIfEmpty();
        const min = this.pq[1];
        this.exch(1, this.n--);
        this.sink(1);
        Assert.isTrue(min === this.pq[this.n + 1]);
        this.qp[min] = -1;        // delete
        this.keys[min] = null;    // to help with garbage collection
        this.pq[this.n + 1] = -1;        // not needed
        return min;
    }

    /**
     * Returns the key associated with index {@code i}.
     *
     * @param  i the index of the key to return
     * @return the key associated with index {@code i}
     * @throws IllegalArgumentException unless {@code 0 <= i < maxN}
     * @throws NoSuchElementException no key is associated with index {@code i}
     */
    public keyOf(i: number): T {
        this.throwIfOutOfBounds(i);
        this.throwIfNotContains(i);
        return this.keys[i];
    }

    /**
     * Change the key associated with index {@code i} to the specified value.
     *
     * @param  i the index of the key to change
     * @param  key change the key associated with index {@code i} to this key
     * @throws IllegalArgumentException unless {@code 0 <= i < maxN}
     * @throws NoSuchElementException no key is associated with index {@code i}
     */
    public changeKey(i: number, key: T) {
        this.throwIfOutOfBounds(i);
        this.throwIfNotContains(i);
        this.keys[i] = key;
        this.swim(this.qp[i]);
        this.sink(this.qp[i]);
    }

    /**
     * Decrease the key associated with index {@code i} to the specified value.
     *
     * @param  i the index of the key to decrease
     * @param  key decrease the key associated with index {@code i} to this key
     * @throws IllegalArgumentException unless {@code 0 <= i < maxN}
     * @throws IllegalArgumentException if {@code key >= keyOf(i)}
     * @throws NoSuchElementException no key is associated with index {@code i}
     */
    public decreaseKey(i: number, key: T) {
        this.throwIfOutOfBounds(i);
        this.throwIfNotContains(i);
        if (this._compare(this.keys[i], key) <= 0) {
            throw new Error('Calling decreaseKey() with given argument would not strictly decrease the key');
        }
        this.keys[i] = key;
        this.swim(this.qp[i]);
    }

    /**
     * Increase the key associated with index {@code i} to the specified value.
     *
     * @param  i the index of the key to increase
     * @param  key increase the key associated with index {@code i} to this key
     * @throws IllegalArgumentException unless {@code 0 <= i < maxN}
     * @throws IllegalArgumentException if {@code key <= keyOf(i)}
     * @throws NoSuchElementException no key is associated with index {@code i}
     */
    public increaseKey(i: number, key: T) {
        this.throwIfOutOfBounds(i);
        this.throwIfNotContains(i);
        if (this._compare(this.keys[i], key) >= 0) {
            throw new Error('Calling increaseKey() with given argument would not strictly increase the key');
        }
        this.keys[i] = key;
        this.sink(this.qp[i]);
    }

    /**
     * Remove the key associated with index {@code i}.
     *
     * @param  i the index of the key to remove
     * @throws IllegalArgumentException unless {@code 0 <= i < maxN}
     * @throws NoSuchElementException no key is associated with index {@code i}
     */
    public delete(i: number) {
        this.throwIfOutOfBounds(i);
        this.throwIfNotContains(i);
        const index = this.qp[i];
        this.exch(index, this.n--);
        this.swim(index);
        this.sink(index);
        this.keys[i] = null;
        this.qp[i] = -1;
    }

    private throwIfInvalidIndex(i: number) {
        if (i < 0 || i >= this.maxN) {
            throw new Error();
        }
    }

    private throwIfEmpty() {
        if (this.n === 0) {
            throw new Error('Priority queue underflow');
        }
    }

    private throwIfOutOfBounds(i: number) {
        if (i < 0 || i >= this.maxN) {
            throw new Error(`out of bounds: ${i}`);
        }
    }

    private throwIfNotContains(i: number) {
        if (!this.contains(i)) {
            throw new Error('index is not in the priority queue');
        }
    }

   /***************************************************************************
    * General helper functions.
    ***************************************************************************/
    private greater(i: number, j: number): boolean {
        return this._compare(this.keys[this.pq[i]], this.keys[this.pq[j]]) > 0;
    }

    private exch(i: number, j: number) {
        const swap = this.pq[i];
        this.pq[i] = this.pq[j];
        this.pq[j] = swap;
        this.qp[this.pq[i]] = i;
        this.qp[this.pq[j]] = j;
    }


   /***************************************************************************
    * Heap helper functions.
    ***************************************************************************/
    private swim(k: number) {
        // use 'shift right' instead of div 2 to get int division
        while (k > 1 && this.greater(k >> 1, k)) {
            this.exch(k, k >> 1);
            k = k >> 1;
        }
    }

    private sink(k: number) {
        while (2 * k <= this.n) {
            let j = 2 * k;
            if (j < this.n && this.greater(j, j + 1)) { j++; }
            if (!this.greater(k, j)) { break; }
            this.exch(k, j);
            k = j;
        }
    }


   /***************************************************************************
    * Iterators.
    ***************************************************************************/

    /**
     * Returns an iterator that iterates over the keys on the
     * priority queue in ascending order.
     * The iterator doesn't implement {@code remove()} since it's optional.
     *
     * @return an iterator that iterates over the keys in ascending order
     */
    public* iterator(): IterableIterator<number> {
        const copy = new IndexedPriorityQueue<T>(this.pq.length - 1, this._compare);
        for (let i = 1; i <= this.n; i++) {
            copy.insert(this.pq[i], this.keys[this.pq[i]]);
        }
        while (!copy.isEmpty()) {
            yield copy.delMin();
        }
    }
}
