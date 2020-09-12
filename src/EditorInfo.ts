import config from './config';
import Graph from './Graph';
import classes from './jssBase';
import Node from './Node';
import Editor from './Editor';


class EditorInfo {
    public container:HTMLElement;

    constructor(private editor:Editor) {
        this.container = document.createElement('div');
        if (config.debug) this.container.innerHTML = 'info';
        this.setupElement();
    }

    setupElement() {
        this.update();
    }

    getGraphInfo(graph:Graph):HTMLElement {
        const element = document.createElement('div');
        element.innerHTML = `<label><span>Graph name: </span><input value='${graph.name}'></label><button>Delete</button>`;
        (<HTMLInputElement>element.children[0].children[1]).oninput = (e) => {
            graph.name = (<HTMLInputElement>element.children[0].children[1]).value;
            graph.button.innerText = graph.name;
        }
        (<HTMLElement>element.children[1]).onclick = (e) => {
            this.editor.deleteGraph(graph);
        }
        element.className = classes.graphInfo;
        return element;
    }

    getNodeInfo(node:Node):HTMLElement {
        const element = document.createElement('div');
        element.innerHTML = `<label><span>Node name: </span><input value='${node.name}'></label><button>Delete</button>`;
        (<HTMLInputElement>element.children[0].children[1]).oninput = (e) => {
            node.setName((<HTMLInputElement>element.children[0].children[1]).value);
        }
        (<HTMLElement>element.children[1]).onclick = (e) => {
            this.editor.selectedGraph?.deleteNode(node);
        }
        element.className = classes.nodeInfo;
        return element;
    }

    update() {
        this.container.innerHTML = '';
        if (this.editor.selectedGraph?.activeNode) {
            this.container.appendChild(this.getNodeInfo(this.editor.selectedGraph?.activeNode))
            return;
        }
        if (this.editor.selectedGraph) {
            this.container.appendChild(this.getGraphInfo(this.editor.selectedGraph));
            return;
        }
    }

    render():HTMLElement {
        return this.container;
    }
}


export default EditorInfo;
