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
        Gewerbefahrzeuge vong {{ companyName }}
      </div>
    </q-card-section>
    <q-card-section v-if="loading">
      <q-skeleton />
    </q-card-section>
    <q-card-section v-else>
      <div class="row q-gutter-md">
        <q-card v-for="companyCar in companyCars" :key="companyCar.id" class="bg-teal-8">
          <q-card-section>
            <div class="column">
              <div class="row items-center text-h6">
                <q-icon name="mdi-car" class="col-auto" size="md" color="orange-8"/>
                {{ companyCar?.vehicle?.vehicle?.name }}
              </div>
              <div class="text-body1">
                Kennzeichen: {{ companyCar?.license_plate }}
              </div>
              <div>
                Inspektion:
                <span class="">
                  <u>hier rauf</u>
                  <q-tooltip class="text-body2">
                    Das müssen sie selbst herausfinden😉
                  </q-tooltip>
                </span>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">

import EditSomethingButton from 'components/general/buttons/EditSomethingButton.vue'
import { onMounted, ref } from 'vue'
import ICompanyCar from 'src/misc/interfaces/CompanyCar/ICompanyCar'
import { api } from 'boot/axios'

const companyCars = ref<ICompanyCar[]>()
const loading = ref<boolean>(true)
const props = defineProps({
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

onMounted(() => {
  getCompanyCars()
})

function getCompanyCars () {
  if (props.companyId <= 0) return
  loading.value = true
  api.get('/api/government/companyCars?company_id=' + props.companyId)
    .then((response) => {
      companyCars.value = response.data
      loading.value = false
    })
    .catch((error) => {
      console.error(error)
    })
}
</script>

<style scoped>

</style>
