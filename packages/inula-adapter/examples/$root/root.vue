<template>
    <app color="theme"></app>
</template>

<script>
    // app component contains theme changer somewhere within its component tree
    const theme=ref('light');

    function changeTheme(color){
        theme.value = color;
    };

    defineExpose({changeTheme});
</script>