import { BinaryHeap } from './binary_heap';

/** Priority queue. Defaults to min-priority queue, but this can be
 *  changed by passing a compare function to the constructor.
 */
export class PriorityQueue<T> {

    private _heap: BinaryHeap<T>;

    /**
     * @param data existing data
     * @param compare compare function. By default, this is the 'standard
     * compare', which returns -1 if a < b etc. This queue keeps the lowest value
     * at the top of the queue, so if you want a max-priority queue, pass
     * a compare function like a < b ? 1 : a > b ? -1 : 0;
     */
    constructor(data: T[] = [], compare: (a: T, b: T) => number = null) {
        if (compare !== null) {
            this._heap = new BinaryHeap(compare);
        } else {
            this._heap = new BinaryHeap();
        }
        for (const item of data) {
            this._heap.add(item);
        }
    }

    public push(item: T): void {
        this._heap.add(item);
    }

    public pop(): T {
        return this._heap.removeMin();
    }
}
