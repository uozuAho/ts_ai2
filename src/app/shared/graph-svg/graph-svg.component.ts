import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-graph-svg',
  templateUrl: './graph-svg.component.html',
  styleUrls: ['./graph-svg.component.css']
})
export class GraphSvgComponent {
    @Input() public nodes: Node2d[];
    @Input() public edges: Edge2d[];
}

export class Node2d {
    constructor(
        public x: number,
        public y: number,
        public highlighted = false
    ) {}
}

export class Edge2d {
    constructor (
        public fromX: number,
        public toX: number,
        public fromY: number,
        public toY: number
    ) {}
}
