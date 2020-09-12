import classes from './jssBase';
import Input from './Input';

class InputNumber extends Input<number> {

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
        inputElement.oninput = () => {
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

    setValue(value:number) {
        this.value = value;
        if (!this.fieldElement || !this.elementField) return;
        (<HTMLInputElement>this.fieldElement.children[0].children[2]).value = <any>this.value;
    }
}

export default InputNumber;
