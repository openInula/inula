<template>
    <div>
        <ul>
            <fruit-item v-for="fruitName in fruits" fruit-name="fruitName"></fruit-item>
        </ul>
        <button @click="logFruit">Log fruit elements</button>
    </div>
</template>

<script>
    const fruits = ['apple', 'pear', 'motorcycle'];

    function logFruit(){
        console.log(
            this.$children.map(({fruitName,isChecked}) => `${fruitName}:${ischecked?'✓':'X'}`).join(', ') //returns string like "apple:✓, pear:X, motorcycle:✓"
        ); 
    }
</script>