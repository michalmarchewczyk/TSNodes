
type _OutputFn<T> = (inputs: any[]) => T;

class _Output<T> {
    public name:string;
    public fn: _OutputFn<T>;

    constructor(name:string, fn:_OutputFn<T>) {
        this.name = name;
        this.fn = fn;
    }
}

export default _Output;
