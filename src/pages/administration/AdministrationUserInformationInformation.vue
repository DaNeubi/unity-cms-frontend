<template>
  <div class="column">
    <q-table title="User Daten" :rows="availableData" :columns="columns" :loading="loading"
             class="default-table-height cms-sticky-header-table" :pagination="{ rowsPerPage: 20 }" row-key="id"
             @request="onRequest" hide-header grid>
      <template v-slot:item="props">
        <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3 grid-style-transition">
          <q-card bordered flat>
            <q-card-section class="text-h6">
              {{ props.row.first_name }} {{ props.row.last_name }}
            </q-card-section>
            <q-card-section>
              <q-expansion-item icon="mdi-data-matrix-scan" label="Angegebene Informationen">
                <div class="column q-mt-sm">
                  <div class="row items-center" v-for="extraInfo in props.row.extra_information" :key="extraInfo.id">
                    {{ extraInfo?.user_information_field?.name }}: {{ showResultBasedOnFieldType(extraInfo) }}
                  </div>
                </div>
              </q-expansion-item>
            </q-card-section>
          </q-card>
        </div>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import IUser from 'src/misc/interfaces/User/IUser'
import { api } from 'boot/axios'
import IUserInformation from 'src/misc/interfaces/User/IUserInformation'

const availableData = ref<IUser[]>([])
const nextPage = ref<number>(0)
const lastPage = ref<number>(Math.ceil(availableData.value?.length ?? 0 / 30))
const loading = ref<boolean>(false)
const columns = [
  { name: 'user', label: 'user', field: 'user' },
  { name: 'fields', label: 'Felder', field: 'fields' }
]

onMounted(() => {
  getInitialData()
})

function getInitialData () {
  loading.value = true
  api.get('/api/users/admin/extraFields?skip=' + 0 + '&take=30')
    .then((response) => {
      availableData.value?.push(...response.data)
      loading.value = false
    })
    .catch((error) => {
      console.error(error)
    })
}
function onRequest (properties: { index: number, from: number, to: number, direction: string}) {
  const lastIndex = availableData.value?.length ?? 1 - 1
  loading.value = true
  if (!loading.value && nextPage.value < lastPage.value && properties.to === lastIndex) {
    loading.value = true
    api.get('/api/users/admin/extraFields?skip=' + nextPage.value + '&take=30')
      .then((response) => {
        availableData.value?.push(...response.data)
        loading.value = false
      })
      .catch((error) => {
        console.error(error)
      })
  }
}
function showResultBasedOnFieldType (userInformationField: IUserInformation) {
  if (userInformationField?.user_information_field?.dynamic_field === undefined) {
    return 'N.A.'
  }
  if (userInformationField?.user_information_field?.dynamic_field?.type === 'TOGGLE') {
    return userInformationField.value === '1' ? 'Ja' : 'Nein'
  } else {
    return userInformationField.value
  }
}
</script>

<style scoped>

</style>
