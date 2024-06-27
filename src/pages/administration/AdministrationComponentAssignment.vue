<template>
  <div class="row">
    <div class="col-12 q-mb-md q-mt-md">
      <q-btn label="Änderungen Speichern"
             color="secondary"
             :disable="companyAccessToChange.length < 1"
             v-if="canEditCompanyAccess"
             @click="submitChanges()"
             icon="mdi-content-save"/>
    </div>
    <div class="col-12">
      <q-table title="Verfügbare Gewerbe"
               :columns="columns"
               class="default-table-height cms-sticky-header-table"
               row-key="id"
               :loading="loading"
               :pagination="{ rowsPerPage: 30 }"
               :rows="allCompanies">
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td v-for="headerVal in columns"
                  :key="headerVal.name"
                  :props="props">
              {{ props.row[headerVal.name] }}
              <div v-if="['lst', 'elst', 'dms', 'dms_files', 'crm', 'er', 'fms', 'rtl', 'wms', 'cms', 'cal', 'racm', 'statistics', 'taxmax'].indexOf(headerVal.name) !== -1"
                   class="cursor-pointer">
                <span>{{ props.row.company_module_accesses[headerVal.name] ?? '' ? 'Ja' : 'Nein'}}</span>
                <q-popup-edit :model-value="props.row.company_module_accesses![headerVal.name]"
                              v-slot="scope"
                              buttons
                              label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => updateCompanyAccess(val, props.row, headerVal.name)">
                  <q-checkbox v-model="scope.value"
                              color="teal-3"
                              :true-value="1"
                              label="Zugriff für dieses Unternehmen aktivieren/deaktiveren"
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
import ICompanyModuleAccess from 'src/misc/interfaces/Company/ICompanyModuleAccess'
import { computed, defineComponent, onMounted, onUnmounted, ref } from 'vue'
import laravelEcho from 'boot/laravelecho'
import { useUserStore } from 'stores/useUserStore'
import AssignPolicies from 'src/misc/functions/policies/Policies'

export default defineComponent({
  name: 'AdministrationComponentAssignment',
  setup () {
    const allCompanies = ref<ICompany[]>([])
    const companyAccessToChange = ref<ICompanyModuleAccess[]>([])
    const canEditCompanyAccess = ref<boolean>(false)
    const loading = ref<boolean>(true)
    const userStore = useUserStore()
    const userId = computed(() => userStore.userId)
    const columns = [
      { name: 'id', label: 'ID', field: 'id' },
      { name: 'name', label: 'Name', field: 'name' },
      { name: 'lst', label: 'LST', field: 'lst', align: 'center' },
      { name: 'elst', label: 'ELST', field: 'elst', align: 'center' },
      { name: 'dms', label: 'DMS', field: 'dms', align: 'center' },
      { name: 'dms_files', label: 'DMS Dateien', field: 'dms_files', align: 'center' },
      { name: 'crm', label: 'CRM', field: 'crm', align: 'center' },
      { name: 'er', label: 'ER', field: 'er', align: 'center' },
      { name: 'fms', label: 'FMS', field: 'fms', align: 'center' },
      { name: 'rtl', label: 'RTL', field: 'rtl', align: 'center' },
      { name: 'wms', label: 'WMS', field: 'wms', align: 'center' },
      { name: 'cal', label: 'CAL', field: 'cal', align: 'center' },
      { name: 'cms', label: 'CMS', field: 'cms', align: 'center' },
      { name: 'racm', label: 'RACM', field: 'racm', align: 'center' },
      { name: 'statistics', label: 'Statistiken', field: 'statistics', align: 'center' },
      { name: 'taxmax', label: 'TaxMax®', field: 'taxmax', align: 'center' }
    ]
    onMounted(async () => {
      // get permissions
      getPermissions()

      // get all companies
      getAllCompanies()
    })
    onUnmounted(() => {
      // stop listening to the change event
      laravelEcho.leave('user.reload.' + userId.value)
    })
    function getPermissions () {
      api.get('/api/administrationPolicies/companyModules')
        .then((res) => {
          AssignPolicies([
            { policyName: 'Administration_Company_Module_Edit', policyToAssign: canEditCompanyAccess }
          ], res.data.modulePolicies)
        })
        .catch((err) => {
          console.error(err)
        })
    }
    function getAllCompanies () {
      loading.value = true
      api.get('/api/companies/modules')
        .then((res) => {
          allCompanies.value = res.data.companies
          loading.value = false
        })
        .catch((err) => {
          console.error(err)
        })
    }
    function updateCompanyAccess (value: number, company: ICompany, changedValue: string) {
      if (company.company_module_accesses === undefined) {
        return
      }
      company.company_module_accesses[changedValue] = value
      if (companyAccessToChange.value === undefined) {
        companyAccessToChange.value = []
      }
      if (companyAccessToChange.value.indexOf(company.company_module_accesses) === -1) {
        companyAccessToChange.value.push(company.company_module_accesses)
      }
    }
    function submitChanges () {
      if (companyAccessToChange.value.length < 1) {
        return
      }
      api.patch('/api/companies/modules/update', {
        companies: companyAccessToChange.value
      })
        .catch((err) => {
          console.error(err)
        })
      companyAccessToChange.value = []
    }
    return {
      companyAccessToChange,
      allCompanies,
      columns,
      canEditCompanyAccess,
      loading,
      updateCompanyAccess,
      submitChanges
    }
  }
})
</script>

<style scoped>
.table-height {
  height: 70vh;
}
</style>
