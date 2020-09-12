import KeyboardShortcut from './KeyboardShortcut';

export interface KeyboardState {
    shift:boolean;
    ctrl:boolean;
    alt:boolean;
}

class KeyboardController {
    public shortcuts:KeyboardShortcut[] = [];

    public keyboardState:KeyboardState = {
        shift: false,
        ctrl: false,
        alt: false,
    }

    constructor(public attach:HTMLElement = document.body) {
        this.setup();
    }

    setup() {
        this.setupKeydown();
        this.setupKeyup();
    }

    setupKeydown() {
        this.attach.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'Shift':
                    this.keyboardState.shift = true;
                    break;
                case 'Control':
                    this.keyboardState.ctrl = true;
                    break;
                case 'Alt':
                    this.keyboardState.alt = true;
                    break;
            }
            if (this.keyboardState.ctrl) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    }

    setupKeyup() {
        this.attach.addEventListener('keyup', (e) => {
            switch (e.key) {
                case 'Shift':
                    this.keyboardState.shift = false;
                    break;
                case 'Control':
                    this.keyboardState.ctrl = false;
                    break;
                case 'Alt':
                    this.keyboardState.alt = false;
                    break;
            }
            if (this.keyboardState.ctrl) {
                e.preventDefault();
                e.stopPropagation();
            }
            this.shortcuts.forEach(shortcut => {
                shortcut.call(e.key, this.keyboardState);
            })
        });
    }


    addShortcut(shortcut:KeyboardShortcut) {
        this.shortcuts.push(shortcut);
    }

}


export default KeyboardController;

