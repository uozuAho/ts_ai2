import { Component, ElementRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material';

import * as FileSaver from 'file-saver';

import { VisNetwork, NodeDef, EdgeDef, NetworkDef } from '../../../libs/vis_wrappers/vis_network';
import { EditNodeDialogComponent, EditNodeDialogData } from './edit-node-dialog.component';
import { GraphT, randomSquareGraph } from '../../../ai_lib/structures/graphT';

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

    @ViewChild('graphEditorDiv') private _networkElem: ElementRef;

    constructor(private _dialogService: MatDialog) {
        // stupid 'never read' errors!
        if (this.handleKeypress) {}
        if (this.handleKeyDown) {}
    }

    /** Don't touch. Only public to implement interface */
    public ngAfterViewInit(): void {
        const _ths = this;
        this._network = new VisNetwork(this._networkElem.nativeElement, {
            height: '401px',
            locale: 'en',
            manipulation: {
                addNode: function (data, callback) {
                    callback(data);
                    _ths._network.addNodeMode();
                },
                editNode: function (node: NodeDef, callback) {
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

        // HACK: I want physics disabled from the start, but
        // if I do so, the canvas doesn't render properly. So,
        // I turn it off here... meh
        this._network.disablePhysics();

        this._network.setDoubleClickHandler(p => {
            if (p.nodes.length === 1) {
                this._network.editNodeMode();
            }
        });

        this._network.addNodeMode();
    }

    /** Export the current graph to a file (auto browser download) */
    public exportGraph(): void {
        const def = this._network.toNetworkDef();
        const blob = new Blob([JSON.stringify(def, null, 2)], {type: 'text/plain;charset=utf-8'});
        FileSaver.saveAs(blob, 'graph.json');
    }

    /** Clear all nodes and edges */
    public clear(): void {
        this._network.setData(new NetworkDef([], []));
        // clearing the network exits edit mode, so get back in there
        this._network.addNodeMode();
    }

    public exitEditMode(): void {
        this._network.disableEditMode();
    }

    /** Set the handler for when a node is selected. Overwrites any existing handler. */
    public setOnNodeSelected(func: (node: NodeDef) => void): void {
        this._network.setSelectNodeHandler(params => {
            const n = this._network.getNode(params.nodes[0]);
            func(n);
        });
    }

    public editNode(id: string | number, editFunc: (node: NodeDef) => void) {
        const node = this._network.getNode(id);
        if (node !== undefined) {
            editFunc(node);
            this._network.updateNode(node);
        }
    }

    private generateRandomGraph() {
        const bounds = this._network.getCurrentViewBounds();
        console.log(bounds);
        const graph = randomSquareGraph(bounds.maxy, bounds.maxx, 30);
        let node_counter = 0;
        const nodes = graph.get_nodes().map(n => new NodeDef(node_counter, node_counter++ + '', n.x, n.y));
        // note that edge 'from' & 'to' refer to the position of the node in the node array
        const edges = graph.get_edges().map(e => new EdgeDef(e.from, e.to));
        this._network.setData(new NetworkDef(nodes, edges));
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

    private loadGraphFromJson(graphJson: string): NetworkDef {
        const graphData = JSON.parse(graphJson);
        const nodes = graphData.nodes.map(n => new NodeDef(n.id, n.label, n.x, n.y));
        const edges = graphData.edges.map(e => new EdgeDef(e.from, e.to));
        return new NetworkDef(nodes, edges);
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
