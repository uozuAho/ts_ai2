import { CycleOrderer } from './cycle_orderer';
import { DiGraph } from '../../../ai_lib/structures/graph';

describe('CycleOrderer', function() {
    it('dag', function() {
        // 0 --> 1 --> 2
        const g = new DiGraph(3);
        g.add_edge(0, 1);
        g.add_edge(1, 2);
        const o = new CycleOrderer(g);
        expect(Array.from(o.order())).toEqual([0, 1, 2]);
    });

    it('scc in middle', function() {
        // 0 --> 1 <--> 2 --> 3
        const g = new DiGraph(4);
        g.add_edge(0, 1);
        g.add_edge(1, 2);
        g.add_edge(2, 1);
        g.add_edge(2, 3);
        const o = new CycleOrderer(g);
        o.sccIterations = 2;
        expect(Array.from(o.order())).toEqual([0, 1, 2, 1, 2, 3]);
    });
});
