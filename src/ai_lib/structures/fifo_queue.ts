export class FifoQueue<T> {
    private start: QueueItem<T> = null;
    private end: QueueItem<T> = null;

    public push(thing: T) {
        if (this.isEmpty()) {
            this.start = new QueueItem(thing);
            this.end = this.start;
        } else {
            const newEnd = new QueueItem(thing);
            this.end.next = newEnd;
            this.end = newEnd;
        }
    }

    public pop(): T {
        if (this.isEmpty()) { throw new Error('queue is empty'); }
        const oldStart = this.start;
        this.start = this.start.next;
        return oldStart.data;
    }

    public isEmpty(): boolean {
        return this.start == null;
    }

    public* items(): IterableIterator<T> {
        let current = this.start;
        while (current !== null) {
            yield current.data;
            current = current.next;
        }
    }
}

class QueueItem<T> {
    constructor(public data: T, public next: QueueItem<T> = null) {}
}
