import { DirectedCycle } from './directed_cycle';
import { DiGraph } from '../../structures/graph';

describe('DirectedCycle', function() {
    it('should not find a cycle if there is none', function() {
        const g = new DiGraph(2);
        g.add_edge(0, 1);
        const c = new DirectedCycle(g);
        expect(c.hasCycle()).toBe(false);
        expect(c.getCycle()).toEqual([]);
    });

    it('should find a cycle if there is one', function() {
        const g = new DiGraph(2);
        g.add_edge(0, 1);
        g.add_edge(1, 0);
        const c = new DirectedCycle(g);
        expect(c.hasCycle()).toBe(true);
        expect(c.getCycle().length).toBe(3);
    });
});
