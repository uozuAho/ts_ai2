import { DiGraph } from '../../structures/graph';
import { TopoSort } from './toposort';
import { VisNetworkDef } from '../../../libs/vis_wrappers/vis_network';

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

    /**
     *     0
     *    / \
     *   1   2
     *    \ /
     *     3
     */
    it('multipath', function() {
        const g = new DiGraph(4);
        g.add_edge(0, 1);
        g.add_edge(0, 2);
        g.add_edge(1, 3);
        g.add_edge(2, 3);
        const t = new TopoSort(g);
        expect(t.hasOrder()).toBe(true);

        const order = Array.from(t.order());
        expect(order.length).toBe(4);
        expect(order[0]).toBe(0);
        expect(order[3]).toBe(3);
    });
});
