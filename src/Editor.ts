import _Graph from './Graph';
import _Node from './Node';

import jss from 'jss';
import preset from 'jss-preset-default';

jss.setup(preset());

const DEFAULT_CANVAS_WIDTH = 4000;
const DEFAULT_CANVAS_HEIGHT = 4000;

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
        width: DEFAULT_CANVAS_WIDTH,
        height: DEFAULT_CANVAS_HEIGHT,
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
    public sizeX:number = DEFAULT_CANVAS_WIDTH;
    public sizeY:number = DEFAULT_CANVAS_HEIGHT;
    public move:boolean = false;

    public graph?:_Graph;

    constructor() {
        this.container = document.createElement('div');
        this.container.className = classes.view;
        this.container = <HTMLElement>this.container;
        this.canvas = document.createElement('div');
        this.background = document.createElementNS("http://www.w3.org/2000/svg", 'svg');

        this.setupContainer();
        this.setupControls();
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
        window.addEventListener('load', (e) => {
            this.container.scrollLeft = DEFAULT_CANVAS_WIDTH/2 - this.container.getBoundingClientRect().width/2;
            this.container.scrollTop = DEFAULT_CANVAS_HEIGHT/2 - this.container.getBoundingClientRect().height/2;
            this.scrollX = this.container.scrollLeft;
            this.scrollY = this.container.scrollTop;
        });
        this.canvas.onmousedown = (e)=> {
            e.preventDefault();
            e.stopPropagation();

            let clientX:number;
            let clientY:number;
            if(e.button !== 1 || this.move) return;
            this.move = true;
            this.container.style.cursor = 'move';
            this.canvas.onmouseup = (e) => {
                e.preventDefault();
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

                let deltaX = clientX? clientX - e.clientX : 0;
                let deltaY = clientY? clientY - e.clientY : 0;
                clientX = e.clientX;
                clientY = e.clientY;

                this.container.scrollLeft = this.scrollX + deltaX;
                this.container.scrollTop = this.scrollY + deltaY;
                this.scrollX = this.container.scrollLeft;
                this.scrollY = this.container.scrollTop;
            }
        };
    }

    private setupZoom () {
        this.container.onwheel = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if(this.move) return;

            let old_zoom = this.zoom;
            this.zoom = this.zoom - Math.sign(e.deltaY) * 0.1;
            this.zoom = Math.min(Math.max(0.6, this.zoom), 2)
            this.canvas.style.transform = `scale(${this.zoom})`;
            let rescale = this.zoom/old_zoom - 1;

            let mouseX = e.clientX - this.container.getBoundingClientRect().left;
            let mouseY = e.clientY - this.container.getBoundingClientRect().top;
            this.container.scrollTop += (this.scrollY+mouseY)*rescale;
            this.container.scrollLeft += (this.scrollX+mouseX)*rescale;
            this.scrollY = this.container.scrollTop;
            this.scrollX = this.container.scrollLeft;
        }
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
