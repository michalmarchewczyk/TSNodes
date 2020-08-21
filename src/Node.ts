import _Input, {_InputFloat, _InputNumber} from './Input';
import _Output, {_OutputFn} from './Output';
import _Connection from './Connection';

import _Editor from './Editor';


import config from './config';
import classes from './jssBase';

interface _NodeBox {
    pos:[number, number];
    width:number;
    collapsed:boolean;
    zIndex:number;
}

type nodeClass = (editor:_Editor, name:string) => any;

export {nodeClass}


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

    input<T>(name:string = 'input', defaultValue:T, elementField:boolean = true, socket:boolean = true) {
        this.addInput(new _Input<T>(name, defaultValue, elementField, socket));
    }

    inputNumber(name:string = 'input', defaultValue:number = 0, min:number = 0, max:number = 100, elementField?:boolean, socket?:boolean) {
        this.addInput(new _InputNumber(name, defaultValue, min, max, elementField, socket))
    }

    inputFloat(name:string = 'input', defaultValue:number = 0, min:number = 0, max:number = 1, step:number = 0.1, elementField?:boolean, socket?:boolean) {
        this.addInput(new _InputFloat(name, defaultValue, min, max, step, elementField, socket))
    }

    output<T>(name:string = 'output', fn:_OutputFn<any> = (inputs) => inputs, visible:boolean = true) {
        this.addOutput(new _Output<T>(name, fn, visible));
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
            this.collapse();
        }
        this.element.appendChild(name);

        const nodeContainer = document.createElement('div');
        nodeContainer.className = classes.nodeContainer;
        this.element.appendChild(nodeContainer);
    }

    setName(name:string) {
        this.name = name;
        (<HTMLElement>this.element.children[2].children[1]).innerText = this.name;
    }

    collapse(collapse?:boolean) {
        if(collapse === true || !this.nodeBox.collapsed){
            this.nodeBox.collapsed = true;
            this.element.classList.add(classes.nodeCollapsed);
        }else{
            this.nodeBox.collapsed = false;
            this.element.classList.remove(classes.nodeCollapsed);
        }
        this.editor.view.offsetX = (this.editor.view.scrollX - this.editor.view.container.getBoundingClientRect().left)/this.editor.view.zoom;
        this.editor.view.offsetY = (this.editor.view.scrollY - this.editor.view.container.getBoundingClientRect().top)/this.editor.view.zoom;
        this.updateConnections();
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
            this.editor.view.activeNode.element.classList.remove(classes.nodeActive);
            this.editor.view.activeNode.active = false;
            this.editor.view.activeNode = null;
        }
        this.element.classList.add(classes.nodeActive);
        this.active = true;
        this.editor.view.activeNode = this;
        this.editor.info.update();
    }

    select() {
        if(!this.editor.view.selectedNodes.includes(this)) this.editor.view.selectedNodes.push(this);
        this.element.classList.add(classes.nodeSelected);
        this.selected = true;
    }

    selectCheck() {
        if(!this.editor.view.keyboardState.shift){
            this.editor.view.selectedNodes.forEach(node => {
                node.element.classList.remove(classes.nodeSelected);
                node.selected = false;
            });
            this.editor.view.selectedNodes = [];
        }
    }

    move(deltaX:number, deltaY:number) {
        this.nodeBox.pos = [
            this.nodeBox.pos[0] + deltaX,
            this.nodeBox.pos[1] + deltaY
        ];
        this.element.style.left = this.nodeBox.pos[0] + 'px';
        this.element.style.top = this.nodeBox.pos[1] + 'px';
        // this.updateConnections();
        this.moveConnections(deltaX, deltaY);
    }

    private setupNodeControls():void {
        this.element.onmousedown = (e) => {
            this.nodeBox.zIndex = this.editor.view.zIndex + 1;
            this.editor.view.zIndex += 1;
            this.element.style.zIndex = this.nodeBox.zIndex.toString();

            e.preventDefault();
            e.stopPropagation();

            (<HTMLElement>document.activeElement).blur();

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
                const deltaX = (clientX ? e.clientX - clientX : 0) / this.editor.view.zoom;
                const deltaY = (clientY ? e.clientY - clientY : 0) / this.editor.view.zoom;
                clientX = e.clientX;
                clientY = e.clientY;
                this.editor.view.moveNodes(deltaX, deltaY);
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
        this.setupLeftHandle();
        this.setupRightHandle();
    }

    private setupLeftHandle() {
        const leftHandle = <HTMLElement>this.element.children[0];

        leftHandle.onmousedown = (e) => {
            e.stopPropagation();
            e.preventDefault();

            (<HTMLElement>document.activeElement).blur();

            this.editor.view.offsetX = (this.editor.view.scrollX - this.editor.view.container.getBoundingClientRect().left)/this.editor.view.zoom;
            this.editor.view.offsetY = (this.editor.view.scrollY - this.editor.view.container.getBoundingClientRect().top)/this.editor.view.zoom;

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
    }

    private setupRightHandle() {
        const rightHandle = <HTMLElement>this.element.children[1];

        rightHandle.onmousedown = (e) => {
            e.stopPropagation();
            e.preventDefault();

            (<HTMLElement>document.activeElement).blur();

            this.editor.view.offsetX = (this.editor.view.scrollX - this.editor.view.container.getBoundingClientRect().left)/this.editor.view.zoom;
            this.editor.view.offsetY = (this.editor.view.scrollY - this.editor.view.container.getBoundingClientRect().top)/this.editor.view.zoom;

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
        this.connections.forEach(connection => {
            if(connection.input.node === this){
                connection.getInputPos();
            }else if(connection.output.node === this){
                connection.getOutputPos();
            }
        })
        this.connections.forEach(connection => {
            if(connection.input.node === this){
                connection.setInputPos();
            }else if(connection.output.node === this){
                connection.setOutputPos();
            }
        });
    }

    private moveConnections(deltaX:number, deltaY:number) {
        this.connections.forEach(connection => {
            if(connection.input.node === this){
                connection.moveInputPos(deltaX, deltaY);
            }else if(connection.output.node === this){
                connection.moveOutputPos(deltaX, deltaY);
            }
        })
    }
}

export default _Node;
