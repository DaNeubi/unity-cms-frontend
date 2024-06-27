<template>
  <dynamic-list-edit-create-component v-if="editMode"/>
  <dynamic-list-table-component v-else/>
</template>

<script setup lang="ts">
import DynamicListTableComponent from 'components/general/dynamicLists/dynamicListTableComponent.vue'
import { ref } from 'vue'
import DynamicListEditCreateComponent from 'components/general/dynamicLists/dynamicListEditCreateComponent.vue'

const editMode = ref<boolean>(true)
</script>

<style scoped>

</style>
