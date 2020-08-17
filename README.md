# TSNodes

An open source TypeScript/JavaScript library for creating visual programming interfaces.


![npm](https://img.shields.io/npm/v/tsnodes)
![GitHub](https://img.shields.io/github/license/michalmarchewczyk/TSNodes)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/michalmarchewczyk/tsnodes)
![GitHub last commit](https://img.shields.io/github/last-commit/michalmarchewczyk/tsnodes)

## Installation
    
  
### npm
1. Install via npm
    ```bash
    npm install tsnodes
    ```

1. Import library to your project
    ```javascript
    import TSNodes from 'tsnodes';
    ```
   
1. Add styling  
    Using javascript: 
    ```Javascript
    import 'tsnodes/lib/styles/default_dark/index.css';
    ```
   or HTML:
   ```html
   <link rel='stylesheet' href='node_modules/tsnodes/lib/styles/default_dark/index.css'>
   ```
   
### Git
1. Clone this repository
    ```bash
    git clone https://github.com/michalmarchewczyk/TSNodes
    ```

1. Install dependencies
    ```bash
    npm install
    ```

1. Build library
    ```bash
    npm run build
    ```

1. Import library to your project
    ```javascript
    import TSNodes from 'TSNodes/lib';
    ```
   
1. Add styling  
    Using javascript: 
    ```Javascript
    import 'TSNodes/lib/styles/default_dark/index.css';
    ```
   or HTML:
   ```html
   <link rel='stylesheet' href='TSNodes/lib/styles/default_dark/index.css'>
   ```

## Usage

1. Creating editor
    ```javascript
    const editor = new TSNodes.Editor();
    ```
   
1. Rendering all editor components and appending them to document
    ```javascript
    const view = editor.view.render();
    window.document.querySelector('.editor').appendChild(view);
    
    const graphs = editor.graphs.render();
    window.document.querySelector('.graphs').appendChild(graphs);
    
    const nodes = editor.nodes.render();
    window.document.querySelector('.nodes').appendChild(nodes);
    
    const info = editor.info.render();
    window.document.querySelector('.info').appendChild(info);
    ```
   
1. Adding node types by extending class `TSNodes.Node`
    ```javascript
    class node1 extends TSNodes.Node {
      constructor() {
        super(editor, 'Node 1');
      }   
    }
    ```
   
1. Adding node type to editor
    ```javascript
    editor.addNode(node1);
    ```
   
1. Adding inputs to node type  
    To add inputs to node type expand node constructor by adding `this.input(args)` calls or `this.addInput(new TSNodes.Input(args))` calls
    ```javascript
    class node1 extends TSNodes.Node {
      constructor() {
        super(editor, 'Node 1');
        this.input('input 1', 'default value');
        this.input('input 2', '');
        this.addInput(new TSNodes.Input('input 3', '', false));
      }   
    }
    ```
   
1. Adding outputs to node type
    To add outputs to node type expand node constructor by adding `this.output(args)` calls or `this.addOutput(new TSNodes.Output())` calls.
    ```javascript
    class node1 extends TSNodes.Node {
      constructor() {
        super(editor, 'Node 1');
        this.input('input 1', 'default value');
        this.input('input 2', '', );
        this.addInput(new TSNodes.Input('input 3', '', false));
        this.output('output 1', function1);
        this.addOutput(new TSNodes.Output('output2', function2, false));
      }   
    }
    ```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)
