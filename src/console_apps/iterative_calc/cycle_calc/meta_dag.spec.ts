import { DiGraph } from '../../../ai_lib/structures/graph';
import { MetaDag } from './meta_dag';

describe('MetaDag', function() {
    it('no edges', function() {
        const d = new DiGraph(4);
        const md = new MetaDag(d);

        expect(md.graph.num_nodes()).toBe(4);
        expect(md.graph.num_edges()).toBe(0);
        expect(md.nodes.length).toBe(4);
        expect(md.nodes.map(n => n.node)).toEqual([0, 1, 2, 3]);
    });

    it('2 edges, no cycle', function() {
        const d = new DiGraph(3);
        d.add_edge(0, 1);
        d.add_edge(1, 2);
        const md = new MetaDag(d);

        expect(md.graph.num_edges()).toBe(2);
        expect(md.nodes.length).toBe(3);
        expect(md.nodes.map(n => n.node)).toEqual([0, 1, 2]);
    });

    it('2 graph simple cycle', function() {
        const d = new DiGraph(2);
        d.add_edge(0, 1);
        d.add_edge(1, 0);
        const md = new MetaDag(d);

        expect(md.graph.num_edges()).toBe(0);
        expect(md.nodes.length).toBe(1);
        const nodeSet = md.nodes[0];
        expect(nodeSet.isSet).toBe(true);
        expect(nodeSet.nodes.indexOf(0)).not.toBe(-1);
        expect(nodeSet.nodes.indexOf(1)).not.toBe(-1);
    });

    it('2 graph, 2 nodes in cycle', function() {
        // 0 --> (1 <--> 2) --> 3
        const d = new DiGraph(4);
        d.add_edge(0, 1);
        d.add_edge(1, 2);
        d.add_edge(2, 1);
        d.add_edge(2, 3);
        const md = new MetaDag(d);

        expect(md.graph.num_edges()).toBe(2);
        expect(md.nodes.length).toBe(3);
        const nodeSets = md.nodes.filter(n => n.isSet);
        expect(nodeSets.length).toBe(1);
        const nodeSet = nodeSets[0];
        expect(nodeSet.nodes.length).toBe(2);
        expect(nodeSet.nodes.indexOf(1)).not.toBe(-1);
        expect(nodeSet.nodes.indexOf(2)).not.toBe(-1);
    });
});
