<template>
  <div class="">
    <CreateSomethingNewButton
      text="Neues Firmenfahrzeug erstellen"
      v-if="canCreateCompanyCar"
      @click="createNewCompanyCar()"/>
    <q-btn label="Ausgewählte löschen"
           color="negative"
           class="q-ml-md"
           :disable="deleteButtonDisabled"
           v-if="canDeleteCompanyCar"
           @click="deleteCompanyCars"/>
    <q-btn label="Änderungen speichern"
           color="primary"
           class="q-ml-md"
           v-if="canEditCompanyCar"
           :disable="companyCarsForEdit?.length === 0"
           @click="updateCompanyCars()"/>
  </div>
  <div class="column justify-start items-center">
    <q-table class="virtual-scroll-table-height q-mt-md full-width cms-sticky-header-table" virtual-scroll
      title="Alle Firmenfahrzeuge" :columns="columns" :loading="loading" no-data-label="Keine Daten vorhanden"
      row-key="id" :pagination="{ rowsPerPage: 20 }" v-model:selected="selectedCarsForDeletion"
      @selection="(state) => state.added ? deleteButtonDisabled = false : deleteButtonDisabled = true"
      :selection="canDeleteCompanyCar ? 'multiple' : 'none'" :rows="rows">
      <template v-slot:loading>
        <q-inner-loading showing color="primary"/>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props" v-if="columns?.length > 0">
          <q-td v-if="canDeleteCompanyCar">
            <q-checkbox color="accent"
                        v-model="props.selected"/>
          </q-td>
          <q-td v-for="headerVal in columns"
                :key="headerVal.name"
                :props="props">
            <div v-if="!canDeleteCompanyCar">
                <span v-if="headerVal.name === 'name'">
                {{ props.row.vehicle.vehicle.name }}
              </span>
              <span v-else-if="headerVal.name === 'fuel'">
                {{ FuelType[props.row.vehicle.vehicle.fuel] }}
              </span>
              <span v-else-if="headerVal.name === 'winter_tires'">
                {{ props.row[headerVal.name] === 0 ? 'Nein' : 'Ja' }}
              </span>
              <span v-else>
                {{ props.row[headerVal.name] }}
              </span>
            </div>
            <div v-else>
              <span v-if="headerVal.name === 'name'">
                {{ props.row.vehicle.vehicle.name }}
              </span>
              <span v-else-if="headerVal.name === 'license_plate'"
                   class="cursor-pointer">
                {{ props.row[headerVal.name] }}
                <q-popup-edit :model-value="props.row[headerVal.name]"
                              v-slot="scope"
                              buttons
                              label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => editCompanyCar(val, props.row, headerVal.name)">
                  <q-input v-model="scope.value"
                           outlined
                           label="Nummernschild"
                           counter
                           :maxlength="16"/>
                </q-popup-edit>
              </span>
              <span v-else-if="headerVal.name === 'fuel'">
                {{ props.row?.vehicle?.vehicle?.fuel_type?.name }}
              </span>
              <span v-else-if="headerVal.name === 'miles'"
                    class="cursor-pointer">
                {{ props.row[headerVal.name] }}
                <q-popup-edit :model-value="props.row[headerVal.name]"
                              v-slot="scope"
                              buttons
                              label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => editCompanyCar(val, props.row, headerVal.name)">
                  <q-input v-model.number="scope.value"
                           outlined
                           label="Meilenstand"
                           type="number"/>
                </q-popup-edit>
              </span>
              <span v-else-if="headerVal.name === 'winter_tires'"
                    class="cursor-pointer">
                {{ props.row[headerVal.name] === 0 ? 'Nein' : 'Ja' }}
                <q-popup-edit :model-value="props.row[headerVal.name]"
                              v-slot="scope"
                              buttons
                              label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => editCompanyCar(val, props.row, headerVal.name)">
                <q-toggle v-model="scope.value"
                          :true-value="1"
                          :false-value="0"
                          label="Winterreifen drauf?"/>
                </q-popup-edit>
              </span>
              <span v-else-if="headerVal.name === 'inspection_date'">
                <span v-if="props.row[headerVal.name] === null || props.row[headerVal.name] === undefined"
                      class="text-red-5 text-bold">
                  Noch keine Inspektion
                </span>
                <span v-else>
                  <span v-if="checkIfInspectionIsDue(props.row[headerVal.name])" class="text-orange-4 text-bold">
                    {{ FormatDateTime(props.row[headerVal.name], true) }}
                  </span>
                  <span v-else class="text-green-4">
                    {{ FormatDateTime(props.row[headerVal.name], true) }}
                  </span>
                </span>
                <q-popup-edit :model-value="props.row[headerVal.name]"
                              v-slot="scope"
                              buttons
                              label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => editCompanyCar(val, props.row, headerVal.name)">
                  <q-date v-model="scope.value"
                          outlined mask="YYYY-MM-DD"
                          label="Inspektionsdatum" clearable today-btn/>
                </q-popup-edit>
              </span>
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useUserStore } from 'stores/useUserStore'
import { date, useQuasar } from 'quasar'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import CreateNewCompanyCarDialog from 'components/generalManagement/CompanyCars/CreateNewCompanyCarDialog.vue'
import ICompanyCar from 'src/misc/interfaces/CompanyCar/ICompanyCar'
import { companyStore } from 'stores/companyStore'
import laravelEcho from 'boot/laravelecho'
import { api } from 'src/boot/axios'
import FuelType from '../../misc/Enums/Vehicle/FuelType'
import AssignPolicies from 'src/misc/functions/policies/Policies'
import { ICompanySetting } from 'src/misc/interfaces/CompanySetting/ICompanySetting'
import FormatDateTime from '../../misc/functions/FormatDateTime'

const userStore = useUserStore()
const userId = computed(() => userStore.userId)
const cStore = companyStore()
const companyId = computed(() => cStore.companyId)
const $q = useQuasar()
const columns = [{ name: 'name', label: 'Fahrzeug', field: 'name', sortable: true },
  { name: 'license_plate', label: 'Nummernschild', field: 'license_plate', sortable: true },
  { name: 'fuel', label: 'Tankart', field: 'fuel' },
  { name: 'miles', label: 'Meilen', field: 'miles' },
  { name: 'winter_tires', label: 'Winterreifen', field: 'winter_tires' },
  { name: 'inspection_date', label: 'Letzte Inspektion', field: 'inspection_date' }]
const loading = ref(true)
const rows = ref<ICompanyCar[]>([])
const selectedCarsForDeletion = ref<ICompanyCar[]>()
const companyCarsForEdit = ref<number[]>()
const companySetting = ref<ICompanySetting>()
const deleteButtonDisabled = ref<boolean>(true)
const canCreateCompanyCar = ref<boolean>(false)
const canDeleteCompanyCar = ref<boolean>(false)
const canEditCompanyCar = ref<boolean>(false)
watch(companyId, () => {
  getPermissions()
  getAvailableCompanyCars()
  getInspectionInterval()
})
onMounted(async () => {
  joinReloadChannel()
  // get permissions
  getPermissions()
  // get company cars
  getAvailableCompanyCars()
  // get inspection interval
  getInspectionInterval()
})
onUnmounted(() => {
  // stop listening to the change event
  laravelEcho.leave('user.reload.' + userId.value)
})
watch(userId, () => {
  joinReloadChannel()
})
function joinReloadChannel () {
  if (userId.value <= 0) { return }
  // listen to the change event
  laravelEcho.private('user.reload.' + userId.value)
    .listen('.user.reload', () => {
      getAvailableCompanyCars()
    })
}
function getPermissions () {
  if (companyId.value <= 0) { return }
  api.get('/api/policies/generalManagement/companyCars/' + companyId.value)
    .then((res) => {
      AssignPolicies([
        { policyName: 'GeneralManagement_CompanyVehicles_Create', policyToAssign: canCreateCompanyCar },
        { policyName: 'GeneralManagement_CompanyVehicles_Delete', policyToAssign: canDeleteCompanyCar },
        { policyName: 'GeneralManagement_CompanyVehicles_Update', policyToAssign: canEditCompanyCar }
      ], res.data.companyCarPolicies)
    })
    .catch((error) => {
      console.error(error)
    })
}
function getAvailableCompanyCars () {
  if (companyId.value <= 0) return
  api.get('/api/companyCars/reduced/' + companyId.value)
    .then((response) => {
      rows.value = response.data.companyCars
      loading.value = false
      selectedCarsForDeletion.value = undefined
      companyCarsForEdit.value = undefined
    })
    .catch((error) => {
      console.error(error)
    })
}
function getInspectionInterval () {
  if (companyId.value <= 0) return
  api.get('/api/companySettings/inspection/' + companyId.value)
    .then((response) => {
      companySetting.value = response.data
    })
    .catch((error) => {
      console.error(error)
    })
}
function createNewCompanyCar () {
  $q.dialog({
    component: CreateNewCompanyCarDialog,
    ok: {
      push: true,
      label: 'Erstellen'
    }
  })
    .onOk((data) => {
      postNewCompanyCar(data as ICompanyCar)
    })
}
function postNewCompanyCar (data: ICompanyCar) {
  if (companyId.value <= 0) return
  api.post('/api/companyCars/create/' + companyId.value, {
    vehicle_id: data.vehicle_id,
    license_plate: data.license_plate,
    miles: data.miles,
    winter_tires: data.winter_tires
  })
    .then(() => {
      getAvailableCompanyCars()
    })
    .catch((error) => {
      console.error(error)
    })
}
function editCompanyCar (newValue: string | number, companyCar: ICompanyCar, valueChanged: string) {
  console.log(newValue)
  if (valueChanged === 'license_plate' && newValue.toString().length === 0) return
  companyCar[valueChanged] = newValue
  if (companyCarsForEdit.value?.find((v: number) => v === companyCar.id) === undefined) {
    if (companyCarsForEdit.value === undefined) {
      companyCarsForEdit.value = []
    }
    companyCarsForEdit.value?.push(companyCar.id)
  }
}
function updateCompanyCars () {
  if (companyCarsForEdit.value === undefined) return
  const carsForEdit = companyCarsForEdit.value?.map((v: number) => {
    const car = rows.value.find((c: ICompanyCar) => c.id === v)
    if (car !== undefined) {
      return {
        id: car.id,
        vehicle_id: car.vehicle?.vehicle_id,
        license_plate: car.license_plate,
        miles: car.miles,
        winter_tires: car.winter_tires,
        inspection_date: car.inspection_date
      }
    } else {
      return undefined
    }
  })
  api.patch('/api/companyCars/edit/' + companyId.value, {
    company_cars: carsForEdit
  })
    .then(() => {
      companyCarsForEdit.value = []
      getAvailableCompanyCars()
    })
    .catch((error) => {
      console.error(error)
    })
}
function deleteCompanyCars () {
  if (selectedCarsForDeletion.value !== undefined) {
    // sanitize data
    const carsForDeletion =
      selectedCarsForDeletion.value.map((v: ICompanyCar) => {
        return {
          id: v.id
        }
      })
    api.post('/api/companyCars/delete/' + companyId.value, {
      company_cars: carsForDeletion
    })
      .then(() => {
        selectedCarsForDeletion.value = []
        getAvailableCompanyCars()
      })
      .catch((error) => {
        console.error(error)
      })
  }
}
function checkIfInspectionIsDue (inspectionDate?: string | undefined | null) {
  if (inspectionDate === null || inspectionDate === undefined || companySetting.value === undefined ||
    companySetting.value?.inspection_interval === null || companySetting.value?.inspection_interval === undefined) return false
  if (companySetting.value?.inspection_interval === 0) return false
  const lastInspection = date.formatDate(new Date(inspectionDate), 'YYYY-MM-DD')
  const today = date.formatDate(new Date(), 'YYYY-MM-DD')
  return date.getDateDiff(today, lastInspection, 'days') > companySetting.value?.inspection_interval
}
</script>

<style scoped>

</style>
