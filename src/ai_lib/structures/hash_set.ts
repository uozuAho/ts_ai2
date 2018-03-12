export interface Hashable {
    hash(): string;
}

/** Contains max one item per hash, to save memory */
export class UniqueHashSet<T extends Hashable> {
    private map: Map<string, T> = new Map();

    add(thing: T) {
        if (this.contains(thing)) {
            throw new Error('already in set: ' + thing);
        }
        this.map.set(thing.hash(), thing);
    }

    size(): number {
        return this.map.size;
    }

    remove(thing: T) {
        this.map.delete(thing.hash());
    }

    contains(thing: T) : boolean {
        return this.map.has(thing.hash());
    }

    containsHash(hash: string): boolean {
        return this.map.has(hash);
    }

    getItemByHash(hash: string): T {
        if (!this.map.has(hash)) {
            throw new Error('set does not contain hash ' + hash);
        }
        return this.map.get(hash);
    }

    // todo: this should return an iterable
    items(): T[] {
        return Array.from(this.map.values());
    }
}