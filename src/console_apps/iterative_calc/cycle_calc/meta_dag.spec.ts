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

    it('4 graph, 2 nodes in cycle', function() {
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

    it('non-simple cycle', function() {
        //       (               )
        // 0 --> ( 1 --> 2 --> 3 )
        //       (  \     \___/  )  <-- This is one node set
        //       (   \_______/   )
        //       (               )
        const d = new DiGraph(4);
        d.add_edge(0, 1);
        d.add_edge(1, 2);
        d.add_edge(2, 3);
        d.add_edge(3, 2);
        d.add_edge(3, 1);
        const md = new MetaDag(d);

        expect(md.graph.num_edges()).toBe(1);
        expect(md.nodes.length).toBe(2);
        const nodeSets = md.nodes.filter(n => n.isSet);
        expect(nodeSets.length).toBe(1);
        const nodeSet = nodeSets[0];
        expect(nodeSet.nodes.length).toBe(3);
        expect(nodeSet.nodes.indexOf(1)).not.toBe(-1);
        expect(nodeSet.nodes.indexOf(2)).not.toBe(-1);
        expect(nodeSet.nodes.indexOf(3)).not.toBe(-1);
    });

    it('asdf', function() {
        const d = new DiGraph(50);
        d.add_edge(6, 7);
        d.add_edge(7, 31);
        d.add_edge(8, 5);
        d.add_edge(8, 20);
        d.add_edge(9, 22);
        d.add_edge(10, 8);
        d.add_edge(10, 45);
        d.add_edge(11, 11);
        d.add_edge(14, 25);
        d.add_edge(14, 30);
        d.add_edge(16, 10);
        d.add_edge(18, 40);
        d.add_edge(19, 19);
        d.add_edge(19, 33);
        d.add_edge(21, 15);
        d.add_edge(24, 12);
        d.add_edge(28, 21);
        d.add_edge(28, 32);
        d.add_edge(31, 28);
        d.add_edge(31, 47);
        d.add_edge(34, 41);
        d.add_edge(35, 34);
        d.add_edge(37, 9);
        d.add_edge(39, 37);
        d.add_edge(40, 36);
        d.add_edge(40, 49);
        d.add_edge(43, 17);
        d.add_edge(48, 0);
        const md = new MetaDag(d);
    });
});
