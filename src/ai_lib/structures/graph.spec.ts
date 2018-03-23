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
    it('num_edges 1', function() {
        const g = new DiGraph(2);
        g.add_edge(0, 1);
        expect(g.num_edges()).toBe(1);
        expect(g.get_edges().length).toBe(1);
    });

    it('num_edges 3', function() {
        const g = new DiGraph(3);
        g.add_edge(0, 1);
        g.add_edge(0, 2);
        g.add_edge(1, 2);
        expect(g.num_edges()).toBe(3);
        expect(g.get_edges().length).toBe(3);
    });
});
