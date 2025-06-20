<template>
    <button ref="emitter" @click="clicked">emit event</button>
</template>

<script>
function clicked(){
    this.$refs.emit.$emit('eventEmitterClicked');
}
</script>