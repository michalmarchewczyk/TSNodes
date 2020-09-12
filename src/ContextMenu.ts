import classes from './jssBase';
import ContextMenuContext from './ContextMenuContext';

class ContextMenu {
    public element:HTMLElement;
    public contexts:ContextMenuContext[] = [];

    constructor(public attach:HTMLElement = document.body) {
        this.element = document.createElement('div');
        attach.appendChild(this.element);
        this.setupElement();
        this.setupEvent();
        this.setupClose();
    }

    setupElement() {
        this.element.className = classes.contextMenu;
        this.element.style.display = 'none';
        this.element.tabIndex = -1;
        this.element.oncontextmenu = (e) => {
            e.preventDefault();
        }
    }

    setupEvent() {
        this.attach.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            event.stopPropagation();
            this.render();
            this.element.style.left = event.clientX + 'px';
            this.element.style.top = event.clientY + 'px';
            this.element.focus();
        });
    }

    setupClose() {
        this.element.onblur = (e) => {
            if (!this.element.contains(<Node>e.relatedTarget)) {
                this.hide();
            }
        }
    }

    addContext(context:ContextMenuContext) {
        this.contexts.push(context);
    }

    show() {
        this.element.style.display = 'block';
    }

    hide() {
        this.element.style.display = 'none';
    }

    render() {
        this.show();
        this.element.innerHTML = '';
        this.renderContexts();
    }

    renderContext(context:ContextMenuContext) {
        const contextButtons = context.render();
        contextButtons.forEach(button => {
            button.element.onmouseup = this.hide.bind(this);
            this.element.appendChild(button.element);
        });
    }

    private renderContexts() {
        this.contexts.forEach(context => {
            this.renderContext(context);
        });
    }
}


export default ContextMenu;
