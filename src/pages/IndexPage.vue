<template>
  <div class="col">
    <IndexPageNewsBoardsComponent v-if="companyId > 0">
    </IndexPageNewsBoardsComponent>
  </div>
</template>

<script setup lang="ts">
import IndexPageNewsBoardsComponent from 'components/general/indexPage/IndexPageNewsBoardsComponent.vue'
import { companyStore } from 'stores/companyStore'
import { computed } from 'vue'

const cStore = companyStore()
const companyId = computed(() => cStore.companyId)

</script>
