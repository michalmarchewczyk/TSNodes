import classes from './jssBase';
import Input from './Input';

class InputBoolean extends Input<boolean> {

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
        (<HTMLInputElement>fieldElement.children[1]).oninput = () => {
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

    setValue(value:boolean) {
        this.value = value;
        if (!this.fieldElement || !this.elementField) return;
        (<HTMLInputElement>this.fieldElement.children[1]).checked = this.value;
    }

}

export default InputBoolean;
