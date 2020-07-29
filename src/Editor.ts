import _Graph from './Graph';
import _Node, {nodeClass} from './Node';

import jss from 'jss';
import preset from 'jss-preset-default';

jss.setup(preset());

import config from './config';

const styles = {
    view: {
        display: 'block',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'scroll',
    },
    canvas: {
        display: 'block',
        position: 'absolute',
        top: 0,
        left: 0,
        width: config.defaultCanvasWidth,
        height: config.defaultCanvasHeight,
        backgroundColor: '#444444',
        background: `
            linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px, 20px 20px, 80px 80px, 80px 80px',
        transform: 'scale(1)',
        transformOrigin: 'top left',
        overflow: 'hidden',
    },
    background: {
        display: 'block',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        '& line': {
            stroke: 'white',
            strokeWidth: 2,
        }
    },
    nodeElement: {
        display: 'block',
        position: 'relative',
        top: 0,
        left: 0,
        width: '100%',
        height: '40px',
        outline: (config.debugOutline) ? '1px solid red' : 'none',
        cursor: 'pointer',
    },
    graphElement: {
        display: 'block',
        position: 'relative',
        top: 0,
        left: 0,
        width: '100%',
        height: '40px',
        outline: (config.debugOutline) ? '1px solid red' : 'none',
        '&.graphSelected': {
            fontWeight: 'bold',
        }
    }
}

const {classes} = jss.createStyleSheet(styles).attach();


class _EditorView {
    public container:HTMLElement;
    public canvas:HTMLElement;
    public background:SVGSVGElement;

    public scrollX:number = 0;
    public scrollY:number = 0;
    public zoom:number = 1;
    public sizeX:number = config.defaultCanvasWidth;
    public sizeY:number = config.defaultCanvasHeight;
    public move:boolean = false;
    public zIndex:number = 10;

    public graph?:_Graph;

    constructor(private editor:_Editor) {
        this.container = document.createElement('div');
        this.container.className = classes.view;
        this.container = <HTMLElement>this.container;
        this.canvas = document.createElement('div');
        this.background = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

        this.setupContainer();
        this.setupControls();
    }

    selectGraph(graph:_Graph):void {
        this.graph = graph;
        this.renderGraph();
    }

    createNode(node:_Node):void {
        this.graph?.addNode(node);
        const nodeElement = node.render();
        this.canvas.appendChild(nodeElement);
    }

    render():HTMLElement {
        return this.container;
    }

    private setupContainer():void {
        this.canvas.className = classes.canvas;
        this.container.appendChild(this.canvas);

        this.background.setAttribute('class', classes.background);
        this.background.setAttribute('width', this.sizeX.toString());
        this.background.setAttribute('height', this.sizeY.toString());
        this.canvas.appendChild(this.background);
    }

    private setupControls():void {
        this.setupZoom();
        this.setupMove();
    }

    private setupMove():void {
        window.addEventListener('load', () => {
            this.container.scrollLeft = (config.defaultCanvasWidth - this.container.getBoundingClientRect().width) / 2;
            this.container.scrollTop = (config.defaultCanvasHeight - this.container.getBoundingClientRect().height) / 2;
            this.scrollX = this.container.scrollLeft;
            this.scrollY = this.container.scrollTop;
        });
        this.canvas.onmousedown = (e) => {
            e.stopPropagation();
            let clientX:number;
            let clientY:number;
            if (e.button !== 1 || this.move) return;
            e.preventDefault();
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

                this.container.scrollLeft = this.scrollX + deltaX;
                this.container.scrollTop = this.scrollY + deltaY;
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
            this.zoom = Math.min(Math.max(0.6, this.zoom), 2)
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

    private renderGraph():void {
        this.canvas.innerHTML = '';
        this.canvas.appendChild(this.background);
        if (!this.graph) throw new Error('There is no graph selected');
        this.graph.nodes.forEach((node) => {
            const nodeElement = node.render();
            this.canvas.appendChild(nodeElement);
        })
    }
}


class _EditorGraphs {
    public container:HTMLElement;

    public graphs:_Graph[] = [];

    constructor(private editor:_Editor) {
        this.container = document.createElement('div');
        this.container.innerHTML = 'graphs';
        this.editor = editor;
    }

    addGraph(graph:_Graph) {
        this.graphs.push(graph);
        const graphElement = this.renderGraphElement(graph)
        this.container.appendChild(graphElement);
        this.editor.selectGraph(graph);
        Array.from(this.container.children).forEach(child => {
            child.classList.remove('graphSelected');
        })
        graphElement.classList.add('graphSelected');
    }

    renderGraphElement(graph:_Graph):HTMLElement {
        const graphElement = document.createElement('div');
        graphElement.className = classes.graphElement;
        graphElement.innerText = graph.name;
        graphElement.onclick = () => {
            this.editor.selectGraph(graph);
            Array.from(this.container.children).forEach(child => {
                child.classList.remove('graphSelected');
            })
            graphElement.classList.add('graphSelected');
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
        this.container.innerHTML = 'nodes';
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
        this.container.innerHTML = 'info';
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

    constructor() {
        this.view = new _EditorView(this);
        this.graphs = new _EditorGraphs(this);
        this.nodes = new _EditorNodes(this);
        this.info = new _EditorInfo(this);
    }

    addNode(node:nodeClass):void {
        this.nodes?.addNode(node);
    }

    createGraph(name:string) {
        const graph = new _Graph(name);
        this.graphs?.addGraph(graph);
        this.selectGraph(graph);
    }

    selectGraph(graph:_Graph) {
        this.view.selectGraph(graph);
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
