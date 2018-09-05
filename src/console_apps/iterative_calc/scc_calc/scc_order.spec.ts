import { SccOrder } from './scc_order';
import { DiGraph } from '../../../ai_lib/structures/graph';

describe('SccOrder', function() {

    it('should throw on emtpy scc', function() {
        const graph = new DiGraph(1);
        const scc_nodes = [];
        expect(() => new SccOrder(graph, scc_nodes)).toThrowError();
    });

    it('should throw on scc idx out of bounds', function() {
        const graph = new DiGraph(1);
        const scc_nodes = [1];
        expect(() => new SccOrder(graph, scc_nodes)).toThrowError();
    });

    it('should return [0] for single node graph', function() {
        const graph = new DiGraph(1);
        const scc_nodes = [0];
        const scco = new SccOrder(graph, scc_nodes);
        expect(scco.order()).toEqual([0]);
    });

    it('should handle initial non-scc', function() {
        const graph = new DiGraph(3);
        // no edges, no scc
        const scc_nodes = [0, 1, 2];
        const scco = new SccOrder(graph, scc_nodes);
        expect(scco.order().length).toBe(3);
    });

    it('scc first', function() {
        // 0 <--> 1 --> 2
        const graph = new DiGraph(3);
        graph.add_edge(0, 1);
        graph.add_edge(1, 0);
        graph.add_edge(1, 2);
        const scc_nodes = [0, 1];
        const scco = new SccOrder(graph, scc_nodes);
        expect(scco.order().sort()).toEqual([0, 1]);
    });

    it('scc second', function() {
        // 0 --> 1 <--> 2
        const graph = new DiGraph(3);
        graph.add_edge(0, 1);
        graph.add_edge(1, 2);
        graph.add_edge(2, 1);
        const scc_nodes = [1, 2];
        const scco = new SccOrder(graph, scc_nodes);
        expect(scco.order().sort()).toEqual([1, 2]);
    });
});
