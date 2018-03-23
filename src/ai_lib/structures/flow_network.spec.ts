import { FlowNetwork, FlowEdge } from './flow_network';

describe('FlowNetwork', function() {
    let fn: FlowNetwork;
    let edge: FlowEdge;

    beforeEach(() => {
        fn = new FlowNetwork(2);
        edge = new FlowEdge(0, 1, 1);
        fn.add_flow_edge(edge);
    });

    it('degree', function() {
        expect(fn.degree(0)).toBe(1);
        expect(fn.degree(1)).toBe(1);
    });

    it('edges', function() {
        expect(fn.edges()).toEqual([edge]);
    });

    it('incident', function() {
        expect(fn.incident(0)).toEqual([edge]);
        expect(fn.incident(1)).toEqual([edge]);
    });

    it('num_edges', function() {
        expect(fn.num_edges()).toBe(1);
    });
});

describe('FlowEdge', function() {
    it('residual capacity should be directed', function() {
        const e = new FlowEdge(0, 1, 1);
        expect(e.residual_capacity_to(1)).toBe(1);
        expect(e.residual_capacity_to(0)).toBe(0);
    });

    it('should throw if flow goes over capacity', function() {
        const e = new FlowEdge(0, 1, 1);
        expect(() => e.add_residual_flow_to(1, 2)).toThrow();
    });

    it('should throw if flow goes negative', function() {
        const e = new FlowEdge(0, 1, 1);
        expect(() => e.add_residual_flow_to(0, 1)).toThrow();
    });
});
