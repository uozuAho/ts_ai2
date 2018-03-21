import { FifoQueue } from './fifo_queue';

describe('FifoQueue', function() {
    let queue = new FifoQueue<number>();

    beforeEach(function() {
        queue = new FifoQueue<number>();
    });

    it('new queue should be empty', function() {
        expect(queue.isEmpty()).toBe(true);
    });

    it('push and pop', function() {
        queue.push(1);
        expect(queue.isEmpty()).toBe(false);
        expect(queue.pop()).toBe(1);
        expect(queue.isEmpty()).toBe(true);
    });

    it('push and pop many', function() {
        queue.push(1);
        queue.push(2);
        queue.push(3);
        expect(queue.pop()).toBe(1);
        expect(queue.pop()).toBe(2);
        expect(queue.pop()).toBe(3);
    });

    it('pop empty should throw', function() {
        expect(function() {queue.pop(); }).toThrowError();
    });

    it('get items twice should return same', function() {
        queue.push(1);
        queue.push(2);
        queue.push(3);
        const a = Array.from(queue.items());
        const b = Array.from(queue.items());
        expect(a).toEqual(b);
        queue.pop();
        const c = Array.from(queue.items());
        const d = Array.from(queue.items());
        expect(c).toEqual(d);
    });
});
