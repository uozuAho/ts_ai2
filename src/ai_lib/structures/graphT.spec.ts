import { Point2d } from './point2d';
import { GraphT, DiGraphT, EdgeT } from './graphT';

describe('DiGraphOfPoint2d', function() {
    let graph = new DiGraphT<Point2d>();

    beforeEach(function() {
        graph = new DiGraphT<Point2d>();
    });

    it('getAdjacent should depend on edge direction', function() {
        const node1 = graph.add_node(new Point2d(1, 1));
        const node2 = graph.add_node(new Point2d(2, 2));
        graph.add_edgeT(node1, node2, 1);
        expect(graph.adjacentT(node1)).toEqual([new EdgeT(node1, node2, 1)]);
        expect(graph.adjacentT(node2)).toEqual([]);
    });

    it('contains', function() {
        const node1 = graph.add_node(new Point2d(1, 1));
        const node2 = new Point2d(2, 2);
        expect(graph.contains(node1)).toBe(true);
        expect(graph.contains(node2)).toBe(false);
    });

    it('getNodes', function() {
        const node1 = graph.add_node(new Point2d(1, 1));
        const node2 = graph.add_node(new Point2d(2, 2));
        expect(graph.get_nodes()).toEqual([node1, node2]);
    });

    it('cost', function() {
        const node1 = graph.add_node(new Point2d(1, 1));
        const node2 = graph.add_node(new Point2d(2, 2));
        graph.add_edgeT(node1, node2, 555);
        expect(graph.edge_cost(node1, node2)).toBe(555);
    });
});

describe('GraphOfPoint2d', function() {
    let graph = new GraphT<Point2d>();

    beforeEach(function() {
        graph = new GraphT<Point2d>();
    });

    it('single edge should make both nodes adjacent to each other', function() {
        const node1 = graph.add_node(new Point2d(1, 1));
        const node2 = graph.add_node(new Point2d(2, 2));
        graph.add_edgeT(node1, node2, 1);
        expect(graph.adjacentT(node1)).toEqual([new EdgeT(node1, node2, 1)]);
        expect(graph.adjacentT(node2)).toEqual([new EdgeT(node2, node1, 1)]);
    });
});
