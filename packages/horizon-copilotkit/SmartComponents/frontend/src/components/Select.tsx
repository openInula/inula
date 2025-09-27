import { Select } from "antd"
import { forwardRef, Ref, useImperativeHandle, useState } from "react";

const SelectComponent=forwardRef((props,ref)=>{
    const [value,setValue]=useState("Mary");
    const [open,setOpen]=useState(false);
    useImperativeHandle(ref,()=>({
        setValue:(val:string)=>setValue(val),
        setOpen:(open:boolean)=>{
            setOpen(open)
        }
    }));
    return(
        <Select
        value={value}
        onChange={setValue}
        options={[
            {value:"Mary",label:"Mary"},
            { value: 'lucy', label: 'Lucy' },
            { value: 'Yiminghe', label: 'yiminghe' },
            { value: 'disabled', label: 'Disabled', disabled: true },
        ]}
        onOpenChange={(open)=>setOpen(open)}
        open={open}
        />
    )
})
    
    

export default SelectComponent;