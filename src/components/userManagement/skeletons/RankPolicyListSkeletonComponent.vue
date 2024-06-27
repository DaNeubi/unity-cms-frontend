<template>
  <div class="col">
    <div class="row q-gutter-md q-mb-sm" v-for="current in amount" :key="current">
      <q-skeleton type="rect" width="5rem" class="bg-primary"/>
      <q-skeleton type="text" width="25rem" class="bg-primary"/>
      <q-skeleton type="circle" width="3rem" height="3rem" class="bg-primary"/>
    </div>

  </div>
</template>

<script>
export default {
  name: 'RankPolicyListSkeletonComponent',
  props: {
    amount: {
      type: Number,
      default: 5
    }
  }
}
</script>

<style scoped>

</style>
