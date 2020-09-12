import Input from './Input';


class InputString extends Input<string> {
    constructor(name:string, defaultValue:string = '', elementField?:boolean, socket?:boolean) {
        super(name, defaultValue, elementField, socket);
    }
}


export default InputString;
