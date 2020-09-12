import Graph from './Graph';
import config from './config';
import classes from './jssBase';
import Editor from './Editor';

class EditorGraphs {
    public container:HTMLElement;

    public graphs:Graph[] = [];

    constructor(private editor:Editor) {
        this.container = document.createElement('div');
        if (config.debug) this.container.innerHTML = 'graphs';
        this.editor = editor;
    }

    addGraph(graph:Graph) {
        this.graphs.push(graph);
        const graphElement = this.renderGraphElement(graph)
        this.container.appendChild(graphElement);
        this.editor.selectGraph(graph);
        Array.from(this.container.children).forEach(child => {
            child.classList.remove(classes.graphSelected);
        })
        graphElement.classList.add(classes.graphSelected);
    }

    renderGraphElement(graph:Graph):HTMLElement {
        const graphElement = graph.button;
        graphElement.onclick = () => {
            this.editor.selectGraph(graph);
            Array.from(this.container.children).forEach(child => {
                child.classList.remove(classes.graphSelected);
            })
            graphElement.classList.add(classes.graphSelected);
        }
        return graphElement;
    }

    render():HTMLElement {
        return this.container;
    }
}

export default EditorGraphs;
