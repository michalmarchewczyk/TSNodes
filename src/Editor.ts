import _Graph from './Graph';
import _Node from './Node';


import jss from 'jss';

const styles = {
    view: {
        display: 'block',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
    }
}

const {classes} = jss.createStyleSheet(styles).attach();


class _EditorView {
    public container:Node;
    // public container:HTMLDivElement;
    public scrollX:number = 0;
    public scrollY:number = 0;
    public zoom:number = 1;
    public sizeX:number = 4000;
    public sizeY:number = 4000;

    public graph?:_Graph;

    constructor() {
        let container = document.createElement('div');
        container.className = classes.view;

        this.container = container;
    }

    render():Node {
        return this.container;
    }
}


class _EditorGraphs {
    public container:Node;

    public graphs:_Graph[] = [];

    constructor() {
        this.container = document.createElement('div');
    }
}


class _EditorNodes {
    public container:Node;

    public nodes:_Node[] = [];

    constructor() {
        this.container = document.createElement('div');
    }
}


class _EditorInfo {
    public container:Node;

    constructor() {
        this.container = document.createElement('div');
    }
}


class _Editor {
    public view:_EditorView;
    public graphs?:_EditorGraphs;
    public nodes?:_EditorNodes;
    public info?:_EditorInfo;

    constructor() {
        this.view = new _EditorView();
        this.graphs = new _EditorGraphs();
        this.nodes = new _EditorNodes();
        this.info = new _EditorInfo();
    }
}

export default _Editor;

export {
    _EditorView,
    _EditorGraphs,
    _EditorNodes,
    _EditorInfo,
}
