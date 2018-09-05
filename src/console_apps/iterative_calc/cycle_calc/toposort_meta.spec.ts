import { DiGraph } from '../../../ai_lib/structures/graph';
import { TopoSortMeta } from './toposort_meta';

describe('TopoSortCycle', function() {
    it('4 graph, 2 nodes in cycle', function() {
        // 0 --> (1 <--> 2) --> 3
        const d = new DiGraph(4);
        d.add_edge(0, 1);
        d.add_edge(1, 2);
        d.add_edge(2, 1);
        d.add_edge(2, 3);
        const t = new TopoSortMeta(d);

        expect(t.order.length).toBe(3);
        expect(t.order[0].node).toBe(0);
        expect(t.order[2].node).toBe(3);
        const metaNode = t.order[1];
        expect(metaNode.nodes.length).toBe(2);
        expect(metaNode.nodes.indexOf(1)).not.toBe(-1);
        expect(metaNode.nodes.indexOf(2)).not.toBe(-1);
    });
});
