import _Input from './Input';
import _Output from './Output';

class _Connection {
    public line:SVGLineElement;

    constructor(public output:_Output<any>, public input:_Input<any>) {
        this.line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        this.setupElement();
    }

    setupElement() {
        this.updatePos();
    }

    updatePos () {
        const view = this.input.node?.editor.view;
        if(!view || !this.output.snap || !this.input.snap) return;
        const offsetX = view.scrollX/view.zoom - view.container.getBoundingClientRect().left/view.zoom;
        const offsetY = view.scrollY/view.zoom - view.container.getBoundingClientRect().top/view.zoom;
        this.line.setAttribute('x1', (this.output.snap.getBoundingClientRect().left/view.zoom + offsetX + 8).toString());
        this.line.setAttribute('y1', (this.output.snap.getBoundingClientRect().top/view.zoom + offsetY + 8).toString());
        this.line.setAttribute('x2', (this.input.snap.getBoundingClientRect().left/view.zoom + offsetX + 8).toString());
        this.line.setAttribute('y2', (this.input.snap.getBoundingClientRect().top/view.zoom + offsetY + 8).toString());
    }

    render():SVGLineElement {
        return this.line;
    }

}

export default _Connection;
