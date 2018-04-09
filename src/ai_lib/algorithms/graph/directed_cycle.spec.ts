import { DirectedCycle } from './directed_cycle';
import { DiGraph } from '../../structures/graph';

function hasSameOrder(a: number[], b: number[]): boolean {
    if (a.length !== b.length) {
        throw new Error(`array lengths differ: ${a.length} != ${b.length}`);
    }
    const bOffset = b.indexOf(a[0]);
    for (let i = 0; i < a.length; i++) {
        const bIdx = (i + bOffset) % b.length;
        if (a[i] !== b[bIdx]) {
            return false;
        }
    }
    return true;
}

function assertCycleContainsSequence(cycle: number[], sequence: number[]) {

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
        const expectedSeq = [0, 1];
        if (!hasSameOrder(expectedSeq, c.getCycle().slice(0, 2))) {
            fail(`expected sequence ${expectedSeq} not found in cycle. Cycle: ${c.getCycle()}`);
        }
    });

    it('asdf', function() {
        const g = new DiGraph(3);
        g.add_edge(0, 1);
        g.add_edge(1, 2);
        g.add_edge(2, 0);
        const c = new DirectedCycle(g);
        expect(c.hasCycle()).toBe(true);
        expect(c.getCycle().length).toBe(4);
    });
});
