<template>
  <q-expansion-item :group="group" :label="label" icon="mdi-cash-multiple">
    <q-card>
      <q-card-section>
        <div class="column">
          <div>
            <q-btn color="positive"
                   icon="mdi-check"
                   label="Erfassen"
                   @click="createSale()"/>
          </div>
          <h6 class="q-mt-sm q-mb-sm">Neuen Verkauf anlegen:</h6>
          <span class="hint-text">Hinweis: Dieser Verkauf ist nicht für normale Produkte gedacht.
            Daher gibt es beim Verkauf über diesen Weg KEINEN Mitarbeiter-Anteil oder Mitarbeiter-Immer-Anteil. </span>
          <q-input v-model="name" outlined counter maxlength="256" class="q-mt-md" label="Name*"
                   reactive-rules :rules="[val => val.length > 0 || 'Pflichtfeld!']"/>
          <q-input v-model="description" outlined counter maxlength="256" class="q-mt-md" label="Beschreibung*"
                   reactive-rules :rules="[val => val.length > 0 || 'Pflichtfeld!']"/>
          <q-input v-model.number="price" outlined class="q-mt-md" type="number" label="Preis pro Stück in $"/>
          <q-input v-model.number="amount" outlined type="number" class="q-mt-md" label="Anzal*"/>
        </div>
      </q-card-section>
    </q-card>
  </q-expansion-item>
</template>

<script setup lang="ts">
import { api } from 'src/boot/axios'
import { computed, ref } from 'vue'
import { companyStore } from 'stores/companyStore'

defineProps({
  label: String,
  group: String
})
const name = ref<string>()
const description = ref<string>()
const price = ref<number>(0)
const amount = ref<number>(0)
const companyStateStore = companyStore()
const companyId = computed(() => companyStateStore.companyId)

function createSale () {
  if (companyId.value <= 0 || name.value === undefined || description.value === undefined || price.value === null || amount.value === null ||
    name.value?.length <= 0 || description.value?.length <= 0 || price.value <= 0 || amount.value <= 0) {
    return
  }
  api.post('/api/nonProducts/sale/' + companyId.value, {
    name: name.value,
    description: description.value,
    price: price.value,
    amount: amount.value
  })
    .then(() => {
      resetUI()
    })
    .catch((error) => {
      console.error(error)
    })
}
function resetUI () {
  name.value = ''
  description.value = ''
  price.value = 0
  amount.value = 0
}
</script>

<style scoped>

</style>
