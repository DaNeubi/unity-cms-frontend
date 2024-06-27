<template>
  <div class="row q-gutter-md col-12">
    <create-something-new-button text="Feld hinzufügen" color="positive" class="col-auto"/>
    <q-select v-model="selectedField" :options="availableDynamicFields" label="Feld" outlined dense class="col-sm-3"/>
  </div>
</template>

<script setup lang="ts">

import { ref } from 'vue'
import IDynamicField from 'src/misc/interfaces/DynamicField/IDynamicField'
import ICompanyListItemField from 'src/misc/interfaces/DynamicList/ICompanyListItemField'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'

const availableDynamicFields = ref<IDynamicField[]>([])
const fields = ref<ICompanyListItemField[]>([])
const selectedField = ref<IDynamicField | null>(null)

</script>

<style scoped>

</style>
