import { Mst } from './mst';
import { Graph } from '../../structures/graph';

describe('UnionFind', function() {

    beforeEach(function() {
    });

    it('triangle graph, all weights 1', function() {
        const graph = new Graph(3);
        graph.add_edge(0, 1);
        graph.add_edge(1, 2);
        graph.add_edge(2, 0);
        const mst = new Mst(graph);
        expect(mst.get_edges().length).toBe(2);
    });

    it('triangle graph, different weights', function() {
        const graph = new Graph(3);
        graph.add_edge(0, 1, 1);
        graph.add_edge(1, 2, 1);
        graph.add_edge(2, 0, 2);
        const mst = new Mst(graph);
        expect(mst.get_edges().length).toBe(2);
        const mst_weight = mst.get_edges().reduce((a, b) => a + b.weight, 0);
        expect(mst_weight).toBe(2);
    });
});
