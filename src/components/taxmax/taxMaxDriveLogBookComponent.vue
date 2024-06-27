<template>
  <q-card>
    <q-card-section v-if="canAddRide">
      <div class="row items-center q-gutter-sm">
        <create-something-new-button text="Fahrt hinzufügen" icon="mdi-car-child-seat"
                                     @click="addRide()"/>
        <q-input v-model.number="newRidePassengerCount" label="Kundenanzahl" type="number"
                 class="col-sm-2 col-md-2 col-lg-1" outlined :min="0" :max="255" dense/>
        <q-input v-model="newRideStartLocation" label="Von" class="col-sm-2 col-md-2 col-lg-2" outlined clearable
                 @clear="newRideStartLocation = ''" dense maxlength="128"/>
        <q-input v-model="newRideDestinationLocation" label="Ziel*" class="col-sm-2 col-md-2 col-lg-2" outlined clearable
                 @clear="newRideDestinationLocation = ''" dense  maxlength="128"/>
        <q-input v-model="newRideContactPhoneNumber" label="Kunden Tel." class="col-sm-2 col-md-2 col-lg-2"
                 outlined clearable @clear="newRideContactPhoneNumber = ''" dense maxlength="16"/>
        <q-checkbox v-model="rideSelfClaim" label="Selbst fahren" class="col-sm-2 col-md-2 col-lg-2" dense/>
      </div>
    </q-card-section>
    <q-separator v-if="canAddRide"/>
    <q-card-section>
      <q-table virtual-scroll class="full-width cms-sticky-header-table default-table-height" :columns="columns"
               :rows="currentDriveLogs" row-key="id" :pagination=" { rowsPerPage: 0 }">
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td v-for="headerVal in columns" :key="headerVal.name" :props="props">
              <div v-if="headerVal.name === 'status'" class="row items-center justify-end q-gutter-sm">
                <q-btn icon="mdi-car-select" color="secondary" @click="claimRide(props.row?.id)"
                       v-if="props.row?.company_car_id === null && !props.row?.cancelled && canClaimRide">
                  <q-tooltip class="text-body2">
                    Fahrt übernehmen
                  </q-tooltip>
                </q-btn>
                <div v-else-if="props.row?.done">
                  <div class="text-bold text-warning">
                    Abgeschlossen
                    <q-tooltip class="text-body2" v-if="props.row?.pick_up_time === null">
                      Aber ohne, dass der Kunde als Abgeholt markiert wurde
                    </q-tooltip>
                  </div>
                </div>
                <div v-else-if="props.row?.cancelled">
                  <div class="text-bold text-negative">Abgebrochen</div>
                </div>
                <div v-else class="text-bold text-positive">
                  Übernommen von: {{ props.row?.company_car?.vehicle?.vehicle?.name }} |
                  {{ props.row?.company_car?.license_plate }}
                  <q-tooltip v-if="props.row?.company_car?.driver_persons !== null">
                    <div v-for="driver in props.row?.company_car?.driver_persons"
                         :key="driver?.first_name + driver?.last_name">
                      {{ driver?.first_name }} {{ driver?.last_name }}
                    </div>
                  </q-tooltip>
                </div>
                <q-btn icon="mdi-hail" color="positive" class="col-auto" @click="guestPickedUp(props.row?.id)"
                       v-if="+props.row?.cancelled !== 1 && +props.row?.done !== 1 && props.row?.pick_up_time === null && props.row?.company_car !== null">
                  <q-tooltip class="text-body2">
                    Kunde on Board
                  </q-tooltip>
                </q-btn>
                <q-btn icon="mdi-account-cancel" color="warning" class="col-auto" @click="guestRemove(props.row?.id)"
                       v-if="+props.row?.cancelled !== 1 && +props.row?.done !== 1 && props.row?.pick_up_time !== null && props.row?.company_car !== null">
                  <q-tooltip class="text-body2">
                    Kunde doch nimmer da
                  </q-tooltip>
                </q-btn>
                <q-btn icon="mdi-check-bold" color="positive" class="col-auto" @click="handleFinishClicks(props.row?.id)"
                       v-if="props.row?.company_car_id !== null && !props.row?.cancelled && !props.row?.done && canClaimRide">
                  <q-tooltip class="text-body2">
                    Fahrt abgeschlossen (doppelklick für Trinkgeld)
                  </q-tooltip>
                </q-btn>
                <q-btn icon="mdi-car-off" color="negative" @click="cancelRide(props.row?.id)"
                       v-if="!props.row?.cancelled && canClaimRide">
                  <q-tooltip class="text-body2">
                    Fahrt Stornieren
                  </q-tooltip>
                </q-btn>
                <q-btn icon="mdi-car-clock" color="warning" @click="reactivateRide(props.row?.id)"
                       v-if="props.row?.cancelled && (canAddRide || canClaimRide)">
                  <q-tooltip class="text-body2">
                    Fahrt wieder aufnehmen
                  </q-tooltip>
                </q-btn>
                <q-btn icon="mdi-trash-can" color="negative" @click="deleteRide(props.row?.id)"
                       v-if="canDeleteRide">
                  <q-tooltip class="text-body2">
                    Fahrt löschen
                  </q-tooltip>
                </q-btn>
              </div>
              <div v-else-if="headerVal.name === 'created_at'">
                {{ FormatDateTime(props.row[headerVal.name]) }}
              </div>
              <div v-else-if="headerVal.name === 'updated_at'">
                <div v-if="props.row.created_at === props.row.updated_at">
                </div>
                <div v-else>
                  {{ FormatDateTime(props.row[headerVal.name]) }}
                </div>
              </div>
              <div v-else :class="`${ canAddRide ? 'cursor-pointer' : '' } full-height row items-center justify-end`">
                {{ props.row[headerVal.name] }}
                <q-popup-edit :model-value="props.row[headerVal.name]" v-slot="scope" buttons
                              label-set="Speichern" label-cancel="Abbrechen"
                              v-if="canAddRide" @save="(val) => editDrive(val, props.row, headerVal.name)">
                  <q-input v-model.number="scope.value" dense :label="headerVal.label" outlined
                           v-if="typeof scope.value === 'number'" :min="0" :max="255"/>
                  <q-input v-model="scope.value" dense :label="headerVal.label" outlined v-else/>
                </q-popup-edit>
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import IDriveLogBook from 'src/misc/interfaces/DriveLogBook/IDriveLogBook'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import { api } from 'boot/axios'
import FormatDateTime from '../../misc/functions/FormatDateTime'
import { useQuasar } from 'quasar'
import ICompanyCar from 'src/misc/interfaces/CompanyCar/ICompanyCar'
import taxMaxTipDialog from 'components/taxmax/dialog/taxMaxTipDialog.vue'

const props = defineProps({
  companyId: {
    type: Number,
    required: true
  },
  userId: {
    type: Number,
    required: true,
    default: 0
  },
  canAddRide: {
    type: Boolean,
    required: true,
    default: false
  },
  canClaimRide: {
    type: Boolean,
    required: true,
    default: false
  },
  canDeleteRide: {
    type: Boolean,
    required: true,
    default: false
  }
})
const newRideStartLocation = ref<string>('')
const newRideDestinationLocation = ref<string>('')
const newRidePassengerCount = ref<number>(1)
const newRideContactPhoneNumber = ref<string>('')
const currentDriveLogs = ref<IDriveLogBook[]>([])
const rideSelfClaim = ref<boolean>(false)
const historyDurationInHours = ref<number>(24)
const $q = useQuasar()
const clickTimer = ref()
const clickTimerDelay = 500
const clickTimerClicks = ref<number>(0)
const columns = [
  { name: 'status', label: 'Status', field: 'status' },
  { name: 'start_location', label: 'Abholort', field: 'start_location' },
  { name: 'end_location', label: 'Ziel', field: 'end_location' },
  { name: 'passenger_count', label: 'Fahrgäste', field: 'passenger_count' },
  { name: 'phone_number', label: 'Kontakt Nr.', field: 'phone_number' },
  { name: 'created_at', label: 'Erstellt', field: 'created_at' },
  { name: 'updated_at', label: 'Aktualisiert', field: 'updated_at' }
]

onMounted(() => {
  getDriveLogs()
})

watch(() => props.companyId, () => {
  getDriveLogs()
})

defineExpose({
  eventUpdateDriveLog,
  eventRemoveDriveLog,
  eventRemoveCar
})

function getDriveLogs () {
  if (props.companyId <= 0) return
  api.get('/api/taxmax/driveLog/' + props.companyId + '?duration=' + historyDurationInHours.value)
    .then((res) => {
      currentDriveLogs.value = res.data
    })
    .catch((err) => {
      console.error(err)
    })
}
function addRide () {
  if (props.companyId <= 0 || newRideDestinationLocation.value.length === 0 ||
    newRidePassengerCount.value === undefined) return
  api.post('/api/taxmax/create/ride/' + props.companyId, {
    start_location: newRideStartLocation.value.length === 0 ? undefined : newRideStartLocation.value,
    end_location: newRideDestinationLocation.value,
    passenger_count: newRidePassengerCount.value,
    phone_number: newRideContactPhoneNumber.value.length === 0 ? undefined : newRideContactPhoneNumber.value,
    self_claim: rideSelfClaim.value
  })
    .then((res) => {
      // check if a ride has already been added via wss
      const rideIndex = currentDriveLogs.value.findIndex((ride) => ride.id === res.data.id)
      if (rideIndex === undefined || rideIndex < 0) {
        currentDriveLogs.value.splice(0, 0, res.data)
      }
      resetRideForm()
    })
    .catch((err) => {
      console.error(err)
    })
}
function resetRideForm () {
  newRideStartLocation.value = ''
  newRideDestinationLocation.value = ''
  newRidePassengerCount.value = 1
  newRideContactPhoneNumber.value = ''
  rideSelfClaim.value = false
}
function claimRide (rideId: number | undefined) {
  if (props.companyId <= 0 || rideId === undefined) return
  api.post('/api/taxmax/claimRide/' + props.companyId, {
    drive_log_book_id: rideId
  })
    .then((res) => {
      const rideIndex = currentDriveLogs.value.findIndex((ride) => ride.id === rideId)
      if (rideIndex >= 0) {
        currentDriveLogs.value[rideIndex].company_car_id = res.data.company_car_id
      }
    })
    .catch((err) => {
      console.error(err)
    })
}
function cancelRide (rideId: number | undefined) {
  if (props.companyId <= 0 || rideId === undefined) return
  api.post('/api/taxmax/cancelRide/' + props.companyId, {
    drive_log_book_id: rideId
  })
    .then(() => {
      const rideIndex = currentDriveLogs.value.findIndex((ride) => ride.id === rideId)
      if (rideIndex >= 0) {
        currentDriveLogs.value[rideIndex].cancelled = true
        currentDriveLogs.value[rideIndex].done = false
        currentDriveLogs.value[rideIndex].company_car_id = undefined
      }
    })
    .catch((err) => {
      console.error(err)
    })
}
function reactivateRide (rideId: number | undefined) {
  if (props.companyId <= 0 || rideId === undefined) return
  api.post('/api/taxmax/reactivateRide/' + props.companyId, {
    drive_log_book_id: rideId
  })
    .then(() => {
      const rideIndex = currentDriveLogs.value.findIndex((ride) => ride.id === rideId)
      if (rideIndex >= 0) {
        currentDriveLogs.value[rideIndex].cancelled = false
        currentDriveLogs.value[rideIndex].done = false
        currentDriveLogs.value[rideIndex].company_car_id = null
      }
    })
    .catch((err) => {
      console.error(err)
    })
}
function handleFinishClicks (rideId: number | undefined) {
  clickTimerClicks.value++
  if (clickTimerClicks.value === 1) {
    clickTimer.value = setTimeout(() => {
      finishRide(rideId)
      clickTimerClicks.value = 0
    }, clickTimerDelay)
  } else {
    clearTimeout(clickTimer.value)
    clickTimerClicks.value = 0
    finishRideWithTip(rideId)
  }
}
function finishRide (rideId: number | undefined) {
  if (props.companyId <= 0 || rideId === undefined) return
  api.post('/api/taxmax/finishRide/' + props.companyId, {
    drive_log_book_id: rideId
  })
    .then(() => {
      const rideIndex = currentDriveLogs.value.findIndex((ride) => ride.id === rideId)
      if (rideIndex >= 0) {
        currentDriveLogs.value[rideIndex].done = true
      }
    })
    .catch((err) => {
      console.error(err)
    })
}
function finishRideWithTip (rideId: number | undefined) {
  if (props.companyId <= 0 || rideId === undefined) return
  $q.dialog({
    component: taxMaxTipDialog
  })
    .onOk((givenTip: number) => {
      if (givenTip <= 0) finishRide(rideId)
      api.post('/api/taxmax/finishRide/' + props.companyId, {
        drive_log_book_id: rideId,
        tip: givenTip
      })
        .then(() => {
          const rideIndex = currentDriveLogs.value.findIndex((ride) => ride.id === rideId)
          if (rideIndex >= 0) {
            currentDriveLogs.value[rideIndex].done = true
          }
        })
        .catch((err) => {
          console.error(err)
        })
    })
    .onCancel(() => {
      finishRide(rideId)
    })
}
function deleteRide (rideId: number | undefined) {
  if (props.companyId <= 0 || rideId === undefined) return
  $q.dialog({
    title: 'Fahrt löschen',
    message: 'Möchten Sie die Fahrt wirklich löschen?',
    ok: {
      push: true,
      color: 'negative',
      label: 'Ja'
    },
    cancel: {
      push: true,
      color: 'warning',
      label: 'Nein'
    }
  }).onOk(() => {
    api.post('/api/taxmax/deleteRide/' + props.companyId, {
      drive_log_book_id: rideId
    })
      .then(() => {
        const rideIndex = currentDriveLogs.value.findIndex((ride) => ride.id === rideId)
        if (rideIndex >= 0) {
          currentDriveLogs.value.splice(rideIndex, 1)
        }
      })
      .catch((err) => {
        console.error(err)
      })
  })
}
function editDrive (newValue: string | number, driveLogBook: IDriveLogBook, valueChanged: string) {
  driveLogBook[valueChanged] = newValue
  api.patch('/api/taxmax/editRide/' + props.companyId, {
    ...driveLogBook
  })
    .catch((err) => {
      console.error(err)
    })
}
function guestPickedUp (rideId: number | undefined) {
  if (props.companyId <= 0 || rideId === undefined) return
  api.post('/api/taxmax/guest/pickup/' + props.companyId, {
    drive_log_book_id: rideId
  })
    .then((res) => {
      const rideIndex = currentDriveLogs.value.findIndex((ride) => ride.id === rideId)
      if (rideIndex >= 0) {
        currentDriveLogs.value[rideIndex].pick_up_time = res.data.pick_up_time
      }
    })
    .catch((err) => {
      console.error(err)
    })
}
function guestRemove (rideId: number | undefined) {
  if (props.companyId <= 0 || rideId === undefined) return
  api.post('/api/taxmax/guest/remove/' + props.companyId, {
    drive_log_book_id: rideId
  })
    .then(() => {
      const rideIndex = currentDriveLogs.value.findIndex((ride) => ride.id === rideId)
      if (rideIndex >= 0) {
        currentDriveLogs.value[rideIndex].pick_up_time = null
      }
    })
    .catch((err) => {
      console.error(err)
    })
}
function eventUpdateDriveLog (driveLogBook: IDriveLogBook) {
  // check if a drive log exists with the id
  const driveLogIndex = currentDriveLogs.value?.findIndex((driveLog: IDriveLogBook) => driveLog.id === driveLogBook.id)
  if (driveLogIndex !== undefined && driveLogIndex >= 0) {
    // update the drive log
    currentDriveLogs.value?.splice(driveLogIndex, 1, driveLogBook)
  } else {
    // insert the drive log
    currentDriveLogs.value?.splice(0, 0, driveLogBook)
  }
}
function eventRemoveDriveLog (driveLogBook: IDriveLogBook) {
  // check if a drive log exists with the id
  const driveLogIndex = currentDriveLogs.value?.findIndex((driveLog) => driveLog.id === driveLogBook.id)
  if (driveLogIndex !== undefined && driveLogIndex >= 0) {
    // remove the drive log
    currentDriveLogs.value?.splice(driveLogIndex, 1)
  }
}
function eventRemoveCar (car: ICompanyCar) {
  // check if the car is assigned to a drive log that is not done
  const driveLogIndex = currentDriveLogs.value?.findIndex((driveLog) => driveLog.company_car_id === car.id && !driveLog.done)
  if (driveLogIndex !== undefined && driveLogIndex >= 0) {
    // remove the car from the drive log
    currentDriveLogs.value[driveLogIndex].company_car_id = null
    currentDriveLogs.value[driveLogIndex].company_car = null
  }
}
</script>

<style scoped>

</style>
