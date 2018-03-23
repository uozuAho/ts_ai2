import { IndexedPriorityQueue } from './indexed_priority_queue';

describe('IndexedPriorityQueue', function() {
    it('simple order', function() {
        const q = new IndexedPriorityQueue<string>(5);
        q.insert(0, 'a');
        q.insert(1, 'b');
        q.insert(2, 'c');

        expect(q.contains(0)).toBe(true);
        expect(q.isEmpty()).toBe(false);

        expect(q.keyOf(0)).toBe('a');
        expect(q.minIndex()).toBe(0);
        expect(q.minKey()).toBe('a');
        expect(q.size()).toBe(3);

        expect(Array.from(q.iterator())).toEqual([0, 1, 2]);
        // multiple iterator calls should return the same
        expect(Array.from(q.iterator())).toEqual([0, 1, 2]);
    });

    it('different order', function() {
        const q = new IndexedPriorityQueue<string>(5);
        q.insert(0, 'c');
        q.insert(1, 'b');
        q.insert(2, 'a');

        expect(q.contains(0)).toBe(true);
        expect(q.isEmpty()).toBe(false);

        expect(q.keyOf(0)).toBe('c');
        expect(q.minIndex()).toBe(2);
        expect(q.minKey()).toBe('a');
        expect(q.size()).toBe(3);

        expect(Array.from(q.iterator())).toEqual([2, 1, 0]);
    });
});
