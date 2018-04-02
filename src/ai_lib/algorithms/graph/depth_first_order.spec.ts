import { DiGraph } from '../../structures/graph';
import { DepthFirstOrder } from './depth_first_order';

describe('DepthFirstOrder', function() {
    it('preorder small', function() {
        const g2 = new DiGraph(3);
        g2.add_edge(0, 1);
        g2.add_edge(0, 2);
        const o = new DepthFirstOrder(g2);
        expect(Array.from(o.pre())).toEqual([0, 1, 2]);
    });

    it('postorder small', function() {
        const g2 = new DiGraph(3);
        g2.add_edge(0, 1);
        g2.add_edge(0, 2);
        const o = new DepthFirstOrder(g2);
        expect(Array.from(o.post())).toEqual([1, 2, 0]);
    });

    it('reverse post small', function() {
        const g2 = new DiGraph(3);
        g2.add_edge(0, 1);
        g2.add_edge(0, 2);
        const o = new DepthFirstOrder(g2);
        expect(Array.from(o.reversePost())).toEqual([0, 2, 1]);
    });
});
