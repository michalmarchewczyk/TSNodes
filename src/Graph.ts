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

    deleteConnection(connection:_Connection) {
        if(this.connections.includes(connection)){
            const index = this.connections.indexOf(connection);
            if(index > -1) {
                this.connections.splice(index, 1);
            }
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


class _GraphClipboard extends _Graph {
    public center:[number,number] = [0,0];

    constructor() {
        super('clipboard');
    }
}

export default _Graph;

export {
    _GraphClipboard
}
