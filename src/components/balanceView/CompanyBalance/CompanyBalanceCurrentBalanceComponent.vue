<template>
  <q-card>
    <q-card-section>
      <div class="row">
        <div class="col-12 text-h5">
          Aktueller Kontostand
        </div>
        <div class="col-12 text-h5" v-if="!loading">
          ${{ currentAmount }}
        </div>
        <q-skeleton v-else class="col-12" height="2rem"/>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { api } from 'src/boot/axios'
import { onMounted, ref, watch } from 'vue'

const props = defineProps({
  companyId: {
    type: Number,
    required: true,
    default: 0
  },
  reloadInt: {
    type: Number,
    required: false,
    default: 0
  }
})
const currentAmount = ref<number>(0)
const loading = ref<boolean>(true)
onMounted(() => {
  getCompanyBalanceCurrent()
})
watch(() => props.companyId, () => {
  getCompanyBalanceCurrent()
})
watch(() => props.reloadInt, () => {
  getCompanyBalanceCurrent()
})
function getCompanyBalanceCurrent () {
  if (props.companyId <= 0) return
  loading.value = true
  api.get('/api/companyBalance/currentBalance/' + props.companyId)
    .then((response) => {
      currentAmount.value = response.data.balance
      loading.value = false
    })
    .catch((error) => {
      console.error(error)
    })
}
</script>
