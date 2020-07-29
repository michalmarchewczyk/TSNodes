import jss from 'jss';
import preset from 'jss-preset-default';
import config from './config';


jss.setup(preset());

const styles = {
    inputElement: {
        display: 'block',
        position: 'relative',
        top: 0,
        left: 0,
        minHeight: 20,
        height: 20,
        maxHeight: 20,
        outline: (config.debugOutline) ? '1px solid red' : 'none',
        marginTop: 5,
        marginBottom: 5,
        paddingLeft: 10,
        paddingRight: 8,
    },
    snap: {
        display: 'block',
        position: 'absolute',
        top: 2,
        left: -8,
        width: 16,
        height: 16,
        outline: (config.debugOutline) ? '1px solid cyan' : 'none',
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
    },
    fieldElement: {
        display: 'flex',
        position: 'absolute',
        width: 'calc(100% - 16px)',
        height: '100%',
        overflow: 'hidden',
        '& span': {
            flex: '0 1 auto',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            '&::after': {
                content: '":\\00a0"',
            }
        },
        '& input': {
            display: 'inline-block',
            position: 'relative',
            flex: '1 1 20px',
            minWidth: 20,
            outline: 'none',
            border: 'none',
        }
    },
    fieldElementNumber: {
        display: 'inline-block',
        position: 'absolute',
        width: 'calc(100% - 18px)',
        height: '100%',
        overflow: 'hidden',
        '& div': {
            display: 'flex',
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: '#555555',
            overflow: 'hidden',
            '& button:first-child': {
                flex: '0 0 20px',
                background: 'transparent',
                border: 'none',
                '&::before': {
                    content: '""',
                    display: 'block',
                    width: 0,
                    height: 0,
                    borderStyle: 'solid',
                    borderWidth: '6px 9px 6px 0',
                    borderColor: 'transparent white transparent transparent',
                }
            },
            '& span': {
                flex: '0 1 auto',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                '&::after': {
                    content: '":\\00a0"',
                }
            },
            '& input': {
                '-moz-appearance': 'textfield',
                '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': {
                    '-webkit-appearance': 'none',
                    margin: 0,
                },
                flex: '1 1 20px',
                minWidth: 20,
                border: 'none',
                outline: 'none',
            },
            '& button:last-child': {
                flex: '0 0 20px',
                background: 'transparent',
                border: 'none',
                '&::before': {
                    content: '""',
                    display: 'block',
                    width: 0,
                    height: 0,
                    borderStyle: 'solid',
                    borderWidth: '6px 0 6px 9px',
                    borderColor: 'transparent transparent transparent white',
                }
            },
        },
    },
    fieldElementBoolean: {
        display: 'flex',
        position: 'absolute',
        width: 'calc(100% - 16px)',
        height: '100%',
        overflow: 'hidden',
        '& span': {
            flex: '0 1 auto',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            '&::after': {
                content: '":\\00a0"',
            }
        },
        '& input': {
            display: 'inline-block',
            position: 'relative',
            flex: '0 1 20px',
            minWidth: 20,
        }
    }
}

const {classes} = jss.createStyleSheet(styles).attach();


class _Input<T> {
    public value:T;
    public element:HTMLElement;

    constructor(public name:string, public defaultValue:T, private elementField:boolean = true, private socket:boolean = true) {
        this.value = this.defaultValue;
        this.element = document.createElement('div');
        this.setupElement();
    }

    setupElement() {
        this.element.className = classes.inputElement;
        if (this.socket) {
            const snap = document.createElement('div');
            snap.className = classes.snap;
            const dot = document.createElement('div');
            dot.className = classes.dot;
            snap.appendChild(dot);
            this.element.appendChild(snap);
        }
        if (this.elementField) {
            this.element.appendChild(this.renderField());
        } else {
            const span = document.createElement('span');
            span.innerText = this.name;
            this.element.appendChild(span);
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
        (<HTMLInputElement>fieldElement.children[1]).onchange = () => {
            this.value = <any>(<HTMLInputElement>fieldElement.children[0].children[2]).value;
            (<HTMLInputElement>fieldElement.children[1]).value = <any>this.value;
        }
        return fieldElement;
    }

    render():HTMLElement {
        return this.element;
    }
}


class _InputNumber extends _Input<number> {

    constructor(name:string, defaultValue:number = 0, public min:number = 0, public max:number = 100, elementField?:boolean, socket?:boolean) {
        super(name, defaultValue, elementField, socket);
    }

    renderField():HTMLElement {
        const fieldElement = document.createElement('div');
        fieldElement.className = classes.fieldElementNumber;
        fieldElement.innerHTML = `<div>
            <button></button>
            <span>${this.name}</span>
            <input type='number' value='${this.value}' min='${this.min}' max='${this.max}'>
            <button></button>
            </div>`;
        const inputElement = <HTMLInputElement>fieldElement.children[0].children[2];
        inputElement.onmousedown = (e) => {
            e.stopPropagation();
            if (e.button !== 0) e.preventDefault();
            if (e.button === 1) {
                this.value = this.defaultValue;
                inputElement.value = this.value.toString();
            }
        }
        inputElement.onchange = () => {
            this.value = parseInt(inputElement.value, 10);
            this.value = Math.max(this.min, Math.min(this.max, this.value));
            inputElement.value = this.value.toString();
        }
        (<HTMLElement>fieldElement.children[0].children[0]).onmousedown = () => {
            this.value = Math.max(this.min, Math.min(this.max, this.value - 1));
            inputElement.value = this.value.toString();
        }
        (<HTMLElement>fieldElement.children[0].children[3]).onmousedown = () => {
            this.value = Math.max(this.min, Math.min(this.max, this.value + 1));
            inputElement.value = this.value.toString();
        }
        return fieldElement;
    }
}


class _InputFloat extends _Input<number> {

    constructor(name:string, defaultValue:number = 0, public min:number = 0, public max:number = 1, public step:number = 0.1, elementField?:boolean, socket?:boolean) {
        super(name, defaultValue, elementField, socket);
    }

    renderField():HTMLElement {
        const fieldElement = document.createElement('div');
        fieldElement.className = classes.fieldElementNumber;
        fieldElement.innerHTML = `<div>
            <button></button>
            <span>${this.name}</span>
            <input type='number' value='${this.value}' min='${this.min}' max='${this.max}'>
            <button></button>
            </div>`;
        const inputElement = <HTMLInputElement>fieldElement.children[0].children[2];
        inputElement.onmousedown = (e) => {
            e.stopPropagation();
            if (e.button !== 0) e.preventDefault();
        }
        inputElement.onmousedown = (e) => {
            e.stopPropagation();
            if (e.button !== 0) e.preventDefault();
            if (e.button === 1) {
                this.value = this.defaultValue;
                inputElement.value = this.value.toString();
            }
        }
        inputElement.onchange = () => {
            this.value = parseFloat((<HTMLInputElement>fieldElement.children[0].children[2]).value);
            this.value = Math.max(this.min, Math.min(this.max, this.value));
            this.value = Math.round(this.value * 1000000) / 1000000;
            inputElement.value = this.value.toString();
        }
        (<HTMLElement>fieldElement.children[0].children[0]).onmousedown = () => {
            this.value = Math.max(this.min, Math.min(this.max, this.value - this.step));
            this.value = Math.round(this.value * 1000000) / 1000000;
            inputElement.value = this.value.toString();
        }
        (<HTMLElement>fieldElement.children[0].children[3]).onmousedown = () => {
            this.value = Math.max(this.min, Math.min(this.max, this.value + this.step));
            this.value = Math.round(this.value * 1000000) / 1000000;
            inputElement.value = this.value.toString();
        }
        return fieldElement;
    }
}


class _InputBoolean extends _Input<boolean> {

    constructor(name:string, defaultValue:boolean = false, elementField?:boolean, socket?:boolean) {
        super(name, defaultValue, elementField, socket);
    }

    renderField():HTMLElement {
        const fieldElement = document.createElement('div');
        fieldElement.className = classes.fieldElementBoolean;
        fieldElement.innerHTML = `
        <span>${this.name}</span>
        <input type='checkbox' ${this.value ? 'checked' : ''}>
        `;
        (<HTMLInputElement>fieldElement.children[1]).onchange = () => {
            this.value = (<HTMLInputElement>fieldElement.children[1]).checked;
            (<HTMLInputElement>fieldElement.children[1]).checked = this.value;
        }
        (<HTMLElement>fieldElement.children[1]).onmousedown = (e) => {
            e.stopPropagation();
            if (e.button !== 0) e.preventDefault();
            if (e.button === 1) {
                this.value = this.defaultValue;
                (<HTMLInputElement>fieldElement.children[1]).checked = this.value;
            }
        }
        return fieldElement;
    }
}


class _InputString extends _Input<string> {
    constructor(name:string, defaultValue:string = '', elementField?:boolean, socket?:boolean) {
        super(name, defaultValue, elementField, socket);
    }
}


export default _Input;

export {
    _InputNumber,
    _InputFloat,
    _InputBoolean,
    _InputString,
}
