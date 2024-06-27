<template>
  <q-card>
    <q-card-section>
      <div class="row q-mb-md">
        <edit-something-button class="col-auto" text="Zurück zur Auswahl" icon="mdi-arrow-left-bold"
                               button-color="secondary" @create-something-new="$emit('goBack')"/>
      </div>
      <div  v-if="!loading">
        <div class="text-h3">
          Inhaber/innen
        </div>
        <div class="row q-gutter-md">
          <q-card v-for="companyOwner in companyWithEmployees.owners" :key="companyOwner.id" class="bg-primary">
            <q-card-section>
              <div class="column">
                <div class="text-h5">
                  Name: {{ companyOwner?.first_name }} {{ companyOwner?.last_name }}
                </div>
                <div class="text-caption">
                  Rang: <span class="text-warning">{{ companyOwner?.ranks[0]?.name }}</span>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="text-h3 q-mt-md">
          Mitarbeiter/innen
        </div>
        <div class="row q-gutter-md">
          <q-card v-for="companyEmployee in companyWithEmployees.users" :key="companyEmployee.id" class="bg-primary">
            <q-card-section>
              <div class="column">
                <div class="text-h5">
                  Name: {{ companyEmployee?.first_name }} {{ companyEmployee?.last_name }}
                </div>
                <div class="text-caption">
                  Rang: <span class="text-warning">{{ companyEmployee?.ranks[0]?.name }}</span>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
      <div v-else>
        <div class="column q-gutter-md">
          <q-skeleton />
          <q-skeleton />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { api } from 'boot/axios'
import { onMounted, ref } from 'vue'
import ICompany from 'src/misc/interfaces/Company/ICompany'
import EditSomethingButton from 'components/general/buttons/EditSomethingButton.vue'

const props = defineProps({
  companyId: {
    type: Number,
    required: true
  }
})
const companyWithEmployees = ref<ICompany>()
const loading = ref<boolean>(true)

onMounted(() => {
  getEmployees()
})

defineEmits(['goBack'])

function getEmployees () {
  if (props.companyId <= 0) return
  loading.value = true
  api.get('/api/government/companyEmployees?company_id=' + props.companyId)
    .then((response) => {
      companyWithEmployees.value = response.data
      loading.value = false
    })
    .catch((error) => {
      console.error(error)
    })
}

</script>

<style scoped>

</style>
