import { DataSet, Network } from 'vis/index-network';

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

    public setData(data: NetworkDef): void {
        const nodes = new DataSet(data.nodes.map(n => this.toVisNode(n)));
        const edges = new DataSet(data.edges.map(e => this.toVisEdge(e)));
        this._network.setData({nodes: nodes, edges: edges});
        this._nodes = nodes;
        this._edges = edges;
    }

    public toNetworkDef(): NetworkDef {
        const nodes = this._nodes.map(n => new NodeDef(n.id, n.label, n.x, n.y));
        const edges = this._edges.map(e => new EdgeDef(e.from, e.to));
        return new NetworkDef(nodes, edges);
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
    public addEdge(from: string | number, to: string | number) {
        const id = this._nextEdgeId++;
        this._edges.add({
            id: id,
            from: from,
            to: to
        });
        return id;
    }

    /** Returns an array of node ids */
    public getSelectedNodes(): any[] {
        return this._network.getSelectedNodes();
    }

    /** Set (only) handler for click events */
    public setClickHandler(func: (params: any) => void) {
        this._network.on('click', func);
    }

    public setDoubleClickHandler(func: (params: any) => void) {
        this._network.on('doubleClick', func);
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

    public getNode(id: string | number): NodeDef {
        return this._nodes.get(id);
    }

    /** Convert a node definition into a vis node */
    private toVisNode(node_def: NodeDef): any {
        return node_def;
    }

    private toVisEdge(edge_def: EdgeDef): any {
        return edge_def;
    }

    /** Turns on forces between nodes, causing them to spread out
        DOESN'T WORK
    */
    enablePhysics() {
        this._network.startSimulation();
    }

    /** Turn of physics simulation. Nodes won't move by themselves
        DOESN'T WORK
    */
    disablePhysics() {
        this._network.stopSimulation();
        this._network.setOptions({physics: false});
    }
}

/** Definition of a network */
export class NetworkDef {

    public nodes: NodeDef[];
    public edges: EdgeDef[];

    public constructor(nodes: NodeDef[] = null, edges: EdgeDef[] = null) {
        this.nodes = nodes;
        this.edges = edges;
    }
}

/** Definition of a network node */
export class NodeDef {
    /** Unique node id */
    public id: string | number;
    /** Label to display on node */
    public label: string;
    /** x coordinate (canvas) */
    public x: number;
    /** y coordinate (canvas) */
    public y: number;

    public constructor(id: string | number, label: string, x = 0, y = 0) {
        this.id = id;
        this.label = label;
        this.x = x;
        this.y = y;
    }
}

/** Definition of a network edge */
export class EdgeDef {
    /** node id of the tail side of this edge */
    public from: string | number;
    /** node id of the head side of this edge */
    public to: string | number;

    public constructor(from: string | number, to: string | number) {
        this.from = from;
        this.to = to;
    }
}
