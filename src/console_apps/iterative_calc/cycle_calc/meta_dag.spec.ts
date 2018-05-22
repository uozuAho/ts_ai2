import { DiGraph } from '../../../ai_lib/structures/graph';
import { MetaDag } from './meta_dag';
import { MetaNode } from './meta_node';
import { Edge } from '../../../ai_lib/structures/igraph';

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

    it('self loop', function() {
        const d = new DiGraph(3);
        d.add_edge(0, 0);
        d.add_edge(0, 1);

        d.add_edge(2, 2);
        const md = new MetaDag(d);
    });

    it('rebuild graph: same', function() {
        const g1 = new DiGraph(3);
        g1.add_edge(0, 1);
        g1.add_edge(1, 2);
        const nodes = [
            new MetaNode(false, 0, null),
            new MetaNode(false, 1, null),
            new MetaNode(false, 2, null)
        ];
        const g2 = MetaDag.rebuildGraph(g1, nodes, nodes);
        expect(g1.num_nodes()).toBe(g2.num_nodes());
        expect(g1.get_edges()).toEqual(g2.get_edges());
    });

    it('rebuild graph: reorder', function() {
        const g1 = new DiGraph(3);
        g1.add_edge(0, 1);
        g1.add_edge(1, 2);
        const oldNodes = [
            new MetaNode(false, 0, null),
            new MetaNode(false, 1, null),
            new MetaNode(false, 2, null)
        ];
        const newNodes = [oldNodes[1], oldNodes[2], oldNodes[0]];
        const g2 = MetaDag.rebuildGraph(g1, oldNodes, newNodes);
        expect(g1.num_nodes()).toBe(g2.num_nodes());
        expect(g1.num_edges()).toBe(g2.num_edges());
        let edges = g2.get_edges().filter(e => e.from === 1 && e.to === 2);
        expect(edges.length).toBe(1);
        edges = g2.get_edges().filter(e => e.from === 2 && e.to === 0);
        expect(edges.length).toBe(1);
    });
});
