import _Input from './Input';
import _Output from './Output';
import _Connection from './Connection';

import jss from 'jss';
import preset from 'jss-preset-default';
import _Editor from './Editor';

jss.setup(preset());

import config from './config';

interface _NodeBox {
    pos:[number, number];
    width:number;
    collapsed:boolean;
    selected:boolean;
    active:boolean;
    zIndex:number;
}

const styles = {
    node: {
        display: 'block',
        position: 'absolute',
        background: '#777777',
        outline: (config.debugOutline) ? '1px solid blue' : 'none',
        minHeight: 40,
        height: 'auto',
        '&.nodeCollapsed': {
            maxHeight: 25,
            minHeight: 25,
            overflow: 'hidden',
            '& $name button': {
                borderStyle: 'solid',
                borderWidth: '6px 0 6px 10px',
                borderColor: 'transparent transparent transparent white',
                top: '-4px',
            }
        },
    },
    handleLeft: {
        display: 'block',
        position: 'absolute',
        top: 20,
        left: -8,
        width: 16,
        height: 'calc(100% - 20px)',
        outline: (config.debugOutline) ? '1px solid green' : 'none',
        cursor: 'ew-resize',
        zIndex: 20,
    },
    handleRight: {
        display: 'block',
        position: 'absolute',
        top: 20,
        right: -8,
        width: 16,
        height: 'calc(100% - 20px)',
        outline: (config.debugOutline) ? '1px solid green' : 'none',
        cursor: 'ew-resize',
        zIndex: 20,
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
        cursor: 'default',
        '& button': {
            display: 'inline-block',
            position: 'relative',
            width: 0,
            height: 0,
            outline: 'none',
            background: 'transparent',
            padding: '0',
            borderStyle: 'solid',
            borderWidth: '10px 6px 0 6px',
            borderColor: 'white transparent transparent transparent',
            margin: '4px',
            top: 0,
        }
    },
    nodeContainer: {
        display: 'block',
        position: 'relative',
        marginTop: 30,
        marginBottom: 8,
        left: 0,
        width: '100%',
        height: 'auto',
        outline: (config.debugOutline) ? '2px solid orange' : 'none',
        zIndex: 30,
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
        width: config.defaultNodeWidth,
        collapsed: false,
        selected: false,
        active: false,
        zIndex: 0,
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
        this.setupNodeControls();
        let name = document.createElement('div');
        name.className = classes.name;
        name.innerHTML = `<button></button><span>${this.name}</span>`;
        (<HTMLElement>name.children[0]).onclick = (e) => {
            if (this.nodeBox.collapsed) {
                this.nodeBox.collapsed = false;
                this.element.classList.remove('nodeCollapsed');
            } else {
                this.nodeBox.collapsed = true;
                this.element.classList.add('nodeCollapsed');
            }
        }
        this.element.appendChild(name);
        let nodeContainer = document.createElement('div');
        nodeContainer.className = classes.nodeContainer;
        this.element.appendChild(nodeContainer);
    }

    private setupNodeControls():void {
        this.element.onmousedown = (e) => {
            this.nodeBox.zIndex = this.editor.view.zIndex + 1;
            this.editor.view.zIndex += 1;
            this.element.style.zIndex = this.nodeBox.zIndex.toString();
            e.preventDefault();
            if (e.button !== 0) return;
            let clientX:number;
            let clientY:number;
            this.moving = true;
            this.editor.view.move = true;
            this.editor.view.container.onmousemove = (e) => {
                e.preventDefault();
                e.stopPropagation();
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
                this.editor.view.move = false;
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
                this.nodeBox.width = Math.min(config.maxNodeWidth, Math.max(config.minNodeWidth, this.nodeBox.width + deltaX / this.editor.view.zoom));
                if (old_width !== this.nodeBox.width) {
                    this.nodeBox.pos = [this.nodeBox.pos[0] - deltaX / this.editor.view.zoom, this.nodeBox.pos[1]];
                    this.element.style.left = this.nodeBox.pos[0] + 'px';
                }
                if (this.nodeBox.width !== config.minNodeWidth && this.nodeBox.width !== config.maxNodeWidth || !clientX) {
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
                this.nodeBox.width = Math.min(config.maxNodeWidth, Math.max(config.minNodeWidth, this.nodeBox.width + deltaX / this.editor.view.zoom));
                if (this.nodeBox.width !== config.minNodeWidth && this.nodeBox.width !== config.maxNodeWidth || !clientX) {
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
        this.element.children[3].appendChild(input.render());
    }

    addOutput(output:_Output<any>) {
        this.outputs.push(output);
        this.element.children[3].appendChild(output.render());
    }

    addConnection(input:_Input<any>, output:_Output<any>) {
        this.connections.push(new _Connection(input, output));
    }

    render():HTMLElement {
        this.element.style.left = this.nodeBox.pos[0] + 'px';
        this.element.style.top = this.nodeBox.pos[1] + 'px';
        this.element.style.width = this.nodeBox.width + 'px';
        this.element.style.zIndex = this.nodeBox.zIndex.toString();
        return this.element;
    }
}

export default _Node;
