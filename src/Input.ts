class _Input<T> {
    public name:string;
    public value:T;
    private defaultValue:T;

    constructor(name:string, defaultValue:T) {
        this.name = name;
        this.defaultValue = defaultValue;
        this.value = defaultValue;
    }
}

export default _Input;
