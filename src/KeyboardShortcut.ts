import {KeyboardState} from './KeyboardController';


class KeyboardShortcut {

    constructor(public fn:() => void, public key:string, public options:KeyboardState = {
        shift: false,
        ctrl: false,
        alt: false,
    }) {

    }

    call(key:string, keyboardState:KeyboardState) {
        if (key.toLowerCase() === this.key) {
            if (
                this.options.shift === keyboardState.shift &&
                this.options.ctrl === keyboardState.ctrl &&
                this.options.alt === keyboardState.alt
            ) {
                this.fn();
            }
        }
    }
}

export default KeyboardShortcut;
