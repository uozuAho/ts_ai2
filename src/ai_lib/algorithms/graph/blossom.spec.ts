import { Blossom } from './blossom';

describe('Blossom2', function() {
    it('simple', function() {
        const edges = [
            [0, 1, 6],  // 0 ----6----> 1
            [0, 2, 10]  // 0 ---10----> 2
        ];
        const b = new Blossom(edges);
        expect(b.hasMatch(0)).toBe(true);
        expect(b.hasMatch(1)).toBe(false);
        expect(b.hasMatch(2)).toBe(true);
        expect(b.getMatch(0)).toBe(2);
        expect(b.getMatch(1)).toBe(Blossom.NO_MATCH);
        expect(b.getMatch(2)).toBe(0);
        expect(b.getMatches()).toEqual([2, -1, 0]);
    });
});
