interface Thenable {
    then(resolve: (val?: any) => void, reject: (err: any) => void): void;
}
declare function act(fun: () => void | Thenable): Thenable;
export { act };
