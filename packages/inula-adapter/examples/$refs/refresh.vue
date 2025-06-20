<template>
    <iv>
        <input ref="myInput" type="text" />
        <button @click="validateAndSubmit">submit</button>
    </iv>
</template>

<script>
    function validate(){
        if(!this.$refs[0].value){
            this.$refs[0].focus();
        } else {
            submit()
        }
    }
</script>