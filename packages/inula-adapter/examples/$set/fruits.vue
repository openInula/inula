<template>
    <div>
        <ul>
            <li v-for="fruit in fruits">
                <p>Fruit: {{ fruit.name }}</p>
                <p>Amount: <button @click="decrement(fruit)">-</button> {{ fruit.amount }} <button @click="increment(fruit)">+</button></p>
            </li>
        </ul>
        <p>
            <input ref="newFruit" type="text" placeholder="fruit name" />
            <button @click="addFruit">Add fruit</button>
        </p>
    </div>
</template>

<script>
    const fruits = reactive([{name:'apple',amount:3}, {name:'pear',amount:0}]);
    function decrement(fruit){
        fruit.amount--
    }
    function increment(fruit){
        fruit.amount++
    }
    function addFruit(){
        const fruitName = this.$refs.newFruit.value;
        this.$set(fruits,fruits.length,{name:fruitName,amount:0});
        this.$refs.newFruit.value='';
    }
</script>