import { EulerianCycle } from './euler_cycle';
import { Graph } from '../../structures/graph';

describe('EulerCycle', function() {
    it('connected 3 graph', function() {
        const g = new Graph(3);
        g.add_edge(0, 1);
        g.add_edge(1, 2);
        g.add_edge(2, 0);
        const e = new EulerianCycle(g);
        expect(e.hasEulerianCycle()).toBe(true);
        expect(Array.from(e.cycle()).length).toBe(4);
    });

    it('euler path', function() {
        const g = new Graph(3);
        g.add_edge(0, 1);
        g.add_edge(1, 2);
        const e = new EulerianCycle(g);
        expect(e.hasEulerianCycle()).toBe(false);
        expect(Array.from(e.cycle()).length).toBe(0);
    });
});
