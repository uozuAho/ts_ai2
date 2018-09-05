import { SccGraph } from './scc_graph';
import { DiGraph } from '../../../ai_lib/structures/graph';

describe('SccGraph', function() {

    it('single 3 scc', function() {
        const graph = new DiGraph(3);
        graph.add_edge(0, 1);
        graph.add_edge(1, 2);
        graph.add_edge(2, 0);
        const sccGraph = new SccGraph(graph);

        expect(sccGraph.num_nodes()).toBe(1);
        expect(sccGraph.sourceNodes(0)).toEqual([0, 1, 2]);
    });

    it('one 3 scc plus 1 node', function() {
        const graph = new DiGraph(4);
        // 3 scc
        graph.add_edge(0, 1);
        graph.add_edge(1, 2);
        graph.add_edge(2, 0);
        // extra node
        graph.add_edge(2, 3);

        const sccGraph = new SccGraph(graph);

        // should have 2 nodes
        expect(sccGraph.num_nodes()).toBe(2);

        // combination of all scc.sourceNodes should equal the source nodes
        let all_nodes = [];
        for (let i = 0; i < sccGraph.num_nodes(); i++) {
            all_nodes = all_nodes.concat(sccGraph.sourceNodes(i));
        }
        all_nodes = all_nodes.sort();
        expect(all_nodes).toEqual([0, 1, 2, 3]);
    });
});
