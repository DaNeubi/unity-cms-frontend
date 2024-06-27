<template>
  <q-card>
    <div class="row items-center justify-start q-pa-sm">
      <div class="col-auto text-h5">
        Aktueller Funkkanal:
      </div>
      <div :class="`col-auto q-ml-sm text-bold text-h5 text-yellow-5 ${ canChangeRadio ? 'cursor-pointer' : '' }`"
           v-if="!loadingRadio">
        {{ radio?.frequency ?? 'N/A' }}
        <q-popup-edit :model-value="radio.frequency" v-slot="scope" buttons label-set="Aktualisieren"
                      label-cancel="Abbrechen" v-if="canChangeRadio && radio !== undefined"
                      @save="(val) => updateRadioChannel(val)">
          <q-input v-model.number="scope.value" type="number" :min="0" :max="65535" outlined label="Funkkanal"/>
        </q-popup-edit>
      </div>
      <div class="col-auto q-ml-sm text-bold text-h5" v-else>
        <q-spinner-puff color="accent" size="md"/>
      </div>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { api } from 'boot/axios'
import ICompanyRadio from 'src/misc/interfaces/Radio/ICompanyRadio'

const radio = ref<ICompanyRadio>()
const loadingRadio = ref<boolean>(false)

const props = defineProps({
  companyId: {
    type: Number,
    required: true
  },
  canChangeRadio: {
    type: Boolean,
    required: false,
    default: false
  }
})

defineExpose({
  updateRadioFromEvent
})

onMounted(() => {
  getCompanyRadioChannel()
})

watch(() => props.companyId, () => {
  getCompanyRadioChannel()
})

function getCompanyRadioChannel () {
  if (props.companyId <= 0) return
  loadingRadio.value = true
  api.get('/api/taxmax/radio/' + props.companyId)
    .then((res) => {
      radio.value = res.data
      loadingRadio.value = false
    })
    .catch((err) => {
      console.error(err)
    })
}
function updateRadioChannel (newValue: number | undefined) {
  if (props.companyId <= 0 || radio.value === undefined || newValue === undefined) return
  api.patch('/api/taxmax/updateRadio/' + props.companyId, {
    id: radio.value?.id,
    frequency: newValue
  })
    .then((res) => {
      radio.value = res.data
    })
    .catch((err) => {
      console.error(err)
    })
}
function updateRadioFromEvent (updatedRadio: ICompanyRadio) {
  radio.value = updatedRadio
}
</script>

<style scoped>

</style>
