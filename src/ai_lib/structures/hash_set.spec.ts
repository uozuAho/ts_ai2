import { Hashable, UniqueHashSet } from './hash_set';

class TestHashable<T> implements Hashable {
    private thing: T;

    constructor(thing: T) {
        this.thing = thing;
    }

    hash(): string {
        return '' + this.thing;
    }
}

describe('UniqueHashSet', function() {
    let set = new UniqueHashSet();

    beforeEach(function() {
        set = new UniqueHashSet();
    });

    it('should contain 1 but not 2', function() {
        set.add(new TestHashable<number>(1));
        expect(set.contains(new TestHashable<number>(1))).toBe(true);
        expect(set.contains(new TestHashable<number>(2))).toBe(false);
    });

    it('should throw when attempting to add an existing hash', function() {
        set.add(new TestHashable<number>(1));
        expect(function() {set.add(new TestHashable<number>(1)); }).toThrowError();
    });

    it('should remove 1 but not 2', function() {
        set.add(new TestHashable<number>(1));
        set.add(new TestHashable<number>(2));
        set.remove(new TestHashable<number>(1));
        expect(set.contains(new TestHashable<number>(1))).toBe(false);
        expect(set.contains(new TestHashable<number>(2))).toBe(true);
    });

    it('should have correct size', function() {
        expect(set.size()).toBe(0);
        set.add(new TestHashable<number>(1));
        expect(set.size()).toBe(1);
    });

    it('should return all values', function() {
        const hashable1 = new TestHashable(1);
        const hashable2 = new TestHashable(2);

        set.add(hashable1);
        expect(set.items()).toEqual([hashable1]);
        set.add(hashable2);
        expect(set.items()).toEqual([hashable1, hashable2]);
    });
});
