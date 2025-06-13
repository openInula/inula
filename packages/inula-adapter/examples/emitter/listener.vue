<template>
    <button-emitter ref="emitter">emit event</button>
</template>

<script>
    this.$refs.emitter.$on('eventEmitterClicked');
</script>