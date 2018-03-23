import * as TinyQueue from 'tinyqueue';

/** Priority queue. Defaults to min-priority queue, but this can be
 *  changed by passing a compare function to the constructor.
 */
export class PriorityQueue<T> {

    // just a typed wrapper around TinyQueue
    private _tinyqueue: any;
    private _compare: (a: T, b: T) => number;

    /**
     * @param data existing data
     * @param compare compare function. By default, this is the 'standard
     * compare', which returns -1 if a < b etc. This queue keeps the lowest value
     * at the top of the queue, so if you want a max-priority queue, pass
     * a compare function like a < b ? 1 : a > b ? -1 : 0;
     */
    constructor(data: T[] = [], compare: (a: T, b: T) => number = null) {
        if (compare !== null) {
            this._tinyqueue = new TinyQueue(data, compare);
        } else {
            this._tinyqueue = new TinyQueue(data);
        }
        this._compare = compare;
    }

    public push(item: T): void {
        this._tinyqueue.push(item);
    }

    public pop(): T {
        return this._tinyqueue.pop();
    }
}
