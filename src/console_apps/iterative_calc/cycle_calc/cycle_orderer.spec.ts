import { DiGraph } from '../../../ai_lib/structures/graph';
import { CycleOrderer } from './cycle_orderer';

describe('CycleOrderer', function() {
    it('2 graph, no cycle', function() {
        const g = new DiGraph(2);
        g.add_edge(0, 1);
        const c = new CycleOrderer(g);
        expect(c.order).toEqual([0, 1]);
    });

    it('2 graph, cycle', function() {
        const g = new DiGraph(2);
        g.add_edge(0, 1);
        g.add_edge(1, 0);
        const c = new CycleOrderer(g);
        expect(c.order.length).toBe(2);
    });

    it('3 graph, 2 cycles', function() {
        const g = new DiGraph(3);
        g.add_edge(0, 1);
        g.add_edge(1, 2);
        g.add_edge(2, 1);
        g.add_edge(1, 0);
        const c = new CycleOrderer(g);
        expect(c.order.length).toBe(3);
    });
});
