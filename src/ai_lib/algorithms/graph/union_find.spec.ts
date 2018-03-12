import { UnionFind } from "./union_find";

describe('UnionFind', function() {

    const count = 5;
    let uf = new UnionFind(count);

    beforeEach(function() {
        uf = new UnionFind(count);
    });

    it('initial state', function() {
        expect(uf.count()).toBe(count);
        expect(uf.connected(1,1)).toBe(true);
        expect(uf.connected(1,2)).toBe(false);
        expect(uf.find(1)).toBe(1);
    });

    it('union', function() {
        uf.union(1,2);
        expect(uf.count()).toBe(count - 1);
        expect(uf.connected(1,2)).toBe(true);
    });
});