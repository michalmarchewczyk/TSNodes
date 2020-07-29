import _Node from './Node';
import _Connection from './Connection';

class _Graph {
    public nodes:_Node[] = [];
    public connections:_Connection[] = [];

    constructor(public name:string) {
    }

    addNode(node:_Node):void {
        this.nodes.push(node);
        node.connections.forEach(connection => {
            this.addConnection(connection);
        });
    }

    addConnection(connection:_Connection):void {
        if (!this.connections.includes(connection)) {
            this.connections.push(connection);
        }
    }

    recalculate():void {
        this.connections = [];
        this.nodes.forEach(node => {
            node.connections.forEach(connection => {
                this.addConnection(connection);
            })
        })
    }
}

export default _Graph;
