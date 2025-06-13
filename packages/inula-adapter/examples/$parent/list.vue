<template>
    <table>
        <tr>
            <td>
                ID
            </td>
            <td>
                Product name
            </td>
            <td>
                Product type
            </td>
        </tr>
        <table-item v-for="item in filteredIdems" productId="item.id" productName="item.name" productType="item.type"></table-item>
    </table>
</template>
<script>
    const {items} = defineProps(['items']);

    const filteredIdems = ref(items);

    function setFilterType(type){
        filteredItems.value = items.filter(item => item.type===type);
    }

    defineExpose({setFilterType})
</script>