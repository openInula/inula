export function watch(stateVariable:any,listener:(state:any)=>void){
    listener = listener.bind(null,stateVariable);
    stateVariable.addListener(listener);

    return ()=>{
        stateVariable.removeListener(listener);
    }
}