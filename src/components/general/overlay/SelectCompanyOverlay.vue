<template>
  <q-dialog :persistent="false"
            ref="dialogRef"
            @hide="setNullCompanyOnSkip()">
    <q-card>
      <q-card-section>
        <div class="text-h6">Hier eine Firma auswählen, in der du Arbeiten möchtest</div>
      </q-card-section>
      <q-card-section v-if="loading">
        <div class="row q-gutter-md">
          <div class="col-12">
            <q-skeleton />
          </div>
          <div class="col-12">
            <q-skeleton />
          </div>
          <div class="col-12">
            <q-skeleton />
          </div>
        </div>
      </q-card-section>
      <q-card-section>
        <div v-if="availableCompanies?.length > 0">
          <q-scroll-area style="height: 250px; width: 100%;">
            <q-card v-for="company in availableCompanies" :key="company.id" class="q-mb-sm">
              <q-card-section>
                <div class="col">
                  <div class="row items-baseline justify-between">
                    <div class="text-h4">{{ company.name }}</div>
                  </div>
                  <div class="row items-baseline justify-center">
                    <q-btn class="q-mt-md"
                           color="primary"
                           label="Hier arbeiten"
                           icon="mdi-arrow-right-bold"
                           @click="setCompany(company)"/>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-scroll-area>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">

import { onMounted, ref } from 'vue'
import { api } from 'boot/axios'
import { companyStore } from 'stores/companyStore'
import { useDialogPluginComponent } from 'quasar'
import Company from 'src/misc/classes/company/Company'
import ICompany from 'src/misc/interfaces/Company/ICompany'

export default {
  name: 'SelectCompanyOverlay',
  defineEmits: [
    ...useDialogPluginComponent.emits
  ],
  setup () {
    const availableCompanies = ref()
    const company = companyStore()
    const { dialogRef, onDialogOK } = useDialogPluginComponent()
    const loading = ref<boolean>(false)
    const selected = ref<boolean>(false)
    onMounted(() => {
      loading.value = true
      // get all available companies for the user
      api.get('/api/userCompanies')
        .then((response) => {
          availableCompanies.value = response.data.companies
          loading.value = false
        })
        .catch((error) => {
          console.error(error)
        })
    })
    function setCompany (availableCompany: Company | ICompany) {
      selected.value = true
      // set the company in the store
      company.updateCompanyId(availableCompany.id)
      onDialogOK()
    }
    function setNullCompanyOnSkip () {
      if (!selected.value) {
        company.updateCompanyId(-1)
        onDialogOK()
      }
    }
    return {
      availableCompanies,
      setCompany,
      dialogRef,
      setNullCompanyOnSkip,
      loading
    }
  }
}
</script>

<style scoped>

</style>
