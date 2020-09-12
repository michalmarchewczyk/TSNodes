import Graph from './Graph';
import {nodeClass} from './Node';

import config from './config';
import Engine from './Engine';
import EditorView from './EditorView';
import EditorGraphs from './EditorGraphs';
import EditorNodes from './EditorNodes';
import EditorInfo from './EditorInfo';
import KeyboardController from './KeyboardController';
import KeyboardShortcut from './KeyboardShortcut';
import Clipboard from './Clipboard';
import {parseKeyboardShortcut} from './utils';
import ContextMenu from './ContextMenu';
import ContextMenuContext from './ContextMenuContext';
import ContextMenuButton from './ContextMenuButton';


class Editor {
    public view:EditorView;
    public graphs:EditorGraphs;
    public nodes:EditorNodes;
    public info:EditorInfo;
    public engine:Engine;
    public selectedGraph?:Graph;
    public keyboardController:KeyboardController = new KeyboardController();
    public clipboard?:Clipboard;
    public contextMenu?:ContextMenu;

    constructor() {
        this.view = new EditorView(this);
        this.graphs = new EditorGraphs(this);
        this.nodes = new EditorNodes(this);
        this.info = new EditorInfo(this);
        this.engine = new Engine();
        this.clipboard = new Clipboard();
        this.contextMenu = new ContextMenu(this.view.container);
        this.setupKeyboardShortcuts();
        this.setupContextMenu();
    }

    addNode(node:nodeClass):void {
        this.nodes?.addNode(node);
    }

    createGraph(name:string):Graph {
        const graph = new Graph(name);
        graph.editor = this;
        this.graphs?.addGraph(graph);
        this.selectGraph(graph);
        return graph;
    }

    selectGraph(graph:Graph) {
        this.selectedGraph = graph;
        this.view.renderGraph(graph);
        this.info.update();
    }

    deleteGraph(graph:Graph) {
        if (!confirm(`Are you sure you want to delete graph "${graph.name}?"`)) return;
        if (graph === this.selectedGraph) {
            this.selectedGraph = undefined;
            this.view.renderGraph();
        }
        this.graphs.container.removeChild(graph.button);
    }

    deleteSelectedNodes() {
        this.selectedGraph?.deleteNodes(this.selectedGraph?.selectedNodes ?? []);
    }

    copySelectedNodes() {
        this.clipboard?.copyNodes(this.selectedGraph?.selectedNodes ?? []);
    }

    pasteNodes() {
        if (this.selectedGraph) {
            this.clipboard?.pasteNodes(this.selectedGraph)
        }
    }

    duplicateSelectedNodes() {
        this.copySelectedNodes();
        this.pasteNodes();
    }

    cutSelectedNodes() {
        if (this.selectedGraph) {
            this.clipboard?.cutNodes(this.selectedGraph, this.selectedGraph?.selectedNodes);
        }
    }

    selectAllNodes() {
        this.selectedGraph?.selectAllNodes();
    }

    setupKeyboardShortcuts() {
        this.setupKeyboardShortcut(this.deleteSelectedNodes.bind(this), config.keyboardShortcuts.delete);
        if (this.clipboard) {
            this.setupClipboardKeyboardShortcuts();
        }
    }


    setupClipboardKeyboardShortcuts() {
        this.setupKeyboardShortcut(this.copySelectedNodes.bind(this), config.keyboardShortcuts.copy);
        this.setupKeyboardShortcut(this.pasteNodes.bind(this), config.keyboardShortcuts.paste);
        this.setupKeyboardShortcut(this.duplicateSelectedNodes.bind(this), config.keyboardShortcuts.duplicate);
        this.setupKeyboardShortcut(this.cutSelectedNodes.bind(this), config.keyboardShortcuts.cut);
    }


    setupKeyboardShortcut(fn:() => void, shortcut:string) {
        const shortcutParsed = parseKeyboardShortcut(shortcut);
        if (shortcutParsed) {
            const newShortcut = new KeyboardShortcut(fn, ...shortcutParsed);
            this.keyboardController.addShortcut(newShortcut);
        }
    }


    setupContextMenu() {
        this.setupGraphContextMenu();
        this.setupSelectedContextMenu();
    }

    private setupSelectedContextMenu() {
        const selectedContext = new ContextMenuContext();
        selectedContext.enable();
        selectedContext.addButton(new ContextMenuButton('Copy', this.copySelectedNodes.bind(this)));
        selectedContext.addButton(new ContextMenuButton('Cut', this.cutSelectedNodes.bind(this)));
        selectedContext.addButton(new ContextMenuButton('Duplicate', this.duplicateSelectedNodes.bind(this)));
        selectedContext.addButton(new ContextMenuButton('Delete', this.deleteSelectedNodes.bind(this)));
        this.contextMenu?.addContext(selectedContext);
    }

    private setupGraphContextMenu() {
        const graphContext = new ContextMenuContext();
        graphContext.enable();
        graphContext.addButton(new ContextMenuButton('Paste', this.pasteNodes.bind(this)));
        graphContext.addButton(new ContextMenuButton('Add Node', this.pasteNodes.bind(this)));
        graphContext.addButton(new ContextMenuButton('Select All', this.selectAllNodes.bind(this)));
        this.contextMenu?.addContext(graphContext);
    }
}

export default Editor;

export {
    EditorView,
    EditorGraphs,
    EditorNodes,
    EditorInfo,
}
