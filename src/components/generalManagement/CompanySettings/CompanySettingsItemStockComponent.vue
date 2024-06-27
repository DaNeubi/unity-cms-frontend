<template>
  <q-card>
    <q-card-section>
      <div class="column">
        <div class="text-h5">
          Schwellwerte für die Übersicht des Artikelbestands in % von 100.
        </div>
        <div v-if="loading">
          <div class="row q-mb-sm q-mt-sm"
               v-for="n in 2"
               :key="n">
            <q-skeleton width="8em"
                        class="q-mr-sm"/>
            <q-skeleton type="QToggle"/>
          </div>
        </div>
        <div v-else>
            <q-btn color="primary" label="Speichern" class="q-mt-sm"
                   @click="updateCompanyItemStockThresholdSetting()"/>
            <q-input v-model.number="companySetting.item_stock_threshold_low" outlined class="q-mt-sm" :max="100"
                     :min="0" label="Wenig" type="number" prefix="%" reactive-rules
                     :rules="[val => val > -1 || 'Da muss mehr als 0& rein', val => val < 101 || 'Mehr als 100% geht halt ned']">
              <template v-slot:append>
                <q-icon name="mdi-circle" color="orange"/>
              </template>
            </q-input>
            <q-input v-model.number="companySetting.item_stock_threshold_high" outlined class="q-mt-sm"
                     :max="100" :min="0" label="Fast Leer" type="number" prefix="%" reactive-rules
                     :rules="[val => val > -1 || 'Da muss mehr als 0& rein', val => val < 101 || 'Mehr als 100% geht halt ned']">
              <template v-slot:append>
                <q-icon name="mdi-circle" color="red"/>
              </template>
            </q-input>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">

import { api } from 'src/boot/axios'
import { ICompanySetting } from 'src/misc/interfaces/CompanySetting/ICompanySetting'
import { defineComponent, onMounted, ref } from 'vue'

export default defineComponent({
  name: 'CompanySettingsItemStockComponent',
  props: {
    companyId: {
      type: Number,
      required: true
    },
    canEditThreshold: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  setup (props) {
    const loading = ref<boolean>(true)
    const companySetting = ref<ICompanySetting>()
    onMounted(async () => {
      getItemStockThreshold()
    })
    function getItemStockThreshold () {
      if (props.companyId <= 0) { return }
      loading.value = true
      api.get('/api/companySettings/itemStockThreshold/' + props.companyId)
        .then((response) => {
          companySetting.value = response.data.companySetting
          loading.value = false
        })
        .catch((error) => {
          console.error(error)
        })
    }
    function updateCompanyItemStockThresholdSetting () {
      if (props.companyId <= 0 || companySetting.value === undefined ||
        companySetting.value?.item_stock_threshold_high < 0 || companySetting.value?.item_stock_threshold_high > 100 ||
        companySetting.value?.item_stock_threshold_low < 0 || companySetting.value?.item_stock_threshold_low > 100) return
      api.patch('/api/companySettings/itemStockThreshold/update/' + props.companyId, {
        setting_id: companySetting.value?.id,
        item_stock_threshold_low: companySetting.value?.item_stock_threshold_low,
        item_stock_threshold_high: companySetting.value?.item_stock_threshold_high
      })
        .then(() => {
          getItemStockThreshold()
        })
        .catch((error) => {
          console.error(error)
        })
    }
    return {
      loading,
      updateCompanyItemStockThresholdSetting,
      companySetting
    }
  }
})
</script>

<style scoped>

</style>
