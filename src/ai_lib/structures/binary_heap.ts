/** BinaryHeap, implemented with array storage */
export class BinaryHeap<T> {

    private _size = 0;
    private _buf: T[] = [];
    private _compare: (a: T, b: T) => number;

    /**
     * @param compare Optional comparator. Default is a < b ? -1 : a > b ? 1 : 0.
     *                Reverse this to make a max heap.
     */
    constructor(compare: (a: T, b: T) => number = null) {
        this._compare = compare || this.defaultCompare;
    }

    public add(item: T) {
        this._buf[this._size++] = item;
        this.swim(this._size - 1);
    }

    public remove(item: T) {
        if (this.size() === 0) {
            throw new Error('cannot remove from empty');
        }
        const idx = this.indexOf(item, 0);
        if (idx === -1) {
            throw new Error('cannot remove item not in heap');
        }
        this.removeAtIdx(idx);
    }

    public size(): number {
        return this._size;
    }

    public contains(item: T): boolean {
        return this.indexOf(item, 0) >= 0;
    }

    /** Remove the minimum item */
    public removeMin(): T {
        return this.removeAtIdx(0);
    }

    /** Get the minimum item without removing it */
    public peekMin(): T {
        if (this.size() === 0) {
            throw new Error('cannot peek when empty');
        }
        return this._buf[0];
    }

    private removeAtIdx(idx: number): T {
        if (idx >= this.size()) {
            throw new Error('invalid idx');
        }
        // swap item at idx and last item
        const temp = this._buf[idx];
        this._buf[idx] = this._buf[--this._size];
        // sink last item placed at idx
        this.sink(idx);
        return temp;
    }

    /** Return the first found index of the given item, else -1
     *  @param subroot node to start the search.
     */
    private indexOf(item: T, subroot: number): number {
        if (subroot >= this._size) {
            // gone past leaf
            return -1;
        }
        if (this._compare(item, this._buf[subroot]) === -1) {
            // item is less than current node - will not be in this subtree
            return -1;
        }
        if (item === this._buf[subroot]) {
            return subroot;
        } else {
            const idx = this.indexOf(item, subroot * 2 + 1);
            if (idx >= 0) {
                return idx;
            } else {
                return this.indexOf(item, subroot * 2 + 2);
            }
        }
    }

    private swim(idx: number) {
        if (idx === 0) { return; }
        let parentIdx = Math.floor((idx - 1) / 2);
        while (this._compare(this._buf[idx], this._buf[parentIdx]) === -1) {
            // swap if child < parent
            this.swap(idx, parentIdx);
            if (parentIdx === 0) { return; }
            idx = parentIdx;
            parentIdx = Math.floor((idx - 1) / 2);
        }
    }

    private sink(idx: number) {
        while (1) {
            const leftIdx = 2 * idx + 1;
            const rightIdx = 2 * idx + 2;
            // stop if no children
            if (leftIdx >= this._size) { return; }
            // get minimum child
            let minIdx = leftIdx;
            if (rightIdx < this._size && this._compare(this._buf[rightIdx], this._buf[leftIdx]) === -1) {
                minIdx = rightIdx;
            }
            // swap if parent > min child
            if (this._compare(this._buf[idx], this._buf[minIdx]) === 1) {
                this.swap(idx, minIdx);
            } else {
                return;
            }
            idx = minIdx;
        }
    }

    /** swap items at given indexes */
    private swap(idxA: number, idxB: number) {
        const temp = this._buf[idxA];
        this._buf[idxA] = this._buf[idxB];
        this._buf[idxB] = temp;
    }

    private defaultCompare(a: T, b: T): number {
        return a < b ? -1 : a > b ? 1 : 0;
    }
}
