<template>
    <li><input type="checkbox" checked="isChecked" @click="toggleChecked" />{{ fruitName }}</li>
</template>

<script>
    const isChecked = ref(false);

    const {fruitName} = defineProps(['fruitName'])

    function toggleChecked(){
        isChecked.value = !isChecked.value;
    }
    defineExpose({isChecked,fruitName});
</script>