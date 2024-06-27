<template>
  <q-card>
    <q-card-section v-if="loading || companyInspectionSetting === undefined">
      <q-skeleton/>
    </q-card-section>
    <q-card-section v-else>
      <div class="row items-center q-gutter-md">
        <div class="col-12 text-h4">
          Firmenfahrzeug Inspektionsintervall anpassen
        </div>
        <div class="col-12 q-mb-md">
          <create-something-new-button text="Inspektionsintervall speichern" icon="mdi-content-save"
                                       @create-something-new="updateInspectionInterval()"/>
        </div>
        <q-input label="Inspektionsintervall in Tagen" v-model.number="inspectionInterval" outlined type="number"
                 class="col-2" hint="bei 0 wird es nicht berechnet"/>
        <q-btn label="1 Monat (30 Tage)" @click="setIntervalCustom(30)" class="col-auto"
               rounded color="secondary" icon="mdi-progress-clock"/>
        <q-btn label="2 Monate (60 Tage)" @click="setIntervalCustom(60)" class="col-auto"
                rounded color="secondary" icon="mdi-progress-clock"/>
        <q-btn label="3 Monate (90 Tage)" @click="setIntervalCustom(90)" class="col-auto"
                rounded color="secondary" icon="mdi-progress-clock"/>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">

import { onMounted, ref, watch } from 'vue'
import { ICompanySetting } from 'src/misc/interfaces/CompanySetting/ICompanySetting'
import { api } from 'boot/axios'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'

const loading = ref<boolean>(false)
const companyInspectionSetting = ref<ICompanySetting>()
const inspectionInterval = ref<number>(0)

const props = defineProps({
  companyId: {
    type: Number,
    required: true
  }
})

onMounted(() => {
  getInspectionInterval()
})

watch(() => props.companyId, () => {
  getInspectionInterval()
})

function getInspectionInterval () {
  if (props.companyId <= 0) return
  loading.value = true
  api.get('/api/companySettings/inspection/' + props.companyId)
    .then((res) => {
      companyInspectionSetting.value = res.data
      inspectionInterval.value = companyInspectionSetting.value?.inspection_interval ?? 0
      loading.value = false
    })
    .catch((error) => {
      console.error(error)
    })
}
function setIntervalCustom (customAmount: number) {
  inspectionInterval.value = customAmount
}
function updateInspectionInterval () {
  if (props.companyId <= 0) return
  api.patch('/api/companySettings/inspection/update/' + props.companyId, {
    inspection_interval: inspectionInterval.value
  })
    .then(() => {
      getInspectionInterval()
    })
    .catch((error) => {
      console.error(error)
    })
}

</script>

<style scoped>

</style>
