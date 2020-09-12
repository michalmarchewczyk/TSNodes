import Input from './Input';
import Output from './Output';

class Connection {
    public line:SVGLineElement;
    public inputPos:[number, number] = [0, 0];
    public outputPos:[number, number] = [0, 0];

    constructor(public output:Output<any>, public input:Input<any>) {
        this.line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        this.setupElement();
    }

    setupElement() {
        this.updateInputPos();
        this.updateOutputPos();
    }

    getInputPos() {
        const view = this.input.node?.editor.view;
        if (!view || !this.input.snap) return;
        this.inputPos = [this.input.snap.getBoundingClientRect().left / view.zoom + view.offsetX + 8, this.input.snap.getBoundingClientRect().top / view.zoom + view.offsetY + 8];
    }

    getOutputPos() {
        const view = this.output.node?.editor.view;
        if (!view || !this.output.snap) return;
        this.outputPos = [this.output.snap.getBoundingClientRect().left / view.zoom + view.offsetX + 8, this.output.snap.getBoundingClientRect().top / view.zoom + view.offsetY + 8];
    }

    updateInputPos() {
        this.getInputPos();
        this.setInputPos();
    }

    updateOutputPos() {
        this.getOutputPos();
        this.setOutputPos();
    }

    setInputPos() {
        this.line.setAttribute('x2', (this.inputPos[0]).toString());
        this.line.setAttribute('y2', (this.inputPos[1]).toString());
    }

    setOutputPos() {
        this.line.setAttribute('x1', (this.outputPos[0]).toString());
        this.line.setAttribute('y1', (this.outputPos[1]).toString());
    }

    moveInputPos(deltaX:number, deltaY:number) {
        this.line.setAttribute('x2', ((parseFloat(this.line.getAttribute('x2') ?? '0')) + deltaX).toString());
        this.line.setAttribute('y2', ((parseFloat(this.line.getAttribute('y2') ?? '0')) + deltaY).toString());
    }

    moveOutputPos(deltaX:number, deltaY:number) {
        this.line.setAttribute('x1', ((parseFloat(this.line.getAttribute('x1') ?? '0')) + deltaX).toString());
        this.line.setAttribute('y1', ((parseFloat(this.line.getAttribute('y1') ?? '0')) + deltaY).toString());
    }

    render():SVGLineElement {
        return this.line;
    }

}

export default Connection;
