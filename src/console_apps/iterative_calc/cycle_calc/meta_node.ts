/** Either a node or a set of nodes */
export class MetaNode {
    constructor(public isSet: boolean,
                public node: number,
                public nodes: Set<number>) {}

    public static fromNode(node: number): MetaNode {
        return new MetaNode(false, node, null);
    }

    public static fromNodes(nodes: number[]): MetaNode {
        return new MetaNode(true, -1, new Set(nodes));
    }
}
