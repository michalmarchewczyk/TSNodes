import Node, {nodeClass} from './Node';
import config from './config';
import classes from './jssBase';
import Editor from './Editor';


class EditorNodes {
    public container:HTMLElement;
    public tempNode?:Node;

    public nodes:nodeClass[] = [];

    constructor(private editor:Editor) {
        this.container = document.createElement('div');
        if (config.debug) this.container.innerHTML = 'nodes';
    }

    addNode(node:nodeClass) {
        if (typeof node !== 'function') return;
        this.nodes.push(node);
        this.container.appendChild(this.renderNodeElement(node));
    }

    renderNodeElement(node:nodeClass):HTMLElement {
        const nodeElement = document.createElement('div');
        nodeElement.className = classes.nodeElement;
        this.tempNode = new (<any>node)();
        nodeElement.innerText = this.tempNode?.name ?? '';
        delete this.tempNode;

        nodeElement.onclick = () => {
            const newNode = new (<any>node)();
            newNode.nodeBox.pos = [
                this.editor.view.scrollX / this.editor.view.zoom + 200,
                this.editor.view.scrollY / this.editor.view.zoom + 200
            ];
            newNode.nodeBox.zIndex = this.editor.view.zIndex + 1;
            this.editor.view.zIndex += 1;
            newNode.element.style.zIndex = newNode.nodeBox.zIndex.toString();
            this.editor.selectedGraph?.createNode(newNode);
        }

        return nodeElement;
    }

    render():HTMLElement {
        return this.container;
    }
}


export default EditorNodes;
