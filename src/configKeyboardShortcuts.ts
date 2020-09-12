interface KeyboardShortcuts {
    delete:string,
    copy:string,
    paste:string,
    duplicate:string,
    cut:string,
}

const defaultKeyboardShortcuts:KeyboardShortcuts = {
    delete: 'Delete',
    copy: 'Ctrl C',
    paste: 'Ctrl V',
    duplicate: 'Ctrl D',
    cut: 'Ctrl X',
}

export {
    KeyboardShortcuts,
    defaultKeyboardShortcuts,
}
