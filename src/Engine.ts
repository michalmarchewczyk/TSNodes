import Node from './Node';
import Output from './Output';

class Engine {
    index:number = 0;

    constructor() {

    }

    calculateNode(node:Node):any[] {
        this.index = Date.now();
        const values = node.outputs.map(output => {
            return this.calculateOutput(output);
        });
        return values;
    }

    calculate(start:Output<any>):any {
        this.index = Date.now();
        const value = this.calculateOutput(start);
        return value;
    }

    calculateOutput(output:Output<any>):any {
        if (!output.node) return;
        if (!output.value || output.value.index !== this.index) {
            const inputs = output.node.inputs.map(input => {
                if (input.connection) {
                    return this.calculateOutput(input.connection.output);
                } else {
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

    checkNode(node:Node):boolean {
        let rec = false;
        node.inputs.forEach(input => {
            if (input.connection) {
                const check = this.checkOutput(node, input.connection.output);
                if (check.includes(node)) {
                    rec = true;
                }
            }
        })
        return rec;
    }

    checkOutput(node:Node, output:Output<any>):Node[] {
        if (!output.node) return [];

        let nodes = output.node.inputs.map(input => {
            if (input.connection && input.node !== node) {
                return this.checkOutput(node, input.connection.output);
            } else {
                return [];
            }
        }).flat();

        nodes = [...nodes, output.node];

        return nodes;
    }

}

export default Engine;
