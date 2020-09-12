import config from './config';
import Graph from './Graph';
import GraphClipboard from './GraphClipboard';
import Node from './Node';
import classes from './jssBase';
import Connection from './Connection';
import {elementContainsNodes} from './utils';
import Editor from './Editor';
import Input from './Input';
import Output from './Output';


interface foregroundState {
    input:Input<any> | null;
    output:Output<any> | null;
    active:boolean;
    line:SVGLineElement | null;
}


class EditorView {
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


    public clipboard?:GraphClipboard;

    constructor(private editor:Editor) {
        this.container = document.createElement('div');
        this.container.className = classes.view;
        this.container = <HTMLElement>this.container;
        this.canvas = document.createElement('div');
        this.background = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.foreground = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.setupContainer();
        this.setupControls();
    }

    appendNode(node:Node) {
        const nodeElement = node.render();
        node.nodeBox.zIndex = this.zIndex;
        node.element.style.zIndex = node.nodeBox.zIndex.toString();
        this.zIndex = this.zIndex + 1;
        this.canvas.appendChild(nodeElement);
    }

    centerNode(node:Node, centerX:number, centerY:number) {
        const deltaX = (this.scrollX + this.container.getBoundingClientRect().width / 2) / this.zoom - centerX - 20;
        const deltaY = (this.scrollY + this.container.getBoundingClientRect().height / 2) / this.zoom - centerY - 20;
        node.move(deltaX, deltaY);
    }

    appendConnection(connection:Connection) {
        this.offsetX = (this.scrollX - this.container.getBoundingClientRect().left) / this.zoom;
        this.offsetY = (this.scrollY - this.container.getBoundingClientRect().top) / this.zoom;
        connection.updateInputPos();
        connection.updateOutputPos();
        const line = connection.render();
        this.background.appendChild(line);
    }

    removeConnection(connection:Connection) {
        const line = connection.render();
        this.background.removeChild(line);
    }

    moveNodes(deltaX:number, deltaY:number) {
        this.offsetX = (this.scrollX - this.container.getBoundingClientRect().left) / this.zoom;
        this.offsetY = (this.scrollY - this.container.getBoundingClientRect().top) / this.zoom;
        window.requestAnimationFrame(() => {
            this.editor.selectedGraph?.selectedNodes.forEach(node => {
                node.move(deltaX, deltaY);
            });
        })
    }

    removeNode(node:Node) {
        const nodeElement = node.render();
        this.canvas.removeChild(nodeElement);
    }

    render():HTMLElement {
        const element = document.createElement('div');
        element.appendChild(this.container);
        element.appendChild(this.foreground);
        return element;
    }

    renderGraph(graph?:Graph) {
        this.canvas.innerHTML = '';
        this.canvas.appendChild(this.background);
        this.background.innerHTML = '';
        if (!graph) return;
        this.renderGraphNodes(graph);
        this.renderGraphConnections(graph);
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

    private setupSelect() {
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;

            if (!this.editor.keyboardController.keyboardState.shift) {
                this.editor.selectedGraph?.deactivateNode();
                this.editor.selectedGraph?.deselectNodes();
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
                const nodes = elementContainsNodes(selectBox, this.editor.selectedGraph?.nodes ?? []);
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

    private renderGraphNodes(graph:Graph) {
        graph.nodes.forEach((node) => {
            const nodeElement = node.render();
            this.canvas.appendChild(nodeElement);
        });
    }

    private renderGraphConnections(graph:Graph) {
        graph.connections.forEach(connection => {
            const line = connection.render();
            this.offsetX = (this.scrollX - this.container.getBoundingClientRect().left) / this.zoom;
            this.offsetY = (this.scrollY - this.container.getBoundingClientRect().top) / this.zoom;
            connection.updateInputPos();
            connection.updateOutputPos();
            this.background.appendChild(line);
        });
    }
}


export default EditorView;
