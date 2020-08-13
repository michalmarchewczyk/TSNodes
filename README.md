# TSNodes

An open source TypeScript/JavaScript library for creating visual programming interfaces.

## Installation
    
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
   
### npm
1. Install via npm
    ```bash
    npm install tsnodes
    ```

1. Import library to your project
    ```javascript
    import TSNodes from 'TSNodes';
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

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)
