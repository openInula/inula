<template>
    <tr>
        <td>{{ productId }}</td>
        <td>
            {{ productName }}
        </td>
        <td>
            <span @click="filterType(productType)">{{ productType }}</span>
        </td>
    </tr>
</template>

<script>
    const { productId,productName,productType } = defineProps([ 'productId', 'productName', 'productType' ]);

    function filterType(type){
        this.$parent.setFilterType(type);
    }
</script>