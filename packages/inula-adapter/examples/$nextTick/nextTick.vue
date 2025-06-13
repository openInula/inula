<template>
    <input ref="inp" type="text" />
</template>

<script>
    this.$nextTick(()=>{
        // this must be wrapped, because at the time of render, this element does not exist yet
        this.$refs.inp.$el.attachEventListener('keyUp',(e)=>{
            console.log(e)
        })
    })
</script>