import _Input from './Input';
import _Output from './Output';
import _Connection from './Connection';

import jss from 'jss';
import preset from 'jss-preset-default';
import _Editor from './Editor';

jss.setup(preset());

const DEFAULT_WIDTH = 120;
const MIN_WIDTH = 80;
const MAX_WIDTH = 240;

interface _NodeBox {
    pos:[number, number];
    width:number;
    collapsed:boolean;
    selected:boolean;
    active:boolean;
}

const styles = {
    node: {
        display: 'block',
        position: 'absolute',
        background: '#777777',
        outline: '1px solid blue',
        minHeight: '80px',
    },
    handleLeft: {
        display: 'block',
        position: 'absolute',
        top: 10,
        left: -10,
        width: 20,
        height: 'calc(100% - 10px)',
        outline: '1px solid green',
        cursor: 'ew-resize',
    },
    handleRight: {
        display: 'block',
        position: 'absolute',
        top: 10,
        right: -10,
        width: 20,
        height: 'calc(100% - 10px)',
        outline: '1px solid green',
        cursor: 'ew-resize',
    },
    name: {
        display: 'block',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: 20,
        background: '#555555',
        color: 'white',
    }
}

const {classes} = jss.createStyleSheet(styles).attach();

abstract class _Node {
    public name:string;
    public inputs:_Input<any>[] = [];
    public outputs:_Output<any>[] = [];
    public connections:_Connection[] = [];
    public nodeBox:_NodeBox = {
        pos: [0, 0],
        width: DEFAULT_WIDTH,
        collapsed: false,
        selected: false,
        active: false,
    };
    public element:HTMLElement;
    public moving:boolean = false;
    private editor:_Editor;

    protected constructor(editor:_Editor, name:string) {
        this.editor = editor;
        this.name = name;
        this.element = document.createElement('div');
        this.setupElement();
    }

    setupElement():void {
        this.element.className = classes.node;
        let leftHandle = document.createElement('div');
        leftHandle.className = classes.handleLeft;
        this.element.appendChild(leftHandle);
        let rightHandle = document.createElement('div');
        rightHandle.className = classes.handleRight;
        this.element.appendChild(rightHandle);
        let name = document.createElement('div');
        name.className = classes.name;
        name.innerHTML = this.name;
        this.element.appendChild(name);
        this.setupNodeControls();
    }

    private setupNodeControls():void {
        this.element.onmousedown = (e) => {
            if (e.button !== 0) return;
            let clientX:number;
            let clientY:number;
            this.moving = true;
            this.editor.view.container.onmousemove = (e) => {
                if (!this.moving) return;
                let deltaX = clientX ? e.clientX - clientX : 0;
                let deltaY = clientY ? e.clientY - clientY : 0;
                clientX = e.clientX;
                clientY = e.clientY;
                this.nodeBox.pos = [this.nodeBox.pos[0] + deltaX / this.editor.view.zoom, this.nodeBox.pos[1] + deltaY / this.editor.view.zoom];
                this.element.style.left = this.nodeBox.pos[0] + 'px';
                this.element.style.top = this.nodeBox.pos[1] + 'px';
            }
            this.editor.view.container.onmouseup = (e) => {
                this.moving = false;
                this.editor.view.container.onmouseleave = null;
                this.editor.view.container.onmouseup = null;
                this.editor.view.container.onmousemove = null;
            }
            this.editor.view.container.onmouseleave = this.editor.view.container.onmouseup;
        }
        let leftHandle = <HTMLElement>this.element.children[0];
        let rightHandle = <HTMLElement>this.element.children[1];
        leftHandle.onmousedown = (e) => {
            e.stopPropagation();
            e.preventDefault();
            let clientX:number;
            this.editor.view.container.onmousemove = (e) => {
                let deltaX = clientX ? clientX - e.clientX : 0;
                let old_width = this.nodeBox.width;
                this.nodeBox.width = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, this.nodeBox.width + deltaX / this.editor.view.zoom));
                if (old_width !== this.nodeBox.width) {
                    this.nodeBox.pos = [this.nodeBox.pos[0] - deltaX / this.editor.view.zoom, this.nodeBox.pos[1]];
                    this.element.style.left = this.nodeBox.pos[0] + 'px';
                }
                if (this.nodeBox.width !== MIN_WIDTH && this.nodeBox.width !== MAX_WIDTH || !clientX) {
                    clientX = e.clientX;
                }
                this.element.style.width = this.nodeBox.width + 'px';
            }
            this.editor.view.container.onmouseup = (e) => {
                this.editor.view.container.onmouseleave = null;
                this.editor.view.container.onmouseup = null;
                this.editor.view.container.onmousemove = null;
            }
            this.editor.view.container.onmouseleave = this.editor.view.container.onmouseup;
        }
        rightHandle.onmousedown = (e) => {
            e.stopPropagation();
            e.preventDefault();
            let clientX:number;
            this.editor.view.container.onmousemove = (e) => {
                let deltaX = clientX ? e.clientX - clientX : 0;
                this.nodeBox.width = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, this.nodeBox.width + deltaX / this.editor.view.zoom));
                if (this.nodeBox.width !== MIN_WIDTH && this.nodeBox.width !== MAX_WIDTH || !clientX) {
                    clientX = e.clientX;
                }
                this.element.style.width = this.nodeBox.width + 'px';
            }
            this.editor.view.container.onmouseup = (e) => {
                this.editor.view.container.onmouseleave = null;
                this.editor.view.container.onmouseup = null;
                this.editor.view.container.onmousemove = null;
            }
            this.editor.view.container.onmouseleave = this.editor.view.container.onmouseup;
        }
    }

    addInput(input:_Input<any>) {
        this.inputs.push(input);
    }

    addOutput(output:_Output<any>) {
        this.outputs.push(output);
    }

    addConnection(input:_Input<any>, output:_Output<any>) {
        this.connections.push(new _Connection(input, output));
    }

    render():HTMLElement {
        console.log(this.nodeBox.pos);
        this.element.style.left = this.nodeBox.pos[0] + 'px';
        this.element.style.top = this.nodeBox.pos[1] + 'px';
        this.element.style.width = this.nodeBox.width + 'px';
        return this.element;
    }
}

export default _Node;
