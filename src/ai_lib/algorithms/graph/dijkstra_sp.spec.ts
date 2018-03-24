import { DiGraph } from '../../structures/graph';
import { DijkstraSP } from './dijkstra_sp';

describe('DijkstraSP', function() {

    it('graph with no edges', function() {
        const graph = new DiGraph(12);
        const d = new DijkstraSP(graph, 0);
        expect(d.distTo(1)).toBe(Number.MAX_VALUE);
        expect(d.hasPathTo(1)).toBe(false);
        expect(Array.from(d.pathTo(1))).toEqual([]);
    });

    it('simple graph', function() {
        const graph = new DiGraph(2);
        graph.add_edge(0, 1, 1);
        const d = new DijkstraSP(graph, 0);
        expect(d.distTo(1)).toBe(1);
        expect(d.hasPathTo(1)).toBe(true);
        expect(Array.from(d.pathTo(1)).length).toBe(1);
    });

    it('less simple graph', function() {
        const graph = new DiGraph(4);
        graph.add_edge(0, 1, 0.3);
        graph.add_edge(1, 2, 0.3);
        // no edge to vertex 3
        const d = new DijkstraSP(graph, 0);
        expect(d.distTo(1)).toBe(0.3);
        expect(d.distTo(2)).toBe(0.6);
        expect(d.hasPathTo(2)).toBe(true);
        expect(d.hasPathTo(3)).toBe(false);
        expect(Array.from(d.pathTo(2)).length).toBe(2);
    });
});
