export class FifoQueue<T> {
    private start: QueueItem<T> = null;
    private end: QueueItem<T> = null;

    public push(thing: T) {
        if (this.isEmpty()) {
            this.start = new QueueItem(thing);
            this.end = this.start;
        }
        else {
            let newEnd = new QueueItem(thing);
            this.end.next = newEnd;
            this.end = newEnd;
        }
    }

    public pop() : T {
        if (this.isEmpty()) throw new Error('queue is empty');
        let oldStart = this.start;
        this.start = this.start.next;
        return oldStart.data;
    }

    public isEmpty(): boolean {
        return this.start == null;
    }
}

class QueueItem<T> {
    public data: T
    public next: QueueItem<T>
    constructor(thing: T) {
        this.data = thing;
    }
}