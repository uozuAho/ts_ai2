import { Component, ElementRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material';

import * as FileSaver from 'file-saver';

import { VisNetwork, VisNode, VisEdge, VisNetworkDef } from '../../../libs/vis_wrappers/vis_network';
import { EditNodeDialogComponent, EditNodeDialogData } from './edit-node-dialog.component';
import { GraphT, randomSquareGraph, DiGraphT } from '../../../ai_lib/structures/graphT';
import { Graph } from '../../../ai_lib/structures/graph';
import { IGraph } from '../../../ai_lib/structures/igraph';

/** This is mainly a wrapper around vis's existing network editor.
 *  The interface has been modified for what I think is a better
 *  graph editing experience, eg. keyboard shortcuts, continuing in
 *  'add node' mode until pressing escape/back.
 */
@Component({
    selector: 'app-graph-editor',
    templateUrl: './graph-editor.component.html',
    styleUrls: ['./graph-editor.component.scss'],
  })
export class GraphEditorComponent implements AfterViewInit {

    private _network: VisNetwork;
    private _isEditingNode: boolean;
    private _isPhysicsEnabled = true;
    private _isDirected = false;

    @ViewChild('graphEditorDiv') private _networkElem: ElementRef;

    constructor(private _dialogService: MatDialog) {
        // stupid 'never read' errors!
        if (this.handleKeypress) {}
        if (this.handleKeyDown) {}
    }

    /** Not for public consumption. Only public to implement ng interface. */
    public ngAfterViewInit(): void {
        const _ths = this;
        this._network = new VisNetwork(this._networkElem.nativeElement, {
            // todo: figure out how to fill remaining vertical space with canvas
            height: '500px',
            locale: 'en',
            edges: {
                smooth: false,
                color: {
                    inherit: false
                }
            },
            manipulation: {
                addNode: function (data, callback) {
                    callback(data);
                    _ths._network.addNodeMode();
                },
                editNode: function (node: VisNode, callback) {
                    _ths.openEditNodeDialog(<EditNodeDialogData> {
                        label: node.label,
                        id: node.id
                    }, function(result) {
                        node.label = result.label;
                        callback(node);
                    });
                },
                addEdge: function (data, callback) {
                    callback(data);
                    _ths._network.addEdgeMode();
                }
            }
        });

        this._network.setDoubleClickHandler(p => {
            if (p.nodes.length === 1) {
                this._network.editNodeMode();
            }
        });

        this._network.addNodeMode();
    }

    /** Get the current graph as a VisNetworkDef */
    public getVisNetworkDef(): VisNetworkDef {
        return this._network.toNetworkDef();
    }

    public getNodes(): VisNode[] {
        return this._network.getNodes();
    }

    public getEdges(): VisEdge[] {
        return this._network.getEdges();
    }

    public getGraph(): GraphT<VisNode> {
        if (this.isDirected) {
            throw new Error('graph is directed. Use getDiGraph()');
        }
        return this.getGraphImpl() as GraphT<VisNode>;
    }

    public getDiGraph(): DiGraphT<VisNode> {
        if (!this.isDirected) {
            throw new Error('graph is not directed. Use getGraph()');
        }
        return this.getGraphImpl() as DiGraphT<VisNode>;
    }

    private getGraphImpl(): GraphT<VisNode> | DiGraphT<VisNode> {
        const nodes = this._network.getNodes();
        // map node id --> array idx
        const nodeIdxMap = new Map<string | number, number>();
        const graph = this.isDirected ? new DiGraphT<VisNode>() : new GraphT<VisNode>();
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            nodeIdxMap.set(node.id, i);
            graph.add_node(node);
        }
        for (const edge of this._network.getEdges()) {
            const fromIdx = nodeIdxMap.get(edge.from);
            const toIdx = nodeIdxMap.get(edge.to);
            graph.add_edge(fromIdx, toIdx);
        }
        return graph;
    }

    public setGraph(graph: VisNetworkDef) {
        this._network.setData(graph);
    }

    /** Export the current graph to a file (auto browser download) */
    public exportGraphToFile(): void {
        const graph = this.getVisNetworkDef();
        const blob = new Blob([JSON.stringify(graph, null, 2)], {type: 'text/plain;charset=utf-8'});
        FileSaver.saveAs(blob, 'graph.json');
    }

    /** Clear all nodes and edges */
    public clear(): void {
        this._network.setData(new VisNetworkDef([], []));
        // clearing the network exits edit mode, so get back in there
        this._network.addNodeMode();
    }

    public exitEditMode(): void {
        this._network.disableEditMode();
    }

    /** Set the handler for when a node is selected. Overwrites any existing handler. */
    public setOnNodeSelected(func: (node: VisNode) => void): void {
        this._network.setSelectNodeHandler(params => {
            const n = this._network.getNode(params.nodes[0]);
            func(n);
        });
    }

    public editNode(id: string | number, editFunc: (node: VisNode) => void) {
        const node = this._network.getNode(id);
        if (node !== undefined) {
            editFunc(node);
            this._network.updateNode(node);
        }
    }

    public editEdge(id: string | number, editFunc: (edge: VisEdge) => void) {
        const edge = this._network.getEdge(id);
        if (edge !== undefined) {
            editFunc(edge);
            this._network.updateEdge(edge);
        }
    }

    public get isPhysicsEnabled(): boolean {
        return this._isPhysicsEnabled;
    }

    public set isPhysicsEnabled(val: boolean) {
        this._isPhysicsEnabled = val;
        this._network.isPhysicsEnabled = val;
    }

    public get isDirected(): boolean {
        return this._isDirected;
    }

    public set isDirected(val: boolean) {
        this._isDirected = val;
        this._network.isDirected = val;
    }

    public redraw() {
        this._network.redraw();
    }

    public deleteEdge(id: string | number) {
        this._network.deleteEdge(id);
    }

    public deleteEdges() {
        this._network.deleteEdges();
    }

    public addEdge(edge: VisEdge) {
        this._network.addEdge(edge);
    }

    private generateRandomGraph() {
        const bounds = this._network.getCurrentViewBounds();
        const graph = randomSquareGraph(bounds.maxy, bounds.maxx, 30);
        let node_counter = 0;
        const nodes = graph.get_nodes().map(n => new VisNode(node_counter, node_counter++ + '', n.x, n.y));
        // note that edge 'from' & 'to' refer to the position of the node in the node array
        const edges = graph.get_edges().map(e => new VisEdge(e.from, e.to));
        this._network.setData(new VisNetworkDef(nodes, edges));
        // setting new data exits edit mode, so get back in there
        this._network.addNodeMode();
    }

    private openEditNodeDialog(node: EditNodeDialogData, onSubmit: (d: EditNodeDialogData) => void) {
        const dialogRef = this._dialogService.open(EditNodeDialogComponent, { data: node });
        this._isEditingNode = true;
        dialogRef.afterClosed().subscribe(result => {
            this._isEditingNode = false;
            if (result !== undefined) {
                onSubmit(result);
            }
        });
    }

    private loadGraphFromJson(graphJson: string): VisNetworkDef {
        const graphData = JSON.parse(graphJson);
        const nodes = graphData.nodes.map(n => new VisNode(n.id, n.label, n.x, n.y));
        const edges = graphData.edges.map(e => new VisEdge(e.from, e.to));
        return new VisNetworkDef(nodes, edges);
    }

    @HostListener('document:keypress', ['$event'])
    private handleKeypress(event: KeyboardEvent): void {
        if (this._isEditingNode) {
            return;
        }
        switch (event.key) {
            case 'e':
                this._network.addEdgeMode();
                break;
            case 'n':
                this._network.addNodeMode();
                break;
            default:
                break;
        }
    }

    // can't listen for special keys with keypress. sigh.
    @HostListener('document:keydown', ['$event'])
    private handleKeyDown(event: KeyboardEvent): void {
        switch (event.key) {
            case 'Escape':
                // disable + enable gets out of any add/edit modes,
                // without user having to click 'edit' again
                this._network.disableEditMode();
                this._network.enableEditMode();
                break;
            case 'Delete':
                this._network.deleteSelected();
                break;
            default:
                break;
        }
    }

    /** file drag over handler. Does nothing, but file drop doesn't work without it */
    @HostListener('dragover', ['$event'])
    private onDragOver(evt) {
        evt.preventDefault();
        evt.stopPropagation();
    }

    /** file drag leave handler. Does nothing, but file drop doesn't work without it */
    @HostListener('dragleave', ['$event'])
    private onDragLeave(evt) {
        evt.preventDefault();
        evt.stopPropagation();
    }

    /** Handle file drop events (load graph from file) */
    @HostListener('drop', ['$event'])
    private onDrop(evt) {
        const _this = this;
        evt.preventDefault();
        evt.stopPropagation();
        if (evt.dataTransfer.files.length === 1) {
            const file = evt.dataTransfer.files[0];
            const reader = new FileReader();
            reader.readAsText(file);
            reader.onload = function() {
                try {
                    const def = _this.loadGraphFromJson(reader.result);
                    _this._network.setData(def);
                    // setting data exits edit mode
                    _this._network.addNodeMode();
                } catch (error) {
                    alert('error reading graph file: ' + error);
                }
            };
        }
    }
}
