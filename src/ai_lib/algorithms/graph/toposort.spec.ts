import { DiGraph } from '../../structures/graph';
import { TopoSort } from './toposort';

describe('TopoSort', function() {
    it('simple', function() {
        const g = new DiGraph(3);
        g.add_edge(0, 1);
        g.add_edge(1, 2);
        const t = new TopoSort(g);
        expect(t.hasOrder()).toBe(true);
        expect(Array.from(t.order())).toEqual([0, 1, 2]);
    });

    it('cycle', function() {
        const g = new DiGraph(3);
        g.add_edge(0, 1);
        g.add_edge(1, 2);
        g.add_edge(2, 0);
        const t = new TopoSort(g);
        expect(t.hasOrder()).toBe(false);
        expect(Array.from(t.order())).toEqual([]);
    });
});
