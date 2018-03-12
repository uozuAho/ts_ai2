import { MaxFlow } from "./max_flow";
import { FlowNetwork, FlowEdge } from "../../structures/flow_network";

describe('MaxFlow', function() {

    beforeEach(function() {
    });

    it('simple', function() {
        let flow_net = new FlowNetwork(2);
        let edge = new FlowEdge(0, 1, 1);
        flow_net.add_edge(edge);
        let max_flow = new MaxFlow(flow_net, 0, 1);

        expect(max_flow.is_in_cut(0)).toBe(true);
        expect(max_flow.is_in_cut(1)).toBe(false);
        expect(max_flow.value()).toBe(1);
        expect(max_flow.edges()).toEqual(new Set([edge]));
    });

    it('multipath', function() {
        // two paths from 0 to 3, each with 1 capacity
        let flow_net = new FlowNetwork(4);
        flow_net.add_edge(new FlowEdge(0, 1, 1));
        flow_net.add_edge(new FlowEdge(0, 2, 1));
        flow_net.add_edge(new FlowEdge(1, 3, 1));
        flow_net.add_edge(new FlowEdge(2, 3, 1));
        let max_flow = new MaxFlow(flow_net, 0, 3);

        expect(max_flow.is_in_cut(0)).toBe(true);
        expect(max_flow.is_in_cut(3)).toBe(false);
        expect(max_flow.value()).toBe(2);
        expect(max_flow.edges().size).toBe(4);
    });

    it('undirected', function() {
        let flow_net = new FlowNetwork(2);
        flow_net.add_edge(new FlowEdge(0, 1, 1));
        flow_net.add_edge(new FlowEdge(1, 0, 1));
        let max_flow = new MaxFlow(flow_net, 0, 1);

        expect(max_flow.value()).toBe(1);
        expect(max_flow.edges().size).toBe(1);
    });

    it('undirected multipath', function() {
        let flow_net = new FlowNetwork(5);

        // 0 -> (1, 2)
        flow_net.add_edge(new FlowEdge(0, 1, 1));
        flow_net.add_edge(new FlowEdge(1, 0, 1));
        flow_net.add_edge(new FlowEdge(0, 2, 1));
        flow_net.add_edge(new FlowEdge(2, 0, 1));

        // source
        // 1 -> (2, 3, 4)
        flow_net.add_edge(new FlowEdge(1, 2, 1));
        flow_net.add_edge(new FlowEdge(2, 1, 1));
        flow_net.add_edge(new FlowEdge(1, 3, 1));
        flow_net.add_edge(new FlowEdge(3, 1, 1));
        flow_net.add_edge(new FlowEdge(1, 4, 1));
        flow_net.add_edge(new FlowEdge(4, 1, 1));

        // sink
        // 2 -> (3, 4)
        flow_net.add_edge(new FlowEdge(2, 3, 1));
        flow_net.add_edge(new FlowEdge(3, 2, 1));
        flow_net.add_edge(new FlowEdge(2, 4, 1));
        flow_net.add_edge(new FlowEdge(4, 2, 1));

        // 3 -> 4
        flow_net.add_edge(new FlowEdge(3, 4, 1));
        flow_net.add_edge(new FlowEdge(4, 3, 1));

        let max_flow = new MaxFlow(flow_net, 1, 2);

        // degree of source and sink is 4
        expect(max_flow.value()).toBe(4);
        expect(max_flow.edges().size).toBe(7);
    });
});
