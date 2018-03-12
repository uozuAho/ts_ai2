import { TinyQueue } from 'tinyqueue';

export class PriorityQueue<T> {

    // just a typed wrapper around TinyQueue
    private _tinyqueue: any;
    private _compare: (a: T, b: T) => number;

    constructor(data: T[] = [], compare: (a: T, b: T) => number = null) {
        if (compare !== null)
            this._tinyqueue = new TinyQueue(data, compare);
        else
            this._tinyqueue = new TinyQueue(data);
        this._compare = compare;
    }

    public push(item: T) : void {
        this._tinyqueue.push(item);
    }

    public pop() : T {
        return this._tinyqueue.pop();
    }
}