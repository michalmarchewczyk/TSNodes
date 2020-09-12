class ContextMenuButton {
    public element:HTMLButtonElement = document.createElement('button');

    constructor(public name:string, public fn:() => void) {
        this.element.innerHTML = name;
        this.setupClick();
    }

    setupClick() {
        this.element.onclick = (e) => {
            e.stopPropagation();
            this.fn();
        }
    }
}

export default ContextMenuButton;
