import _Node from './Node';
import _Connection from './Connection';

class _Graph {
    public nodes:_Node[] = [];
    public connections:_Connection[] = [];

    constructor(public name:string) {
    }

    createNode(node:_Node):void {
        this.nodes.push(node);
        node.connections.forEach(connection => {
            this.createConnection(connection);
        });
    }

    createConnection(connection:_Connection):void {
        if (!this.connections.includes(connection)) {
            this.connections.push(connection);
        }
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

export default _Graph;
