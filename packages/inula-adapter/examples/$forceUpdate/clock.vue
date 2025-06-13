<template>
    <span>{{ Date.now() }}</span>
</template>

<script>
    setInterval(()=>{
        this.$forceUpdate();
    },1000)
</script>