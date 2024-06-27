<template>
  <q-card>
    <q-card-section>
      <div class="row q-mb-md">
        <edit-something-button class="col-auto" text="Zurück zur Auswahl" icon="mdi-arrow-left-bold"
                               button-color="secondary" @create-something-new="$emit('goBack')"/>
      </div>
    </q-card-section>
    <q-card-section>
      <div class="text-h3">
        Steuertabelle für {{ companyName }}
      </div>
    </q-card-section>
    <q-card-section>
      <company-statistics-month-table :can-view-year-revenue="true" :can-view-month-tax="true"
                                      :can-view-month-revenue="true" :can-view-month-table="true"
                                      :can-view-all="true" :company-id="companyId" :from-external="true"/>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import EditSomethingButton from 'components/general/buttons/EditSomethingButton.vue'
import CompanyStatisticsMonthTable from 'components/balanceView/CompanyStatistics/CompanyStatisticsMonthTable.vue'

defineProps({
  companyId: {
    type: Number,
    required: true
  },
  companyName: {
    type: String,
    required: true,
    default: 'Nicht angegeben'
  }
})
defineEmits(['goBack'])
</script>

<style scoped>

</style>
