import _Graph from './Graph';
import _Node from './Node';
import _Output from './Output';

class _Engine {
    index:number = 0;

    constructor() {

    }

    calculateNode(node:_Node):any[] {
        this.index = Date.now();
        const values = node.outputs.map(output => {
            return this.calculateOutput(output);
        });
        return values;
    }

    calculate(start:_Output<any>):any {
        this.index = Date.now();
        const value = this.calculateOutput(start);
        return value;
    }

    calculateOutput(output:_Output<any>):any {
        if(!output.node) return;
        if(!output.value || output.value.index !== this.index){
            const inputs = output.node.inputs.map(input => {
                if(input.connection){
                    return this.calculateOutput(input.connection.output);
                }else{
                    return input.value;
                }
            });
            const value = output.fn(inputs);
            output.value = {
                index: this.index,
                value,
            }
        }
        return output.value.value;
    }
}

export default _Engine;
