import Node from './Node';
import Connection from './Connection';

import classes from './jssBase';


class Input<T> {
    public value:T;
    public element:HTMLElement;
    public node?:Node;
    public snap?:HTMLElement;
    public fieldElement?:HTMLElement;

    constructor(public name:string, public defaultValue:T, public elementField:boolean = true, private socket:boolean = true) {
        this.value = this.defaultValue;
        this.element = document.createElement('div');
    }

    public _connection:Connection | null = null;

    get connection():(Connection | null) {
        return this._connection;
    }

    set connection(connection:Connection | null) {
        this._connection = connection;
        this.refresh();
    }

    setupElement() {
        this.element.className = classes.inputElement;
        if (this.socket) {
            const snap = document.createElement('div');
            snap.className = classes.inputSnap;
            const dot = document.createElement('div');
            dot.className = classes.inputDot;
            snap.appendChild(dot);
            this.element.appendChild(snap);
            this.snap = snap;
        }
        if (this.elementField) {
            this.fieldElement = this.renderField();
            this.element.appendChild(this.fieldElement);
        } else {
            const span = document.createElement('span');
            span.innerText = this.name;
            this.element.appendChild(span);
        }
    }

    refresh() {
        if (this.elementField && !this._connection) {
            if (this.fieldElement && !this.element.contains(this.fieldElement)) {
                this.element.removeChild(this.element.children[1]);
                this.element.appendChild(this.fieldElement);
            }
        } else {
            if (this.fieldElement) {
                this.element.removeChild(this.fieldElement);
                const span = document.createElement('span');
                span.innerText = this.name;
                this.element.appendChild(span);
            }
        }
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
            if (!this.connection) {
                foregroundState.active = true;
                foregroundState.input = this;
                foregroundState.output = null;
                foregroundState.line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                foregroundState.line.setAttribute('x1', (this.snap.getBoundingClientRect().left + 8 * view.zoom - foreground.getBoundingClientRect().left).toString());
                foregroundState.line.setAttribute('y1', (this.snap.getBoundingClientRect().top + 8 * view.zoom - foreground.getBoundingClientRect().top).toString());
                foregroundState.line.setAttribute('x2', (e.clientX - foreground.getBoundingClientRect().left).toString());
                foregroundState.line.setAttribute('y2', (e.clientY - foreground.getBoundingClientRect().top).toString());
                foreground.appendChild(foregroundState.line);
                view.container.onmousemove = (e) => {
                    if (!this.node || !this.snap || !foregroundState.line) return;
                    foregroundState.output = null;
                    foregroundState.line.setAttribute('x1', (this.snap.getBoundingClientRect().left + 8 * view.zoom - foreground.getBoundingClientRect().left).toString());
                    foregroundState.line.setAttribute('y1', (this.snap.getBoundingClientRect().top + 8 * view.zoom - foreground.getBoundingClientRect().top).toString());
                    foregroundState.line.setAttribute('x2', (e.clientX - foreground.getBoundingClientRect().left).toString());
                    foregroundState.line.setAttribute('y2', (e.clientY - foreground.getBoundingClientRect().top).toString());
                }
                view.container.onmouseup = (e) => {
                    if (foregroundState.input && foregroundState.output) {
                        const connection = new Connection(foregroundState.output, foregroundState.input);
                        this.node?.editor.selectedGraph?.createConnection(connection);
                    }
                    foregroundState.line?.remove();
                    foregroundState.line = null;
                    if (this.node) this.node.editor.view.move = false;
                    foregroundState.active = false;
                    foregroundState.input = null;
                    foregroundState.output = null;
                    view.container.onmousemove = null;
                    view.container.onmouseup = null;
                    view.container.onmouseleave = null;
                }
                view.container.onmouseleave = view.container.onmouseup;
            } else {
                this.connection.line.style.opacity = '0';
                const output = this.connection.output;
                if (!output.snap) return;
                foregroundState.active = true;
                foregroundState.input = null;
                foregroundState.output = output;
                foregroundState.line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                foregroundState.line.setAttribute('x1', (output.snap.getBoundingClientRect().left + 8 * view.zoom - foreground.getBoundingClientRect().left).toString());
                foregroundState.line.setAttribute('y1', (output.snap.getBoundingClientRect().top + 8 * view.zoom - foreground.getBoundingClientRect().top).toString());
                foregroundState.line.setAttribute('x2', (e.clientX - foreground.getBoundingClientRect().left).toString());
                foregroundState.line.setAttribute('y2', (e.clientY - foreground.getBoundingClientRect().top).toString());
                foreground.appendChild(foregroundState.line);
                view.container.onmousemove = (e) => {
                    if (!this.node || !this.snap || !foregroundState.line || !output.snap) return;
                    foregroundState.input = null;
                    foregroundState.line.setAttribute('x1', (output.snap.getBoundingClientRect().left + 8 * view.zoom - foreground.getBoundingClientRect().left).toString());
                    foregroundState.line.setAttribute('y1', (output.snap.getBoundingClientRect().top + 8 * view.zoom - foreground.getBoundingClientRect().top).toString());
                    foregroundState.line.setAttribute('x2', (e.clientX - foreground.getBoundingClientRect().left).toString());
                    foregroundState.line.setAttribute('y2', (e.clientY - foreground.getBoundingClientRect().top).toString());
                }
                view.container.onmouseup = (e) => {
                    if (foregroundState.input === this) {
                        if (this.connection) this.connection.line.style.opacity = '1';
                    } else {
                        if (this.connection) this.node?.editor.selectedGraph?.deleteConnection(this.connection);
                        if (foregroundState.input && foregroundState.output) {
                            const connection = new Connection(foregroundState.output, foregroundState.input);
                            this.node?.editor.selectedGraph?.createConnection(connection);
                        }
                    }
                    foregroundState.line?.remove();
                    foregroundState.line = null;
                    if (this.node) this.node.editor.view.move = false;
                    foregroundState.active = false;
                    foregroundState.input = null;
                    foregroundState.output = null;
                    view.container.onmousemove = null;
                    view.container.onmouseup = null;
                    view.container.onmouseleave = null;
                }
                view.container.onmouseleave = view.container.onmouseup;
            }
        }
        this.snap.onmousemove = (e) => {
            if (!this.node || !this.snap) return;
            e.stopPropagation();
            const view = this.node.editor.view;
            const foregroundState = this.node.editor.view.foregroundState;
            const foreground = this.node.editor.view.foreground;
            if (foregroundState.active && foregroundState.line && foregroundState.input === null && foregroundState.output?.node !== this.node) {
                foregroundState.input = this;
                foregroundState.line.setAttribute('x2', (this.snap.getBoundingClientRect().left + 8 * view.zoom - foreground.getBoundingClientRect().left).toString());
                foregroundState.line.setAttribute('y2', (this.snap.getBoundingClientRect().top + 8 * view.zoom - foreground.getBoundingClientRect().top).toString());
            }
        }
    }

    renderField():HTMLElement {
        const fieldElement = document.createElement('div');
        fieldElement.className = classes.fieldElement;
        fieldElement.innerHTML = `<span>${this.name}</span><input value='${this.value}'>`;
        (<HTMLElement>fieldElement.children[1]).onmousedown = (e) => {
            e.stopPropagation();
            if (e.button !== 0) e.preventDefault();
            if (e.button === 1) {
                this.value = this.defaultValue;
                (<HTMLInputElement>fieldElement.children[1]).value = <any>this.value;
            }
        }
        (<HTMLInputElement>fieldElement.children[1]).oninput = () => {
            this.value = <any>(<HTMLInputElement>fieldElement.children[1]).value;
            (<HTMLInputElement>fieldElement.children[1]).value = <any>this.value;
        }
        return fieldElement;
    }

    setValue(value:T) {
        this.value = value;
        if (!this.fieldElement || !this.elementField) return;
        (<HTMLInputElement>this.fieldElement.children[1]).value = <any>this.value;
    }

    render():HTMLElement {
        this.setupElement();
        if (this.socket) this.setupSocket();
        return this.element;
    }
}


export default Input;
