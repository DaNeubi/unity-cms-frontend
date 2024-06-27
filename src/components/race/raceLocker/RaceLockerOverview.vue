<template>
  <div class="row items-center">
    <div class="col-12">
      <div class="row items-center justify-start">
        <edit-something-button text="Zurück zur Renn auswahl" icon="mdi-arrow-left-bold" button-color="accent"
                               @create-something-new="$emit('backToRaceSelection1')"/>
      </div>
    </div>
    <div class="col-12">
      <q-card>
        <q-card-section>
          <div class="row items-center justify-between">
            <div class="text-body1 col-auto">
              Rennübersicht
            </div>
            <div class="col-3">
              <div class="row items-center justify-end cursor-pointer">
                <q-icon name="mdi-window-maximize" size="md" class="col-auto" @click="maximizeWindow" color="secondary">
                  <q-tooltip class="text-body2">
                    Fenster anzeigen
                  </q-tooltip>
                </q-icon>
                <q-icon name="mdi-window-minimize" size="md" class="col-auto" @click="minimizeWindow" color="secondary">
                  <q-tooltip class="text-body2">
                    Fenster verstecken
                  </q-tooltip>
                </q-icon>
              </div>
            </div>
          </div>
        </q-card-section>
        <q-slide-transition>
          <q-card-section v-show="visible">
            <q-list bordered separator class="rounded-borders">
              <q-item v-if="raceParticipants?.length > 1">
                <div class="row items-center">
                  <q-toggle v-model="massSelectToggle" color="orange"
                            @update:model-value="$emit('massStateChanged', massSelectToggle)"
                            :label="massSelectToggle ? 'Massenstart/Auswahl' : 'Einzel Auswahl'"/>
                </div>
              </q-item>
              <q-expansion-item expand-separator v-for="participant in raceParticipants" :key="participant.id">
                <template v-slot:header>
                  <q-item-section>
                    {{ getParticipantDetails(participant) }}
                  </q-item-section>
                </template>
                <q-card>
                  <q-card-section>
                    <div class="row items-center justify-start">
                      <div class="col-12">
                        <div class="row items-center justify-start q-gutter-md">
                          <q-checkbox :model-value="setParticipantMassSelectState(participant)" color="orange"
                                      v-if="massSelectToggle" :true-value="true" :false-value="undefined" class="col-auto"
                                      @update:model-value="updateParticipantMassSelect(participant)"
                                      :label="setParticipantMassSelectState(participant) ? 'Mit dabei' : 'Nicht ausgewählt'"/>
                          <edit-something-button text="Teilnehmer auswählen" icon="mdi-account-arrow-right"
                                                 :disable="selectedParticipant !== undefined
                                                 || (participant.disqualified === true || participant.disqualified === 1)
                                                 || participant?.lap === participant?.race?.laps" class="col-auto"
                                                 v-if="selectedParticipant?.id !== participant.id"
                                                 @create-something-new="setSelectParticipant(participant)"/>
                          <edit-something-button text="Teilnehmer freigeben" icon="mdi-account-reactivate" v-else
                                                 @create-something-new="releaseSelectedParticipant" class="col-auto"/>
                          <edit-something-button text="Teilnehmer disqualifizieren" icon="mdi-account-off"
                                                 button-color="warning" text-color="black"
                                                 v-if="participant.disqualified === false || participant.disqualified === 0"
                                                 @create-something-new="toggleUserDisqualificationDialog(true, participant)"/>
                          <edit-something-button text="Teilnehmer wieder freigeben" icon="mdi-account-check"
                                                 button-color="positive" v-else
                                                 @create-something-new="toggleUserDisqualificationDialog(false, participant)"/>
                        </div>
                      </div>
                      <div class="col-12 q-mt-sm" v-if="participant.vehicle !== null
                      && participant.vehicle?.laps !== null && participant.vehicle?.laps?.length > 0">
                        <div class="row items-center justify-start q-mt-sm"
                             v-for="lap in participant.vehicle?.laps" :key="lap.id">
                          <q-icon name="mdi-speedometer" size="md" class="col-auto"/>
                          <span class="col-auto text-body1">Runde: {{ lap.lap }}</span>
                          <span class="col-auto q-ml-md text-body1">Zeit: {{ getDurationFromMilliseconds(lap.duration) }}</span>
                          <span class="col-auto q-ml-md">Gestoppt von: {{ lap.user?.first_name + ' ' + lap.user?.last_name }}</span>
                          <delete-something-button text="Runde löschen" icon="mdi-delete"
                                                   @create-something-new="$emit('deleteLap', lap)"
                                                   v-if="canManageRaceParticipants" class="col-auto q-ml-lg"/>
                        </div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </q-list>
          </q-card-section>
        </q-slide-transition>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import IRaceParticipant from 'src/misc/interfaces/Race/IRaceParticipant'
import EditSomethingButton from 'components/general/buttons/EditSomethingButton.vue'
import { date, useQuasar } from 'quasar'
import DeleteSomethingButton from 'components/general/buttons/DeleteSomethingButton.vue'

const visible = ref<boolean>(true)
const selectedParticipant = ref<IRaceParticipant|undefined>(undefined)
const selectedParticipants = ref<IRaceParticipant[]>([])
const $q = useQuasar()
const massSelectToggle = ref<boolean>(false)

defineProps({
  companyId: {
    type: Number,
    required: true
  },
  raceId: {
    type: Number,
    required: true
  },
  canManageRaceParticipants: {
    type: Boolean,
    required: true,
    default: false
  },
  raceParticipants: {
    type: Array as () => IRaceParticipant[],
    required: true,
    default: [] as IRaceParticipant[]
  }
})

const emit = defineEmits(['backToRaceSelection1', 'participantUpdated', 'deleteLap', 'disqualifyToggleParticipant', 'massSelectAdd', 'massSelectRemove', 'massStateChanged'])

function minimizeWindow () {
  visible.value = false
}
function maximizeWindow () {
  visible.value = true
}
function setSelectParticipant (participant: IRaceParticipant | undefined) {
  if (participant === undefined) return
  selectedParticipant.value = participant
  emit('participantUpdated', participant)
}
function updateParticipantMassSelect (participant: IRaceParticipant | undefined) {
  if (participant === undefined) return
  // check if the participant is already in the selectedParticipants array
  const index = selectedParticipants.value.findIndex((part) => part.id === participant.id)
  if (index === -1) {
    selectedParticipants.value.push(participant)
    emit('massSelectAdd', participant)
  } else {
    selectedParticipants.value.splice(index, 1)
    emit('massSelectRemove', participant)
  }
}
function setParticipantMassSelectState (participant: IRaceParticipant | undefined) {
  if (participant === undefined) return
  // check if the participant is in the selectedParticipants array
  const index = selectedParticipants.value.findIndex((part) => part.id === participant.id)
  return index !== -1
}
function releaseSelectedParticipant () {
  if (selectedParticipant.value === undefined) return
  selectedParticipant.value = undefined
  emit('participantUpdated', undefined)
}
function getDurationFromMilliseconds (milliseconds: number): string {
  if (milliseconds === undefined) return '00:00:00.000'
  const currDate = new Date()
  currDate.setHours(0)
  currDate.setMinutes(0)
  currDate.setSeconds(0)
  currDate.setMilliseconds(milliseconds)
  return date.formatDate(currDate, 'HH:mm:ss.SSS')
}
function getParticipantDetails (participant: IRaceParticipant): string {
  if (participant === undefined) return 'kein Teilnehmer gefunden...'
  let returnDetails = ''
  // user or person
  if (participant.user !== null && participant.user !== undefined) {
    returnDetails += participant.user?.first_name + ' ' + participant.user?.last_name
  }
  if (participant.person !== null && participant.person !== undefined) {
    returnDetails += participant.person?.first_name + ' ' + participant.person?.last_name
  }
  // vehicle with license plate, name and details
  if (participant.vehicle !== null && participant.vehicle !== undefined) {
    returnDetails += ' ('
    if (participant.vehicle?.details !== undefined) {
      returnDetails += participant.vehicle?.details + ' '
    }
    if (participant.vehicle?.company_car !== null && participant.vehicle?.company_car !== undefined) {
      returnDetails += participant.vehicle?.company_car?.vehicle?.vehicle?.name
      returnDetails += ' ' + participant.vehicle?.company_car?.license_plate
    }
    returnDetails += ')'
  }
  // show laps
  if (participant.race !== null && participant.race !== undefined) {
    returnDetails += ' |> Runde: ' + participant.lap + '/' + participant.race?.laps
    if (participant.lap === participant.race?.laps || participant.finished) {
      returnDetails += ' (Fertig)'
    }
  }
  if (participant.disqualified) {
    returnDetails += ' (Disqualifiziert)'
  }
  return returnDetails
}
function toggleUserDisqualificationDialog (disqualified: boolean, participant?: IRaceParticipant) {
  if (participant === undefined) return
  $q.dialog({
    title: !disqualified ? 'Teilnehmer wieder freigeben' : 'Teilnehmer disqualifizieren',
    message: !disqualified ? 'Soll der Teilnehmer wieder freigegeben werden?' : 'Soll der Teilnehmer wirklich disqualifiziert werden?',
    persistent: true,
    ok: {
      label: 'Ja',
      color: 'positive',
      unelevated: true
    },
    cancel: {
      label: 'Nein',
      color: 'negative',
      unelevated: true
    }
  }).onOk(() => {
    toggleUserDisqualification(disqualified, participant)
  })
}
function toggleUserDisqualification (disq: boolean, part?: IRaceParticipant) {
  if (part === undefined) return
  emit('disqualifyToggleParticipant', { disqualified: disq, participant: part })
}
</script>

<style scoped>

</style>
