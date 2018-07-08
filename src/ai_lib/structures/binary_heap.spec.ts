import { BinaryHeap } from './binary_heap';

describe('MinQueue number', function() {

    let h = new BinaryHeap<number>();

    beforeEach(function() {
        h = new BinaryHeap();
    });

    it('should throw on empty peek', function() {
        expect(() => h.peekMin()).toThrow();
    });

    it('should throw on empty removes', function() {
        expect(() => h.removeMin()).toThrow();
        expect(() => h.remove(1)).toThrow();
    });

    it('should have 0 size when empty', function() {
        expect(h.size()).toBe(0);
    });

    it('should return false on empty.contains', function() {
        expect(h.contains(234)).toBe(false);
    });

    it('add and remove single', function() {
        h.add(55);
        expect(h.contains(55)).toBe(true);
        expect(h.peekMin()).toBe(55);
        expect(h.size()).toBe(1);
        expect(h.removeMin()).toBe(55);
        expect(h.size()).toBe(0);
        expect(h.contains(55)).toBe(false);
    });

    it('add and remove sequence', function() {
        h.add(1);
        h.add(2);
        h.add(3);
        expect(h.removeMin()).toBe(1);
        expect(h.removeMin()).toBe(2);
        expect(h.removeMin()).toBe(3);
    });

    it('add and remove reverse sequence', function() {
        h.add(3);
        h.add(2);
        h.add(1);
        expect(h.removeMin()).toBe(1);
        expect(h.removeMin()).toBe(2);
        expect(h.removeMin()).toBe(3);
    });

    it('should throw on removing non-existent item', function() {
        h.add(3);
        expect(() => h.remove(4)).toThrow();
    });

    it('remove', function() {
        h.add(3);
        h.add(2);
        h.add(1);
        h.remove(2);
        expect(h.peekMin()).toBe(1);
        expect(h.size()).toBe(2);
    });
});
