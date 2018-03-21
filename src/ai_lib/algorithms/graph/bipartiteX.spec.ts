import { BipartiteX } from './bipartiteX';
import { Graph } from '../../structures/graph';

describe('bipartiteX', function() {

    beforeEach(function() {
    });

    it('graph with no edges should be bipartite', function() {
        const graph = new Graph(12);
        const b = new BipartiteX(graph);
        expect(b.isBipartite()).toBe(true);
    });

    it('graph with 2 nodes and 1 edge should be bipartite', function() {
        const graph = new Graph(2);
        graph.add_edge(0, 1);
        const b = new BipartiteX(graph);
        expect(b.isBipartite()).toBe(true);
        // nodes should not be same color
        expect(b.color(0)).not.toBe(b.color(1));
        expect(Array.from(b.oddCycle()).length).toBe(0);
    });

    it('graph with odd cycle should not be bipartite', function() {
        const graph = new Graph(3);
        graph.add_edge(0, 1);
        graph.add_edge(1, 2);
        graph.add_edge(2, 0);
        const b = new BipartiteX(graph);
        expect(b.isBipartite()).toBe(false);
        const oddCycle = Array.from(b.oddCycle());
        expect(oddCycle.length).toEqual(4);
        expect(oddCycle[0]).toEqual(oddCycle[oddCycle.length - 1]);
    });
});
