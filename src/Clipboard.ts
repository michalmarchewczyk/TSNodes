import Node from './Node';
import Connection from './Connection';
import GraphClipboard from './GraphClipboard';
import {nodePosAverage} from './utils';
import Graph from './Graph';

class Clipboard {
    public graph:GraphClipboard;

    constructor() {
        this.graph = new GraphClipboard();
    }

    cloneNodes(nodes:Node[]):[Node[], Connection[]] {
        const newNodes:Node[] = [];
        const newConnections:Connection[] = [];
        const connections:Connection[] = [];
        const nodesMap = new Map();

        nodes.forEach(node => {
            let newNode:Node;
            newNode = new (Object.getPrototypeOf(node).constructor)();
            newNode.nodeBox.pos = [node.nodeBox.pos[0], node.nodeBox.pos[1]];
            newNode.nodeBox.width = node.nodeBox.width;
            newNode.inputs.forEach((input, index) => {
                input.node = newNode;
                input.setValue(node.inputs[index].value);
            });
            newNode.setName(node.name);
            node.connections.forEach(connection => {
                if (!connection.input.node || !connection.output.node) return;
                if (nodes.includes(connection.input.node) && nodes.includes(connection.output.node)) {
                    if (!connections.includes(connection)) {
                        connections.push(connection);
                    }
                }
            });
            newNodes.push(newNode);
            nodesMap.set(node, newNode);
        });

        connections.forEach(connection => {
            if (!connection.input.node || !connection.output.node) return;
            const inputNode = nodesMap.get(connection.input.node);
            const input = inputNode.inputs[connection.input.node.inputs.indexOf(connection.input)];
            const outputNode = nodesMap.get(connection.output.node);
            const output = outputNode.outputs[connection.output.node.outputs.indexOf(connection.output)];
            const newConnection = new Connection(output, input);
            newConnections.push(newConnection);
        });

        return [newNodes, newConnections];
    }

    copyNodes(nodes:Node[]) {
        if (!this.graph) return;
        this.graph.nodes = [];
        this.graph.connections = [];

        const [newNodes, newConnections] = this.cloneNodes(nodes);

        newNodes.forEach(newNode => {
            this.graph?.createNode(newNode);
        });

        newConnections.forEach(newConnection => {
            this.graph?.createConnection(newConnection);
        });

        this.graph.center = nodePosAverage(nodes);
    }

    cutNodes(graph:Graph, nodes:Node[]) {
        this.copyNodes(nodes);
        graph.deleteNodes(nodes);
    }

    pasteNodes(graph:Graph) {
        if (!this.graph) return;

        const nodes = this.graph.nodes;

        const [newNodes, newConnections] = this.cloneNodes(nodes);

        graph.deactivateNode();
        graph.deselectNodes();

        newNodes.forEach(node => {
            graph.createNode(node);
            node.select();
            graph.editor?.view.centerNode(node, this.graph.center[0], this.graph.center[1]);
        });

        newConnections.forEach(newConnection => {
            graph.createConnection(newConnection);
        });

    }

    duplicateNodes(graph:Graph, nodes:Node[]) {
        this.copyNodes(nodes);
        this.pasteNodes(graph);
    }

}


export default Clipboard;
