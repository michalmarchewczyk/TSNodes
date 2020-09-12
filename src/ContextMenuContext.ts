import ContextMenuButton from './ContextMenuButton';


class ContextMenuContext {
    public buttons:ContextMenuButton[] = [];
    public enabled:boolean = false;

    addButton(button:ContextMenuButton) {
        this.buttons.push(button);
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }

    render():ContextMenuButton[] {
        if (this.enabled) {
            return this.buttons;
        } else {
            return [];
        }
    }
}


export default ContextMenuContext;
