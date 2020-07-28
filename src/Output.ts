
import jss from 'jss';
import preset from 'jss-preset-default';
import config from './config';


jss.setup(preset());

const styles = {
    outputElement: {
        display: 'block',
        position: 'relative',
        top: 0,
        left: 0,
        minHeight: 20,
        outline: (config.debugOutline) ? '1px solid red' : 'none',
        marginTop: 5,
        marginBottom: 5,
        textAlign: 'right',
        paddingRight: 10,
        paddingLeft: 8,
    },
    snap: {
        display: 'block',
        position: 'absolute',
        top: 2,
        right: -8,
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
    }
}

const {classes} = jss.createStyleSheet(styles).attach();

type _OutputFn<T> = (inputs: any[]) => T;

class _Output<T> {
    public name:string;
    public fn: _OutputFn<T>;
    public element:HTMLElement;

    constructor(name:string, fn:_OutputFn<T>) {
        this.name = name;
        this.fn = fn;
        this.element = document.createElement('div');
        this.setupElement();
    }

    setupElement(){
        this.element.className = classes.outputElement;
        this.element.innerText = this.name;
        let snap = document.createElement('div');
        snap.className = classes.snap;
        let dot = document.createElement('div');
        dot.className = classes.dot;
        snap.appendChild(dot);
        this.element.appendChild(snap);
    }

    render():HTMLElement {
        return this.element;
    }
}

export default _Output;
