import { DirectedCycle } from './directed_cycle';
import { DiGraph } from '../../structures/graph';

function assertContainsSequence(a: number[], seq: number[]) {
    const aOffset = a.indexOf(seq[0]);
    for (let i = 0; i < seq.length; i++) {
        const aIdx = (i + aOffset) % a.length;
        if (a[aIdx] !== seq[i]) {
            fail(`expected sequence ${seq} not found in ${a}`);
        }
    }
}

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
        assertContainsSequence(c.getCycle(), [0, 1]);
    });

    it('cycle should be in correct order', function() {
        const g = new DiGraph(3);
        g.add_edge(0, 1);
        g.add_edge(1, 2);
        g.add_edge(2, 0);
        const c = new DirectedCycle(g);
        expect(c.hasCycle()).toBe(true);
        expect(c.getCycle().length).toBe(4);
        assertContainsSequence(c.getCycle(), [0, 1, 2]);
    });
});
