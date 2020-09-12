import Graph from './Graph';

class GraphClipboard extends Graph {
    public center:[number, number] = [0, 0];

    constructor() {
        super('clipboard');
    }
}

export default GraphClipboard;
