<template>
  <div class="row">
    <div class="col-12 q-mb-md q-mt-md">
      <q-btn label="Änderungen Speichern"
             color="secondary"
             :disable="companySantosSettingsToChange.length < 1"
             v-if="canEditSantosPoints"
             @click="sendChanges()"
             icon="mdi-content-save"/>
    </div>
    <div class="col-12">
      <q-table title="Verfügbare Firmen"
               :columns="columns"
               class="table-height"
               row-key="id"
               :loading="loading"
               :pagination="{ rowsPerPage: 30 }"
               :rows="allCompanySantosSettings">
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td v-for="headerVal in columns"
                  :key="headerVal.name"
                  :props="props">
              {{ props.row[headerVal.name] }}
              <div v-if="headerVal.name === 'enabled'"
                   class="cursor-pointer">
                {{ props.row.company_santos_point_setting === null ? 'Öhm Putt??🤔'
                : props.row.company_santos_point_setting.enabled ? 'Ja' : 'Nein' }}
                <q-popup-edit :model-value="props.row.company_santos_point_setting.enabled"
                              v-slot="scope"
                              v-if="props.row.company_santos_point_setting !== null"
                              buttons
                              label-cancel="Abbrechen"
                              label-set="Aktualisieren"
                              @save="(val) => updateSantosPoints(val, props.row, headerVal.name)">
                  <q-checkbox v-model="scope.value"
                              color="teal-3"
                              :true-value="1"
                              label="Santos Punkte für dieses Unternehmen aktivieren/deaktiveren"
                              :false-value="0"/>
                </q-popup-edit>
              </div>
              <div v-if="headerVal.name === 'multiplier'"
                   class="cursor-pointer">
                {{ props.row.company_santos_point_setting === null ? 'Öhm Putt??🤔'
                : props.row.company_santos_point_setting.multiplier }}
                <q-popup-edit :model-value="props.row.company_santos_point_setting.multiplier"
                              v-slot="scope"
                              v-if="props.row.company_santos_point_setting !== null"
                              buttons
                              label-cancel="Abbrechen"
                              label-set="Aktualisieren"
                              @save="(val) => updateSantosPoints(val, props.row, headerVal.name)">
                  <q-input v-model.number="scope.value"
                           type="number"
                           :rules="[
                             val => decimalPlaces(val) <= 10 || 'Maximal 10 Nachkommastellen'
                           ]"
                           label="SantosCard Multiplikator"/>
                </q-popup-edit>
              </div>
              <div v-if="headerVal.name === 'customizable_items'"
                   class="cursor-pointer">
                {{ props.row.company_santos_point_setting === null ? 'Öhm Putt??🤔'
                : props.row.company_santos_point_setting.customizable_items ? 'Ja' : 'Nein' }}
                <q-popup-edit :model-value="props.row.company_santos_point_setting.customizable_items"
                              v-slot="scope"
                              v-if="props.row.company_santos_point_setting !== null"
                              buttons
                              label-cancel="Abbrechen"
                              label-set="Aktualisieren"
                              @save="(val) => updateSantosPoints(val, props.row, headerVal.name)">
                  <q-checkbox v-model="scope.value"
                              color="green-3"
                              :true-value="1"
                              label="Santos Punkte pro Produkt aktivieren/deaktiveren"
                              :false-value="0"/>
                </q-popup-edit>
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script lang="ts">
import { api } from 'src/boot/axios'
import ICompany from 'src/misc/interfaces/Company/ICompany'
import ICompanySantosPointsSettings from 'src/misc/interfaces/Company/IcompanySantosPointsSettings'
import { defineComponent, onMounted, ref } from 'vue'
import AssignPolicies from 'src/misc/functions/policies/Policies'

export default defineComponent({
  name: 'AdministrationSantosCardPointAssignment',
  setup () {
    const canEditSantosPoints = ref<boolean>(false)
    const allCompanySantosSettings = ref<ICompany[]>([])
    const companySantosSettingsToChange = ref<ICompanySantosPointsSettings[]>([])
    const loading = ref<boolean>(true)
    const columns = [
      { name: 'id', label: 'ID', field: 'id' },
      { name: 'name', label: 'Name', field: 'name' },
      { name: 'enabled', label: 'Santos Punkte Aktiv', field: 'enabled' },
      { name: 'multiplier', label: 'Gewerbe Multiplikator', field: 'multiplier' },
      { name: 'customizable_items', label: 'Produkte können individuell Angepasst werden', field: 'customizable_items' }
    ]
    onMounted(() => {
      getPermissions()
      getCompaniesWithSantosSettings()
    })
    function getCompaniesWithSantosSettings () {
      loading.value = true
      api.get('/api/companies/santospointsettings')
        .then((response) => {
          allCompanySantosSettings.value = response.data.companies
          loading.value = false
        })
        .catch((error) => {
          console.error(error)
        })
    }
    function getPermissions () {
      api.get('/api/administrationPolicies/getSantosSettingsPolicies')
        .then((res) => {
          AssignPolicies([
            { policyName: 'Administration_SantosCard_Edit', policyToAssign: canEditSantosPoints }
          ], res.data.santosSettingsPolicies)
        })
        .catch((error) => {
          console.error(error)
        })
    }
    function updateSantosPoints (value: number, company: ICompany, changedValue: string) {
      if (company.company_santos_point_setting === undefined) {
        return
      }
      company.company_santos_point_setting[changedValue] = value
      if (companySantosSettingsToChange.value?.indexOf(company.company_santos_point_setting) === -1) {
        companySantosSettingsToChange.value.push(company.company_santos_point_setting)
      }
    }
    function decimalPlaces (num: number) {
      const match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/)
      if (!match) { return 0 }
      return Math.max(0,
        // Number of digits right of decimal point.
        (match[1] ? match[1].length : 0) -
        // Adjust for scientific notation.
        (match[2] ? +match[2] : 0))
    }
    function sendChanges () {
      api.patch('/api/companies/santospointsettings/update', {
        companies: companySantosSettingsToChange.value
      })
        .then(() => {
          companySantosSettingsToChange.value = []
        })
    }
    return {
      canEditSantosPoints,
      allCompanySantosSettings,
      columns,
      loading,
      companySantosSettingsToChange,
      updateSantosPoints,
      decimalPlaces,
      sendChanges
    }
  }
})
</script>

<style scoped>
.table-height {
  height: 70vh;
}
</style>
