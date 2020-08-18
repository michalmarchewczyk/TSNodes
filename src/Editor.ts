import _Graph, {_GraphClipboard} from './Graph';
import _Node, {nodeClass} from './Node';

import config from './config';
import _Input from './Input';
import _Output from './Output';
import _Connection from './Connection';
import {elementContainsNodes, nodePosAverage} from './utils';
import _Engine from './Engine';

import classes from './jssBase';


interface foregroundState {
    input:_Input<any> | null;
    output:_Output<any> | null;
    active:boolean;
    line:SVGLineElement | null;
}

interface keyboardState {
    shift:boolean;
    ctrl:boolean;
    alt:boolean;
}


class _EditorView {
    public container:HTMLElement;
    public canvas:HTMLElement;
    public background:SVGSVGElement;
    public foreground:SVGSVGElement;
    public foregroundState:foregroundState = {
        input: null,
        output: null,
        active: false,
        line: null,
    };

    public scrollX:number = 0;
    public scrollY:number = 0;
    public zoom:number = 1;
    public sizeX:number = config.defaultCanvasWidth;
    public sizeY:number = config.defaultCanvasHeight;
    public move:boolean = false;
    public zIndex:number = 10;

    public offsetX:number = 0;
    public offsetY:number = 0;

    public graph?:_Graph;
    public activeNode:_Node | null = null;
    public selectedNodes:_Node[] = [];
    public keyboardState:keyboardState = {
        shift: false,
        ctrl: false,
        alt: false,
    }

    public clipboard?:_GraphClipboard;

    constructor(private editor:_Editor) {
        this.container = document.createElement('div');
        this.container.className = classes.view;
        this.container = <HTMLElement>this.container;
        this.canvas = document.createElement('div');
        this.background = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.foreground = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.setupContainer();
        this.setupControls();
    }

    selectGraph(graph:_Graph) {
        this.graph = graph;
        this.renderGraph();
        if (this.activeNode) {
            this.activeNode.element.classList.remove(classes.nodeActive);
            this.activeNode.active = false;
            this.activeNode = null;
            this.editor.info.update();
        }
        if (this.selectedNodes.length !== 0) {
            this.selectedNodes.forEach(node => {
                node.element.classList.remove(classes.nodeSelected);
                node.selected = false;
            });
            this.selectedNodes = [];
        }
    }

    createNode(node:_Node) {
        if (!this.graph) return;
        this.graph.createNode(node);
        const nodeElement = node.render();
        this.canvas.appendChild(nodeElement);
    }

    createConnection(connection:_Connection) {
        if (connection.input.connection) {
            this.deleteConnection(connection.input.connection);
        }
        this.graph?.createConnection(connection);
        connection.input.node?.addConnection(connection);
        connection.output.node?.addConnection(connection);
        connection.input.connection = connection;
        this.offsetX = (this.scrollX - this.container.getBoundingClientRect().left) / this.zoom;
        this.offsetY = (this.scrollY - this.container.getBoundingClientRect().top) / this.zoom;
        connection.updateInputPos();
        connection.updateOutputPos();
        const line = connection.render();
        this.background.appendChild(line);
        if(!connection.output.node) return;
        const checkRecursion = this.editor.engine.checkNode(connection.output.node);
        if(checkRecursion){
            this.deleteConnection(connection);
        }
    }

    deleteConnection(connection:_Connection) {
        this.graph?.deleteConnection(connection);
        connection.input.node?.deleteConnection(connection);
        connection.output.node?.deleteConnection(connection);
        connection.input.connection = null;
        const line = connection.render();
        this.background.removeChild(line);
    }

    moveNodes(deltaX:number, deltaY:number) {
        this.offsetX = (this.scrollX - this.container.getBoundingClientRect().left)/this.zoom;
        this.offsetY = (this.scrollY - this.container.getBoundingClientRect().top)/this.zoom;
        window.requestAnimationFrame(() => {
            this.selectedNodes.forEach(node => {
                node.move(deltaX, deltaY);
            });
        })
    }

    deleteNodes(nodes:_Node[]) {
        nodes.slice().forEach(node => {
            this.deleteNode(node);
        })
    }

    deleteNode(node:_Node) {
        node.connections.slice().forEach(connection => {
            this.deleteConnection(connection);
        });
        let index:number = this.graph?.nodes.indexOf(node) ?? -1;
        if (index > -1) {
            this.graph?.nodes.splice(index, 1);
        }
        if (this.activeNode === node) {
            this.activeNode = null;
            this.editor.info.update();
        }
        this.canvas.removeChild(node.render());
        index = this.selectedNodes.indexOf(node) ?? -1;
        if (index > -1) {
            this.selectedNodes.splice(index, 1);
        }
    }

    cloneNodes(nodes:_Node[]):[_Node[],_Connection[]] {
        console.log('CLONE');

        const newNodes:_Node[] = [];
        const newConnections:_Connection[] = [];
        const connections:_Connection[] = [];
        const nodesMap = new Map();

        nodes.forEach(node => {
            let newNode:_Node;
            // newNode = new _Node(this.editor, node.name);
            newNode = new (Object.getPrototypeOf(node).constructor)();
            newNode.nodeBox.pos = [node.nodeBox.pos[0], node.nodeBox.pos[1]];
            newNode.nodeBox.width = node.nodeBox.width;
            newNode.inputs.forEach((input, index) => {
                input.node = newNode;
                input.setValue(node.inputs[index].value);
            });
            newNode.setName(node.name);
            node.connections.forEach(connection => {
                // console.log(connection);
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
            const newConnection = new _Connection(output, input);
            newConnections.push(newConnection);
        });

        return [newNodes, newConnections];
    }

    copyNodes(nodes:_Node[]) {
        console.log('COPY');
        if(!this.clipboard) return;
        this.clipboard.nodes = [];
        this.clipboard.connections = [];

        const [newNodes, newConnections] = this.cloneNodes(nodes);

        newNodes.forEach(newNode => {
            if(!this.clipboard) return;
            this.clipboard.createNode(newNode);
        });

        newConnections.forEach(newConnection => {
            if(!this.clipboard) return;
            this.clipboard.createConnection(newConnection);
            newConnection.input.node?.addConnection(newConnection);
            newConnection.output.node?.addConnection(newConnection);
            newConnection.input.connection = newConnection;
        });
        this.clipboard.center = nodePosAverage(nodes);
    }

    cutNodes(nodes:_Node[]) {
        console.log('CUT');
        this.copyNodes(nodes);
        this.deleteNodes(nodes);
    }

    pasteNodes(nodes:_Node[]) {
        console.log('PASTE');

        if(!this.clipboard) return;

        const [newNodes, newConnections] = this.cloneNodes(nodes);

        const deltaX = (this.scrollX + this.container.getBoundingClientRect().width/2) / this.zoom - this.clipboard.center[0] - 20;
        const deltaY = (this.scrollY + this.container.getBoundingClientRect().height/2) / this.zoom - this.clipboard.center[1] - 20;

        if (this.activeNode) {
            this.activeNode.element.classList.remove(classes.nodeActive);
            this.activeNode.active = false;
            this.activeNode = null;
            this.editor.info.update();
        }
        if (this.selectedNodes.length !== 0) {
            this.selectedNodes.forEach(node => {
                node.element.classList.remove(classes.nodeSelected);
                node.selected = false;
            });
            this.selectedNodes = [];
        }

        newNodes.forEach(node => {
            this.editor.createNode(node);
            node.nodeBox.zIndex = this.zIndex;
            node.element.style.zIndex = node.nodeBox.zIndex.toString();
            this.zIndex = this.zIndex + 1;
            node.select();
            node.move(deltaX, deltaY);
        });

        newConnections.forEach(newConnection => {
            this.createConnection(newConnection);
        });


    }

    duplicateNodes(nodes:_Node[]) {
        if(!this.clipboard) return;
        this.copyNodes(nodes);
        this.pasteNodes(this.clipboard.nodes);
    }

    render():HTMLElement {
        const element = document.createElement('div');
        element.appendChild(this.container);
        element.appendChild(this.foreground);
        return element;
    }

    private setupContainer():void {
        this.canvas.className = classes.canvas;
        this.container.appendChild(this.canvas);

        this.background.setAttribute('class', classes.background);
        this.background.setAttribute('width', this.sizeX.toString());
        this.background.setAttribute('height', this.sizeY.toString());
        this.canvas.appendChild(this.background);

        window.addEventListener('load', () => {
            this.foreground.setAttribute('class', classes.foreground);
            this.foreground.setAttribute('width', '100%');
            this.foreground.setAttribute('height', '100%');
        });
    }

    private setupControls():void {
        this.setupZoom();
        this.setupMove();
        window.addEventListener('load', () => {
            this.setupKeyboard();
        });
        this.setupSelect();
    }

    private setupMove() {
        window.addEventListener('load', () => {
            this.container.scrollTo((config.defaultCanvasWidth - this.container.getBoundingClientRect().width) / 2, (config.defaultCanvasHeight - this.container.getBoundingClientRect().height) / 2);
            this.scrollX = this.container.scrollLeft;
            this.scrollY = this.container.scrollTop;
        });
        this.canvas.onmousedown = (e) => {
            e.stopPropagation();
            let clientX:number;
            let clientY:number;
            e.preventDefault();

            (<HTMLElement>document.activeElement).blur();

            if (e.button !== 1 || this.move) return;

            this.move = true;
            this.container.style.cursor = 'move';
            this.canvas.onmouseup = (e) => {
                // e.preventDefault();
                e.stopPropagation();
                this.move = false;
                this.container.style.cursor = 'auto';
                this.canvas.onmouseup = null;
                this.container.onmouseleave = null;
                this.canvas.onmousemove = null;
            }
            this.container.onmouseleave = this.canvas.onmouseup;
            this.canvas.onmousemove = (e) => {
                e.preventDefault();
                e.stopPropagation();

                const deltaX = clientX ? clientX - e.clientX : 0;
                const deltaY = clientY ? clientY - e.clientY : 0;
                clientX = e.clientX;
                clientY = e.clientY;

                this.container.scrollTo(this.scrollX + deltaX, this.scrollY + deltaY);
                this.scrollX = this.container.scrollLeft;
                this.scrollY = this.container.scrollTop;
            }
        };
    }

    private setupZoom() {
        this.container.onwheel = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (this.move) return;

            const oldZoom = this.zoom;
            this.zoom = this.zoom - Math.sign(e.deltaY) * 0.1;
            this.zoom = Math.min(Math.max(config.zoomMin, this.zoom), config.zoomMax)
            this.canvas.style.transform = `scale(${this.zoom})`;
            const rescale = this.zoom / oldZoom - 1;

            const mouseX = e.clientX - this.container.getBoundingClientRect().left;
            const mouseY = e.clientY - this.container.getBoundingClientRect().top;
            this.container.scrollTop += (this.scrollY + mouseY) * rescale;
            this.container.scrollLeft += (this.scrollX + mouseX) * rescale;
            this.scrollY = this.container.scrollTop;
            this.scrollX = this.container.scrollLeft;
        }
    }

    private setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'Shift':
                    this.keyboardState.shift = true;
                    break;
                case 'Control':
                    this.keyboardState.ctrl = true;
                    break;
                case 'Alt':
                    this.keyboardState.alt = true;
                    break;
            }
            if(this.keyboardState.ctrl){
                e.preventDefault();
                e.stopPropagation();
            }
        });
        document.addEventListener('keyup', (e) => {
            switch (e.key) {
                case 'Shift':
                    this.keyboardState.shift = false;
                    break;
                case 'Control':
                    this.keyboardState.ctrl = false;
                    break;
                case 'Alt':
                    this.keyboardState.alt = false;
                    break;
            }
            if(this.keyboardState.ctrl){
                e.preventDefault();
                e.stopPropagation();
            }
            if (e.key === 'Delete') {
                this.deleteNodes(this.selectedNodes);
            }
            if (e.key === 'c' && this.keyboardState.ctrl) {
                this.copyNodes(this.selectedNodes);
            }
            if (e.key === 'v' && this.keyboardState.ctrl) {
                if(this.clipboard) {
                    this.pasteNodes(this.clipboard.nodes);
                }
            }
            if (e.key === 'd' && this.keyboardState.ctrl) {
                this.duplicateNodes(this.selectedNodes);
            }
            if (e.key === 'x' && this.keyboardState.ctrl){
                this.cutNodes(this.selectedNodes);
            }
        })
    }

    private setupSelect() {
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;

            if (!this.keyboardState.shift) {
                if (this.activeNode) {
                    this.activeNode.element.classList.remove(classes.nodeActive);
                    this.activeNode.active = false;
                    this.activeNode = null;
                    this.editor.info.update();
                }
                if (this.selectedNodes.length !== 0) {
                    this.selectedNodes.forEach(node => {
                        node.element.classList.remove(classes.nodeSelected);
                        node.selected = false;
                    });
                    this.selectedNodes = [];
                }
            }
            this.move = true;
            const startX = (this.editor.view.scrollX + e.clientX - this.container.getBoundingClientRect().left) / this.editor.view.zoom;
            const startY = (this.editor.view.scrollY + e.clientY - this.container.getBoundingClientRect().top) / this.editor.view.zoom;
            const selectBox = document.createElement('div');
            this.canvas.appendChild(selectBox);
            selectBox.className = classes.selectBox;
            selectBox.style.left = startX + 'px';
            selectBox.style.top = startY + 'px';
            selectBox.style.width = '0';
            selectBox.style.height = '0';
            selectBox.style.zIndex = this.zIndex.toString();
            this.zIndex = this.zIndex + 1;
            this.canvas.onmousemove = (e) => {
                const currentX = (this.editor.view.scrollX + e.clientX - this.container.getBoundingClientRect().left) / this.editor.view.zoom;
                const currentY = (this.editor.view.scrollY + e.clientY - this.container.getBoundingClientRect().top) / this.editor.view.zoom;
                selectBox.style.width = Math.abs(currentX - startX) + 'px';
                selectBox.style.height = Math.abs(currentY - startY) + 'px';
                selectBox.style.left = Math.min(currentX, startX) + 'px';
                selectBox.style.top = Math.min(currentY, startY) + 'px';
            }
            this.canvas.onmouseup = (e) => {
                const nodes = elementContainsNodes(selectBox, this.graph?.nodes ?? []);
                nodes.forEach(node => node.select());
                this.move = false;
                this.canvas.removeChild(selectBox);
                this.canvas.onmousemove = null;
                this.canvas.onmouseup = null;
                this.canvas.onmouseleave = null;
            }
            this.canvas.onmouseleave = this.canvas.onmouseup;
        })
    }

    renderGraph() {
        this.canvas.innerHTML = '';
        this.canvas.appendChild(this.background);
        this.background.innerHTML = '';
        if (!this.graph) return;
        this.graph.nodes.forEach((node) => {
            const nodeElement = node.render();
            this.canvas.appendChild(nodeElement);
        });
        this.graph.connections.forEach(connection => {
            const line = connection.render();
            this.offsetX = (this.scrollX - this.container.getBoundingClientRect().left) / this.zoom;
            this.offsetY = (this.scrollY - this.container.getBoundingClientRect().top) / this.zoom;
            connection.updateInputPos();
            connection.updateOutputPos();
            this.background.appendChild(line);
        })
    }
}


class _EditorGraphs {
    public container:HTMLElement;

    public graphs:_Graph[] = [];

    constructor(private editor:_Editor) {
        this.container = document.createElement('div');
        if(config.debug) this.container.innerHTML = 'graphs';
        this.editor = editor;
    }

    addGraph(graph:_Graph) {
        this.graphs.push(graph);
        const graphElement = this.renderGraphElement(graph)
        this.container.appendChild(graphElement);
        this.editor.selectGraph(graph);
        Array.from(this.container.children).forEach(child => {
            child.classList.remove(classes.graphSelected);
        })
        graphElement.classList.add(classes.graphSelected);
    }

    renderGraphElement(graph:_Graph):HTMLElement {
        // const graphElement = document.createElement('div');
        // graphElement.className = classes.graphElement;
        // graphElement.innerText = graph.name;
        const graphElement = graph.button;
        graphElement.onclick = () => {
            this.editor.selectGraph(graph);
            Array.from(this.container.children).forEach(child => {
                child.classList.remove(classes.graphSelected);
            })
            graphElement.classList.add(classes.graphSelected);
        }
        return graphElement;
    }

    render():HTMLElement {
        return this.container;
    }
}


class _EditorNodes {
    public container:HTMLElement;
    public tempNode?:_Node;

    public nodes:nodeClass[] = [];

    constructor(private editor:_Editor) {
        this.container = document.createElement('div');
        if(config.debug) this.container.innerHTML = 'nodes';
    }

    addNode(node:nodeClass) {
        if (typeof node !== 'function') return;
        this.nodes.push(node);
        this.container.appendChild(this.renderNodeElement(node));
    }

    renderNodeElement(node:nodeClass):HTMLElement {
        const nodeElement = document.createElement('div');
        nodeElement.className = classes.nodeElement;
        this.tempNode = new (<any>node)();
        nodeElement.innerText = this.tempNode?.name ?? '';
        delete this.tempNode;

        nodeElement.onclick = () => {
            const newNode = new (<any>node)();
            newNode.nodeBox.pos = [
                this.editor.view.scrollX / this.editor.view.zoom + 200,
                this.editor.view.scrollY / this.editor.view.zoom + 200
            ];
            newNode.nodeBox.zIndex = this.editor.view.zIndex + 1;
            this.editor.view.zIndex += 1;
            newNode.element.style.zIndex = newNode.nodeBox.zIndex.toString();
            this.editor.createNode(newNode);
        }

        return nodeElement;
    }

    render():HTMLElement {
        return this.container;
    }
}


class _EditorInfo {
    public container:HTMLElement;

    constructor(private editor:_Editor) {
        this.container = document.createElement('div');
        if(config.debug) this.container.innerHTML = 'info';
        this.setupElement();
    }

    setupElement() {
        this.update();
    }

    getGraphInfo(graph:_Graph):HTMLElement {
        const element = document.createElement('div');
        element.innerHTML = `<label><span>Graph name: </span><input value='${graph.name}'></label><button>Delete</button>`;
        (<HTMLInputElement>element.children[0].children[1]).oninput = (e) => {
            graph.name = (<HTMLInputElement>element.children[0].children[1]).value;
            graph.button.innerText = graph.name;
        }
        (<HTMLElement>element.children[1]).onclick = (e) => {
            this.editor.deleteGraph(graph);
        }
        element.className = classes.graphInfo;
        return element;
    }

    getNodeInfo(node:_Node):HTMLElement {
        const element = document.createElement('div');
        element.innerHTML = `<label><span>Node name: </span><input value='${node.name}'></label><button>Delete</button>`;
        (<HTMLInputElement>element.children[0].children[1]).oninput = (e) => {
            node.setName((<HTMLInputElement>element.children[0].children[1]).value);
        }
        (<HTMLElement>element.children[1]).onclick = (e) => {
            this.editor.view.deleteNode(node);
        }
        element.className = classes.nodeInfo;
        return element;
    }

    update() {
        this.container.innerHTML = '';
        if(this.editor.view.activeNode){
            this.container.appendChild(this.getNodeInfo(this.editor.view.activeNode))
            return;
        }
        if(this.editor.view.graph){
            this.container.appendChild(this.getGraphInfo(this.editor.view.graph));
            return;
        }
    }

    render():HTMLElement {
        return this.container;
    }
}


class _Editor {
    public view:_EditorView;
    public graphs:_EditorGraphs;
    public nodes:_EditorNodes;
    public info:_EditorInfo;
    public engine:_Engine;

    constructor() {
        this.view = new _EditorView(this);
        this.graphs = new _EditorGraphs(this);
        this.nodes = new _EditorNodes(this);
        this.info = new _EditorInfo(this);
        this.engine = new _Engine();
        this.view.clipboard = new _GraphClipboard();
        if(config.debug) this.graphs?.addGraph(this.view.clipboard);
    }

    addNode(node:nodeClass):void {
        this.nodes?.addNode(node);
    }

    createGraph(name:string):_Graph {
        const graph = new _Graph(name);
        this.graphs?.addGraph(graph);
        this.selectGraph(graph);
        return graph;
    }

    selectGraph(graph:_Graph) {
        this.view.selectGraph(graph);
        this.info.update();
    }

    deleteGraph(graph:_Graph) {
        if(!confirm(`Are you sure you want to delete graph "${graph.name}?"`)) return;
        if(graph === this.view.graph){
            this.view.graph = undefined;
            this.view.renderGraph();
        }
        this.graphs.container.removeChild(graph.button);
    }

    createNode(node:_Node):void {
        this.view.createNode(node);
    }
}

export default _Editor;

export {
    _EditorView,
    _EditorGraphs,
    _EditorNodes,
    _EditorInfo,
}
