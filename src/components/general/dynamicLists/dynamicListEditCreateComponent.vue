<template>
  <q-card flat bordered>
    <div class="row q-ma-md">
      <div class="col-5">
        <div class="column">
          <div class="text-h5">
            Basisinformationen
          </div>
        </div>
      </div>
      <div class="col-5">
        <div class="column q-gutter-sm">
          <div class="text-h5 col-auto">
            Felder
          </div>
          <q-separator/>
          <dynamic-list-fields-component/>
        </div>
      </div>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ICompanyListItemField from '../../../misc/interfaces/DynamicList/ICompanyListItemField'
import DynamicListFieldsComponent from 'components/general/dynamicLists/dynamicListFieldsComponent.vue'

const name = ref<string>('')
const fields = ref<ICompanyListItemField[]>([])
</script>

<style scoped>

</style>
