import { Graph } from '../../structures/graph';
import { HopcroftKarp } from './hopcroft_karp';

describe('HopcroftKarp', function() {

    it('graph with no edges', function() {
        const graph = new Graph(12);
        const hk = new HopcroftKarp(graph);
        expect(hk.isPerfect()).toBe(false);
        expect(hk.size()).toBe(0);
        for (let i = 0; i < 12; i++) {
            // no vertices in cover since no edges
            expect(hk.inMinVertexCover(i)).toBe(false);
            expect(hk.isMatched(i)).toBe(false);
            expect(hk.mate(i)).toBe(-1);
        }
    });

    it('connected 2 graph', function() {
        const graph = new Graph(2);
        graph.add_edge(0, 1);
        const hk = new HopcroftKarp(graph);
        expect(hk.isPerfect()).toBe(true);
        expect(hk.size()).toBe(1);
        expect(hk.isMatched(0)).toBe(true);
        expect(hk.isMatched(1)).toBe(true);
        expect(hk.mate(0)).toBe(1);
        expect(hk.mate(1)).toBe(0);
        expect(hk.minVertexCover().length).toBe(1);
    });

    it('connected 3 graph should fail since not bipartite', function() {
        const graph = new Graph(3);
        graph.add_edge(0, 1);
        graph.add_edge(0, 2);
        graph.add_edge(1, 2);
        expect(() => new HopcroftKarp(graph)).toThrow();
    });
});
