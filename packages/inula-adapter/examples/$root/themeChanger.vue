<template>
    <button @click="changeTheme">Change theme to {{ theme }}</button>
</template>

<script>
    const {theme} = defineProps(['theme']);
    
    function changeTheme(){
        this.$root.changeTheme(theme);
    }
</script>