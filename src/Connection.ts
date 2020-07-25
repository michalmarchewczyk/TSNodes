import _Input from './Input';
import _Output from './Output';

class _Connection {
    public input:_Input<any>;
    public output:_Output<any>;

    constructor(input:_Input<any>, output:_Output<any>) {
        this.input = input;
        this.output = output;
    }
}

export default _Connection;
