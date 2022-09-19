export function watch(stateVariable:any,listener:(stateVariable:any)=>void){
    listener = listener.bind(null,stateVariable);
    stateVariable.addListener(listener);

    return ()=>{
        stateVariable.removeListener(listener);
    }
}