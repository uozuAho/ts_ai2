import { DiGraph } from '../../structures/graph';
import { TransitiveClosure } from './transitive_closure';

describe('TransitiveClosure', function() {
    it('disconnected 2 graph', function() {
        const g = new DiGraph(2);
        const tc = new TransitiveClosure(g);
        expect(tc.reachable(0, 1)).toBe(false);
    });

    it('connected 3 graph', function() {
        const g = new DiGraph(3);
        g.add_edge(0, 1);
        g.add_edge(1, 2);
        const tc = new TransitiveClosure(g);
        expect(tc.reachable(0, 1)).toBe(true);
        expect(tc.reachable(0, 2)).toBe(true);
        expect(tc.reachable(2, 0)).toBe(false);
    });

    it('strongly connected 3 graph', function() {
        const g = new DiGraph(3);
        g.add_edge(0, 1);
        g.add_edge(1, 2);
        g.add_edge(2, 0);
        const tc = new TransitiveClosure(g);
        expect(tc.reachable(0, 1)).toBe(true);
        expect(tc.reachable(0, 2)).toBe(true);
        expect(tc.reachable(2, 0)).toBe(true);
    });
});
