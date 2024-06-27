<template>
  <q-table :columns="columns" :rows="removedUserVehicles" class="default-table-height"
           :pagination="{ rowsPerPage: 15 }">
    <template v-slot:body="props">
      <q-tr props="props">
        <q-td v-for="headerVal in columns" :key="headerVal.name" :props="props">
          <div v-if="headerVal.name === 'inspection_date' || headerVal.name === 'purchase_date' || headerVal.name === 'deleted_at'">
            {{ FormatDateTime(props.row[headerVal.name]) }}
          </div>
          <div v-else-if="headerVal.name === 'vehicle_name'">
            {{ props.row.vehicle.name }}
          </div>
          <div v-else-if="headerVal.name === 'tuning'">
            <div class="column items-center justify-center">
              <q-chip color="green-6" v-if="props.row[headerVal.name]?.engine_tuning === 1">
                Motor-Tuning
              </q-chip>
              <q-chip color="green-6" v-if="props.row[headerVal.name]?.transmission_tuning === 1">
                Auspuff-Tuning
              </q-chip>
              <q-chip color="green-6" v-if="props.row[headerVal.name]?.turbo_tuning === 1">
                Getriebe-Tuning
              </q-chip>
              <q-chip color="green-6" v-if="props.row[headerVal.name]?.brake_tuning === 1">
                Bremsen-Tuning
              </q-chip>
            </div>
          </div>
          <div v-else-if="headerVal.name === 'winter_tires'">
            {{ props.row[headerVal.name] === 1 ? 'Ja' : 'Nein' }}
          </div>
          <div v-else-if="headerVal.name === 'miles'">
            {{ props.row[headerVal.name] !== null ? props.row[headerVal.name] + ' mi.' : '' }}
          </div>
          <div v-else-if="headerVal.name === 'removal_reason'">
            {{ props.row.removal.reason }}
          </div>
          <div v-else-if="headerVal.name === 'purchase_price'">
            {{ props.row[headerVal.name] !== null ? '$' + props.row[headerVal.name] : '' }}
          </div>
          <div v-else-if="headerVal.name === 'action'">
            <create-something-new-button text="Wiederherstellen" icon="mdi-car-key"
                                         @create-something-new="restoreUserVehicle(props.row.id)"/>
          </div>
          <div v-else>
            {{ props.row[headerVal.name] }}
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import IUserVehicle from 'src/misc/interfaces/UserVehicle/IUserVehicle'
import { api } from 'boot/axios'
import FormatDateTime from '../../../misc/functions/FormatDateTime'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'

const removedUserVehicles = ref<IUserVehicle[]>([])
const columns = [
  { name: 'vehicle_name', field: 'vehicle_name', label: 'Fahrzeug' },
  { name: 'license_plate', field: 'license_plate', label: 'Kennzeichen' },
  { name: 'miles', field: 'miles', label: 'Meilen' },
  { name: 'winter_tires', field: 'winter_tires', label: 'Winterreifen' },
  { name: 'inspection_date', field: 'inspection_date', label: 'Letzte Inspektion' },
  { name: 'parking_location', field: 'parking_location', label: 'Parkort' },
  { name: 'purchase_price', field: 'purchase_price', label: 'Kaufpreis' },
  { name: 'purchase_date', field: 'purchase_date', label: 'Kaufdatum' },
  { name: 'deleted_at', field: 'deleted_at', label: 'Weggegeben' },
  { name: 'removal_reason', field: 'removal_reason', label: 'Notiz' },
  { name: 'tuning', field: 'tuning', label: 'Tuning' },
  { name: 'action', field: 'action', label: 'Aktion' }
]

onMounted(() => {
  getRemovedUserVehicles()
})

function getRemovedUserVehicles () {
  api.get('/api/userVehicle/removed')
    .then((response) => {
      removedUserVehicles.value = response.data
    })
    .catch((error) => {
      console.error(error)
    })
}
function restoreUserVehicle (currId: number) {
  api.patch('/api/userVehicle/restore', {
    id: currId
  })
    .then(() => {
      getRemovedUserVehicles()
    })
    .catch((error) => {
      console.error(error)
    })
}
</script>

<style scoped>

</style>
