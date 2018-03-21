import { DataSet, Network } from 'vis/index-network';
import { Guid } from '../guid/guid';

// Note: if using angular, add the following line to your
// global styles (src/styles.css)
// @import 'vis/dist/vis-network.min.css';

/** vis Network wrapper */
export class VisNetwork {

    private _nextNodeId: number;
    private _nextEdgeId: number;

    private _nodes: DataSet;
    private _edges: DataSet;

    private _network: Network;

    /** create a vis network
     * @param container: HTML element to place network in
     * @param options: vis network options. See http://visjs.org/docs/network/
     */
    constructor(container: HTMLElement, options: any = null) {
        this._nextNodeId = 0;
        this._nextEdgeId = 0;

        this._nodes = new DataSet([]);
        this._edges = new DataSet([]);

        const data = {
            nodes: this._nodes,
            edges: this._edges
        };
        if (options == null) {
            options = {};
        }

        this._network = new Network(container, data, options);
    }

    public setData(data: VisNetworkDef): void {
        const nodes = new DataSet(data.nodes.map(n => this.toVisNode(n)));
        const edges = new DataSet(data.edges.map(e => this.toVisEdge(e)));
        this._network.setData({nodes: nodes, edges: edges});
        this._nodes = nodes;
        this._edges = edges;
    }

    public toNetworkDef(): VisNetworkDef {
        const nodes = this._nodes.map(n => new VisNode(n.id, n.label, n.x, n.y));
        const edges = this._edges.map(e => new VisEdge(e.from, e.to));
        return new VisNetworkDef(nodes, edges);
    }

    /** Add a node to the network at given coords */
    public addNode(x: number, y: number, label: string = null) {
        const id = this._nextNodeId++;
        this._nodes.add({
            id: id,
            label: label == null ? '' + id : label,
            x: x,
            y: y
        });
        return id;
    }

    /** Add edge between specified node ids */
    public addEdge(edge: VisEdge): string | number {
        const ids = this._edges.add({
            id: edge.id,
            from: edge.from,
            to: edge.to
        });
        const id = ids[0];
        edge.id = id;
        return id;
    }

    public nodeCount(): number {
        return this._nodes.length;
    }

    public getNodes(): VisNode[] {
        return this._nodes.map(n => new VisNode(n.id, n.label, n.x, n.y));
    }

    public getEdges(): VisEdge[] {
        return this._edges.map(e => new VisEdge(e.from, e.to, e.id));
    }

    /** Returns an array of node ids */
    public getSelectedNodes(): any[] {
        return this._network.getSelectedNodes();
    }

    /** Set handler for click events. Overrides any existing click handlers (?) */
    public setClickHandler(func: (params: any) => void) {
        this._network.on('click', func);
    }

    public setDoubleClickHandler(func: (params: any) => void) {
        this._network.on('doubleClick', func);
    }

    public setSelectNodeHandler(func: (params: any) => void) {
        this._network.on('selectNode', func);
    }

    public redraw(): void {
        this._network.redraw();
    }

    /** Enable editing of the network. This is managed by the vis
     *  library, but some user hooks are available. See http://visjs.org/docs/network/manipulation.html
     */
    public enableEditMode(): void {
        this._network.enableEditMode();
    }

    public disableEditMode(): void {
        this._network.disableEditMode();
    }

    /** Delete all selected nodes/edges */
    public deleteSelected(): void {
        this._network.deleteSelected();
    }

    public addNodeMode(): void {
        this._network.addNodeMode();
    }

    public editNodeMode(): void {
        this._network.editNode();
    }

    public addEdgeMode(): void {
        this._network.addEdgeMode();
    }

    public getNode(id: string | number): VisNode {
        return this._nodes.get(id);
    }

    public getEdge(id: string | number): VisEdge {
        return this._edges.get(id);
    }

    public updateNode(node: VisNode) {
        this._nodes.update(node);
    }

    public updateEdge(edge: VisEdge) {
        this._edges.update(edge);
    }

    public selectNodes(ids: any[]) {
        this._network.selectNodes(ids);
    }

    public getCurrentViewBounds(): {minx: number, miny: number, maxx: number, maxy: number} {
        const frame = this._network.canvas.frame;
        return {
            minx: frame.clientLeft,
            miny: frame.clientTop,
            maxx: frame.clientLeft + frame.clientWidth,
            maxy: frame.clientTop + frame.clientHeight
        };
    }

    public deleteEdge(id: string | number) {
        this._edges.remove(id);
    }

    public deleteEdges() {
        this._edges.clear();
    }

    /** Convert a node definition into a vis node */
    private toVisNode(node_def: VisNode): any {
        return node_def;
    }

    private toVisEdge(edge_def: VisEdge): any {
        return edge_def;
    }

    public get isPhysicsEnabled(): boolean {
        return this._network.physics.enabled;
    }

    public set isPhysicsEnabled(val: boolean) {
        this._network.setOptions({physics: {enabled: val}});
    }
}

/** Definition of a network */
export class VisNetworkDef {
    public constructor(public nodes: VisNode[] = [], public edges: VisEdge[] = []) {}
}

/** Definition of a vis network node */
export class VisNode {
    /** Unique node id */
    public id: string | number;
    /** Label to display on node */
    public label: string;
    /** x coordinate (canvas) */
    public x: number;
    /** y coordinate (canvas) */
    public y: number;
    public color: string;

    public constructor(id: string | number, label: string, x = 0, y = 0) {
        this.id = id;
        this.label = label;
        this.x = x;
        this.y = y;
    }

    public distanceSquaredTo(other: VisNode): number {
        return Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2);
    }
}

/** Definition of a vis network edge */
export class VisEdge {

    public color: VisEdgeColor;
    public width: number;

    public constructor(
        /** node id of the tail side of this edge */
        public from: string | number,
        /** node id of the head side of this edge */
        public to: string | number,
        /** Unique edge id */
        public id: string | number = Guid.newGuid()) {
    }
}

export class VisEdgeColor {
    public color: string;
    public highlight: string;
    public hover: string;
    public inherit: string | boolean;
    public opacity: number;
    public dashes: Array<number> | boolean;
}
