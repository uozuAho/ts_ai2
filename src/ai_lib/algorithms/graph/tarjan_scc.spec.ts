import { DiGraph } from '../../structures/graph';
import { TarjanSCC } from './tarjan_scc';

describe('TransitiveClosure', function() {
    it('disconnected 2 graph', function() {
        const g = new DiGraph(2);
        const scc = new TarjanSCC(g);
        expect(scc.count()).toBe(0);
    });

    it('connected 3 graph', function() {
        const g = new DiGraph(3);
        g.add_edge(0, 1);
        g.add_edge(1, 2);
        const scc = new TarjanSCC(g);
        expect(scc.count()).toBe(0);
    });

    it('strongly connected 3 graph', function() {
        const g = new DiGraph(3);
        g.add_edge(0, 1);
        g.add_edge(1, 2);
        g.add_edge(2, 0);
        const scc = new TarjanSCC(g);
        expect(scc.count()).toBe(1);
        expect(scc.id(0)).toBe(0);
        expect(scc.id(1)).toBe(0);
        expect(scc.id(2)).toBe(0);
        expect(scc.stronglyConnected(0, 1)).toBe(true);
        expect(scc.stronglyConnected(1, 0)).toBe(true);
        expect(scc.stronglyConnected(1, 2)).toBe(true);
    });
});
