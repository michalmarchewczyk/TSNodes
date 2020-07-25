import _Input from './Input';
import _Output from './Output';
import _Connection from './Connection';

const DEFAULT_WIDTH = 120;

interface _NodeBox {
    posX: number;
    posY: number;
    width: number;
    collapsed: boolean;
    selected: boolean;
    active: boolean;
}

class _Node {
    public name:string;
    public inputs:_Input<any>[] = [];
    public outputs:_Output<any>[] = [];
    public connections:_Connection[] = [];
    public nodeBox:_NodeBox = {
        posX: 0,
        posY: 0,
        width: DEFAULT_WIDTH,
        collapsed: false,
        selected: false,
        active: false,
    };

    constructor(name:string) {
        this.name = name;
    }

    addInput(input:_Input<any>) {
        this.inputs.push(input);
    }

    addOutput(output:_Output<any>) {
        this.outputs.push(output);
    }

    addConnection(input:_Input<any>, output:_Output<any>){
        this.connections.push(new _Connection(input, output));
    }
}

export default _Node;
