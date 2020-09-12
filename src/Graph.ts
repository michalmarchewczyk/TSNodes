import Node from './Node';
import Connection from './Connection';
import classes from './jssBase';
import Editor from './Editor';

class Graph {
    public editor?:Editor;
    public nodes:Node[] = [];
    public activeNode:Node | null = null;
    public selectedNodes:Node[] = [];
    public connections:Connection[] = [];
    public button:HTMLElement;

    constructor(public name:string) {
        this.button = document.createElement('div');
        this.button.className = classes.graphElement;
        this.button.innerText = this.name;
    }

    createNode(node:Node):void {
        this.nodes.push(node);
        node.connections.forEach(connection => {
            this.createConnection(connection);
        });
        this.editor?.view.appendNode(node);
    }

    deleteNode(node:Node) {
        node.connections.slice().forEach(connection => {
            this.deleteConnection(connection);
        });
        let index:number = this.nodes.indexOf(node) ?? -1;
        if (index > -1) {
            this.nodes.splice(index, 1);
        }
        if (this.activeNode === node) {
            this.activeNode = null;
            this.editor?.info.update();
        }
        index = this.selectedNodes.indexOf(node) ?? -1;
        if (index > -1) {
            this.selectedNodes.splice(index, 1);
        }
        this.editor?.view.removeNode(node);
    }

    deleteNodes(nodes:Node[]) {
        nodes.slice().forEach(node => {
            this.deleteNode(node);
        })
    }

    createConnection(connection:Connection):void {
        if (connection.input.connection) {
            this.deleteConnection(connection.input.connection);
        }
        connection.input.node?.addConnection(connection);
        connection.output.node?.addConnection(connection);
        connection.input.connection = connection;
        if (!this.connections.includes(connection)) {
            this.connections.push(connection);
        }
        if (!connection.output.node) return;
        const checkRecursion = this.editor?.engine.checkNode(connection.output.node);
        if (checkRecursion) {
            this.deleteConnection(connection);
        }
        this.editor?.view.appendConnection(connection);
    }

    deleteConnection(connection:Connection) {
        if (this.connections.includes(connection)) {
            connection.input.node?.deleteConnection(connection);
            connection.output.node?.deleteConnection(connection);
            connection.input.connection = null;
            const index = this.connections.indexOf(connection);
            if (index > -1) {
                this.connections.splice(index, 1);
            }
            this.editor?.view.removeConnection(connection);
        }
    }

    activateNode(node:Node) {
        this.deactivateNode();
        node.element.classList.add(classes.nodeActive);
        node.active = true;
        this.activeNode = node;
        this.editor?.info.update();
    }

    deactivateNode() {
        if (this.activeNode) {
            this.activeNode.element.classList.remove(classes.nodeActive);
            this.activeNode.active = false;
            this.activeNode = null;
            this.editor?.info.update();
        }
    }

    selectNode(node:Node) {
        if (!this.selectedNodes.includes(node)) {
            this.selectedNodes.push(node);
        }
        node.element.classList.add(classes.nodeSelected);
        node.selected = true;
    }

    selectNodes(nodes:Node[]) {
        nodes.forEach(node => {
            this.selectNode(node);
        });
    }

    selectAllNodes() {
        this.selectNodes(this.nodes);
    }

    deselectNodes() {
        if (this.selectedNodes.length !== 0) {
            this.selectedNodes.forEach(node => {
                node.element.classList.remove(classes.nodeSelected);
                node.selected = false;
            })
        }
        this.selectedNodes = [];
    }

    recalculate():void {
        this.connections = [];
        this.nodes.forEach(node => {
            node.connections.forEach(connection => {
                this.createConnection(connection);
            })
        })
    }
}


export default Graph;
