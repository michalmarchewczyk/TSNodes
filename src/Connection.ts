import _Input from './Input';
import _Output from './Output';

class _Connection {

    constructor(public input:_Input<any>, public output:_Output<any>) {
    }
}

export default _Connection;
