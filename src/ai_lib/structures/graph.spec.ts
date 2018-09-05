import { Graph, DiGraph } from './graph';

describe('Graph', function() {
    it('num_edges 1', function() {
        const g = new Graph(2);
        g.add_edge(0, 1);
        expect(g.num_edges()).toBe(1);
        expect(g.get_edges().length).toBe(1);
    });

    it('num_edges 3', function() {
        const g = new Graph(3);
        g.add_edge(0, 1);
        g.add_edge(0, 2);
        g.add_edge(1, 2);
        expect(g.num_edges()).toBe(3);
        expect(g.get_edges().length).toBe(3);
    });
});

describe('DiGraph', function() {

    let graph3: DiGraph;

    beforeEach(function() {
        graph3 = new DiGraph(3);
        graph3.add_edge(0, 1);
        graph3.add_edge(0, 2);
        graph3.add_edge(1, 2);
    });

    it('num_edges 1', function() {
        const g = new DiGraph(2);
        g.add_edge(0, 1);
        expect(g.num_edges()).toBe(1);
        expect(g.get_edges().length).toBe(1);
    });

    it('num_edges 3', function() {
        expect(graph3.num_edges()).toBe(3);
        expect(graph3.get_edges().length).toBe(3);
    });

    it('remove edge', function() {
        graph3.remove_edge(0, 1);
        expect(graph3.num_edges()).toBe(2);
        expect(graph3.get_edges().length).toBe(2);
    });

    it('remove non-existent edge', function() {
        expect(() => graph3.remove_edge(1, 0)).toThrow();
    });
});
