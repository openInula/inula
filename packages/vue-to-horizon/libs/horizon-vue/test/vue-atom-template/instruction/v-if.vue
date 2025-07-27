<template>
  <div v-if='currentPageIndex === 6'>
    test v-if
  </div>
  <div v-if='arr1.length'>
    test arr
  </div>
</template>
<script>
export default {
  name: 'test v-if',
  data: function() {
    return {
      currentPageIndex: 1,
      arr1: [],
    }
  }
};
</script>
