import jss from 'jss';
import preset from 'jss-preset-default';
import config from './config';
import _Node from './Node';
import _Connection from './Connection';


jss.setup(preset());

const styles = {
    outputElement: {
        display: 'block',
        position: 'relative',
        top: 0,
        left: 0,
        minHeight: 20,
        outline: (config.debug) ? '1px solid red' : 'none',
        marginTop: 5,
        marginBottom: 5,
        textAlign: 'right',
        paddingRight: 10,
        paddingLeft: 8,
    },
    snap: {
        display: 'block',
        position: 'absolute',
        top: 2,
        right: -8,
        width: 16,
        height: 16,
        outline: (config.debug) ? '1px solid cyan' : 'none',
    },
    dot: {
        display: 'block',
        position: 'absolute',
        top: 4,
        left: 4,
        width: 8,
        height: 8,
        background: '#eeeeee',
        borderRadius: 10,
    }
}

const {classes} = jss.createStyleSheet(styles).attach();

type _OutputFn<T> = (inputs:any[]) => T;

class _Output<T> {
    public name:string;
    public fn:_OutputFn<T>;
    public element:HTMLElement;
    public node?:_Node;
    public snap?:HTMLElement;

    constructor(name:string, fn:_OutputFn<T>, private visible:boolean = true) {
        this.name = name;
        this.fn = fn;
        this.element = document.createElement('div');
        this.setupElement();
        this.setupSocket();
    }

    setupElement() {
        this.element.className = classes.outputElement;
        this.element.innerText = this.name;
        const snap = document.createElement('div');
        snap.className = classes.snap;
        const dot = document.createElement('div');
        dot.className = classes.dot;
        snap.appendChild(dot);
        this.element.appendChild(snap);
        this.snap = snap;
    }

    setupSocket() {
        if (!this.snap) return;
        this.snap.onmousedown = (e) => {
            if (!this.node || !this.snap) return;
            const foreground = this.node.editor.view.foreground;
            const view = this.node.editor.view;
            const foregroundState = this.node.editor.view.foregroundState;
            e.preventDefault();
            e.stopPropagation();
            this.node.editor.view.move = true;
            foregroundState.active = true;
            foregroundState.output = this;
            foregroundState.input = null;
            foregroundState.line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            foregroundState.line.setAttribute('x1', (this.snap.getBoundingClientRect().left + 8*view.zoom - foreground.getBoundingClientRect().left).toString());
            foregroundState.line.setAttribute('y1', (this.snap.getBoundingClientRect().top + 8*view.zoom  - foreground.getBoundingClientRect().top).toString());
            foregroundState.line.setAttribute('x2', (e.clientX - foreground.getBoundingClientRect().left).toString());
            foregroundState.line.setAttribute('y2', (e.clientY - foreground.getBoundingClientRect().top).toString());
            foreground.appendChild(foregroundState.line);
            view.container.onmousemove = (e) => {
                if (!this.node || !this.snap || !foregroundState.line) return;
                foregroundState.input = null;
                foregroundState.line.setAttribute('x1', (this.snap.getBoundingClientRect().left + 8*view.zoom - foreground.getBoundingClientRect().left).toString());
                foregroundState.line.setAttribute('y1', (this.snap.getBoundingClientRect().top + 8*view.zoom  - foreground.getBoundingClientRect().top).toString());
                foregroundState.line.setAttribute('x2', (e.clientX - foreground.getBoundingClientRect().left).toString());
                foregroundState.line.setAttribute('y2', (e.clientY - foreground.getBoundingClientRect().top).toString());
            }
            view.container.onmouseup = (e) => {
                if(foregroundState.input && foregroundState.output){
                    const connection = new _Connection(foregroundState.output, foregroundState.input);
                    view.createConnection(connection);
                }
                foregroundState.line?.remove();
                foregroundState.line = null;
                if(this.node) this.node.editor.view.move = false;
                foregroundState.active = false;
                foregroundState.input = null;
                foregroundState.output = null;
                view.container.onmousemove = null;
                view.container.onmouseup = null;
                view.container.onmouseleave = null;
            }
            view.container.onmouseleave = view.container.onmouseup;
        }
        this.snap.onmousemove = (e) => {
            if (!this.node || !this.snap) return;
            e.stopPropagation();
            const view = this.node.editor.view;
            const foregroundState = this.node.editor.view.foregroundState;
            const foreground = this.node.editor.view.foreground;
            if(foregroundState.active && foregroundState.line && foregroundState.output === null && foregroundState.input?.node !== this.node){
                // e.stopPropagation();
                foregroundState.output = this;
                foregroundState.line.setAttribute('x2', (this.snap.getBoundingClientRect().left + 8*view.zoom - foreground.getBoundingClientRect().left).toString());
                foregroundState.line.setAttribute('y2', (this.snap.getBoundingClientRect().top + 8*view.zoom  - foreground.getBoundingClientRect().top).toString());
            }
        }
    }

    render():HTMLElement {
        if(!this.visible) return document.createElement('div');
        return this.element;
    }
}

export default _Output;
