import _Input, {_InputBoolean, _InputFloat, _InputNumber, _InputString} from './Input';
import _Output from './Output';
import _Node from './Node';
import _Graph from './Graph';
import _Editor, {_EditorGraphs, _EditorInfo, _EditorNodes, _EditorView} from './Editor';
import _Engine from './Engine';


let TSNodes = {
    Input: _Input,
    Output: _Output,
    Node: _Node,
    Graph: _Graph,
    Editor: _Editor,
    Engine: _Engine,
    // EditorView: _EditorView,
    // EditorGraphs: _EditorGraphs,
    // EditorNodes: _EditorNodes,
    // EditorInfo: _EditorInfo,
    InputNumber: _InputNumber,
    InputFloat: _InputFloat,
    InputBoolean: _InputBoolean,
    InputString: _InputString,
}

export default TSNodes;




