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
    zIndex:number;
}

type nodeClass = (editor:_Editor, name:string) => any;

export {nodeClass}

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
        '&.nodeSelected': {
            outline: '1px solid white',
        },
        '&.nodeActive': {
            outline: '2px solid white',
        }
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
    public inputs:_Input<any>[] = [];
    public outputs:_Output<any>[] = [];
    public connections:_Connection[] = [];
    public nodeBox:_NodeBox = {
        pos: [0, 0],
        width: config.defaultNodeWidth,
        collapsed: false,
        zIndex: 0,
    };
    public element:HTMLElement;
    public moving:boolean = false;
    public selected:boolean = false;
    public active:boolean = false;

    protected constructor(public editor:_Editor, public name:string) {
        this.element = document.createElement('div');
        this.setupElement();
    }

    setupElement():void {
        this.element.className = classes.node;
        const leftHandle = document.createElement('div');
        leftHandle.className = classes.handleLeft;
        this.element.appendChild(leftHandle);
        const rightHandle = document.createElement('div');
        rightHandle.className = classes.handleRight;
        this.element.appendChild(rightHandle);
        this.setupNodeControls();
        const name = document.createElement('div');
        name.className = classes.name;
        name.innerHTML = `<button></button><span>${this.name}</span>`;
        (<HTMLElement>name.children[0]).onclick = () => {
            if (this.nodeBox.collapsed) {
                this.nodeBox.collapsed = false;
                this.element.classList.remove('nodeCollapsed');
            } else {
                this.nodeBox.collapsed = true;
                this.element.classList.add('nodeCollapsed');
            }
        }
        this.element.appendChild(name);
        const nodeContainer = document.createElement('div');
        nodeContainer.className = classes.nodeContainer;
        this.element.appendChild(nodeContainer);
    }

    addInput(input:_Input<any>) {
        this.inputs.push(input);
        input.node = this;
        this.element.children[3].appendChild(input.render());
    }

    addOutput(output:_Output<any>) {
        this.outputs.push(output);
        output.node = this;
        this.element.children[3].appendChild(output.render());
    }

    addConnection(connection:_Connection) {
        this.connections.push(connection);
    }

    deleteConnection(connection:_Connection) {
        if(this.connections.includes(connection)){
            const index = this.connections.indexOf(connection);
            if(index > -1) {
                this.connections.splice(index, 1);
            }
        }
    }

    render():HTMLElement {
        this.element.style.left = this.nodeBox.pos[0] + 'px';
        this.element.style.top = this.nodeBox.pos[1] + 'px';
        this.element.style.width = this.nodeBox.width + 'px';
        this.element.style.zIndex = this.nodeBox.zIndex.toString();
        return this.element;
    }

    activate() {
        if(this.editor.view.activeNode){
            this.editor.view.activeNode.element.classList.remove('nodeActive');
            this.editor.view.activeNode.active = false;
            this.editor.view.activeNode = null;
        }
        this.element.classList.add('nodeActive');
        this.active = true;
        this.editor.view.activeNode = this;
    }

    select() {
        if(!this.editor.view.selectedNodes.includes(this)) this.editor.view.selectedNodes.push(this);
        this.element.classList.add('nodeSelected');
        this.selected = true;
    }

    selectCheck() {
        if(!this.editor.view.keyboardState.shift){
            this.editor.view.selectedNodes.forEach(node => {
                node.element.classList.remove('nodeSelected');
                node.selected = false;
            });
            this.editor.view.selectedNodes = [];
        }
    }

    private setupNodeControls():void {
        this.element.onmousedown = (e) => {
            this.nodeBox.zIndex = this.editor.view.zIndex + 1;
            this.editor.view.zIndex += 1;
            this.element.style.zIndex = this.nodeBox.zIndex.toString();
            e.preventDefault();
            e.stopPropagation();
            if (e.button !== 0) return;
            let clientX:number;
            let clientY:number;
            this.moving = true;
            this.activate();
            this.selectCheck();
            this.select();
            this.editor.view.move = true;
            this.editor.view.container.onmousemove = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!this.moving) return;
                const deltaX = clientX ? e.clientX - clientX : 0;
                const deltaY = clientY ? e.clientY - clientY : 0;
                clientX = e.clientX;
                clientY = e.clientY;
                this.nodeBox.pos = [
                    this.nodeBox.pos[0] + deltaX / this.editor.view.zoom,
                    this.nodeBox.pos[1] + deltaY / this.editor.view.zoom
                ];
                this.element.style.left = this.nodeBox.pos[0] + 'px';
                this.element.style.top = this.nodeBox.pos[1] + 'px';
                this.updateConnections();
            }
            this.editor.view.container.onmouseup = () => {
                this.moving = false;
                this.editor.view.move = false;
                this.editor.view.container.onmouseleave = null;
                this.editor.view.container.onmouseup = null;
                this.editor.view.container.onmousemove = null;
            }
            this.editor.view.container.onmouseleave = this.editor.view.container.onmouseup;
        }
        const leftHandle = <HTMLElement>this.element.children[0];
        const rightHandle = <HTMLElement>this.element.children[1];
        leftHandle.onmousedown = (e) => {
            e.stopPropagation();
            e.preventDefault();
            let clientX:number;
            this.editor.view.container.onmousemove = (e) => {
                const deltaX = clientX ? clientX - e.clientX : 0;
                const oldWidth = this.nodeBox.width;
                this.nodeBox.width = Math.min(config.maxNodeWidth, Math.max(config.minNodeWidth, this.nodeBox.width + deltaX / this.editor.view.zoom));
                if (oldWidth !== this.nodeBox.width) {
                    this.nodeBox.pos = [this.nodeBox.pos[0] - deltaX / this.editor.view.zoom, this.nodeBox.pos[1]];
                    this.element.style.left = this.nodeBox.pos[0] + 'px';
                }
                if (this.nodeBox.width !== config.minNodeWidth && this.nodeBox.width !== config.maxNodeWidth || !clientX) {
                    clientX = e.clientX;
                }
                this.element.style.width = this.nodeBox.width + 'px';
                this.updateConnections();
            }
            this.editor.view.container.onmouseup = () => {
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
                const deltaX = clientX ? e.clientX - clientX : 0;
                this.nodeBox.width = Math.min(config.maxNodeWidth, Math.max(config.minNodeWidth, this.nodeBox.width + deltaX / this.editor.view.zoom));
                if (this.nodeBox.width !== config.minNodeWidth && this.nodeBox.width !== config.maxNodeWidth || !clientX) {
                    clientX = e.clientX;
                }
                this.element.style.width = this.nodeBox.width + 'px';
                this.updateConnections();
            }
            this.editor.view.container.onmouseup = () => {
                this.editor.view.container.onmouseleave = null;
                this.editor.view.container.onmouseup = null;
                this.editor.view.container.onmousemove = null;
            }
            this.editor.view.container.onmouseleave = this.editor.view.container.onmouseup;
        }
    }

    private updateConnections() {
        this.editor.view.offsetX = (this.editor.view.scrollX - this.editor.view.container.getBoundingClientRect().left)/this.editor.view.zoom;
        this.editor.view.offsetY = (this.editor.view.scrollY - this.editor.view.container.getBoundingClientRect().top)/this.editor.view.zoom;
        this.connections.forEach(connection => {
            if(connection.input.node === this){
                connection.updateInputPos();
            }else if(connection.output.node === this){
                connection.updateOutputPos();
            }
        });
    }
}

export default _Node;
