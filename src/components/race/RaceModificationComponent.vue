<template>
  <div class="row">
    <q-tabs inline-label v-model="tabs" align="left" class="col-12">
      <q-tab name="AllgemeineInfos" icon="mdi-flag-checkered" label="Allgemeine Infos"/>
      <q-tab name="Fahrzeuge" icon="mdi-car-sports" label="Fahrzeuge" v-if="canManageRaceVehicles"/>
      <q-tab name="Teilnehmer" icon="mdi-account-multiple" label="Teilnehmer" v-if="canManageRaceParticipants"/>
    </q-tabs>
    <q-separator class="full-width"/>
    <q-tab-panels v-model="tabs" class="col-12">
      <q-tab-panel name="AllgemeineInfos">
        <div class="row">
          <div class="col-9">
            <div class="row q-gutter-md">
              <q-input v-model="intermediateRace.name" label="Name" class="col-10" outlined maxlength="128" counter/>
              <q-space class="col-1"/>
              <q-input v-model="intermediateRace.location" label="Ort" class="col-10" outlined maxlength="128" counter/>
              <q-space class="col-1"/>
              <q-checkbox v-model="intermediateRace.public" :true-value="1" :false-value="0"
                          :label="`Für User sichtbar? ${ intermediateRace.public === 1 ? 'Ja' : 'Nein' }`"
                          class="col-xs-1 col-sm-1 col-md-2 col-lg-2 col-xl-2">
                <q-tooltip>
                  Wenn das an ist, können andere Leute im CMS das Rennen als aktiv sehen und die Teilnehmer sowie die Fahrzeuge einsehen.
                </q-tooltip>
              </q-checkbox>
              <q-space class="col-xs-10 col-sm-10 col-md-9 col-lg-10 col-xl-10"/>
              <q-input v-model.number="intermediateRace.laps" label="Runden" type="number" :min="0" class="col-4"
                       hint="Anzahl der Runden die Gefahren werden muss" outlined/>
              <q-input v-model.number="intermediateRace.participants" type="number" :min="0"
                       hint="Maximale Teilnehmer Anzahl" label="Teilnehmer Limit" class="col-4" outlined/>
            </div>
          </div>
          <div class="col-3">
            <q-date v-model="intermediateRace.date" subtitle="Datum des Rennens" class="col-3" landscape
                    mask="YYYY-MM-DD" format="YYYY-MM-DD"/>
          </div>
        </div>
      </q-tab-panel>
      <q-tab-panel name="Fahrzeuge" v-if="canManageRaceVehicles">
        <div class="row q-gutter-md">
          <create-something-new-button text="Fahrzeug hinzufügen" class="col-2"
                                       @create-something-new="addSelectedCompanyCar"/>
          <q-select class="col-9" outlined v-model="selectedCompanyCar" @filter="lazyLoadCompanyCars" clearable
                    :options="availableOptionsCompanyCars" label="Fahrzeug" use-input input-debounce="50"
                    :option-label="opt => opt.vehicle?.vehicle?.name + ' | ' + opt.license_plate"/>
          <q-separator class="full-width"/>
          <div class="col-12">
            <div class="row q-gutter-sm items-center" v-for="raceCar in intermediateRace.race_vehicles" :key="raceCar.id">
              <q-icon name="mdi-car-emergency" class="col-auto" size="md" color="accent" v-if="raceCar.safety_car">
                <q-tooltip>Safety Car</q-tooltip>
              </q-icon>
              <div class="col-auto">
                <q-icon name="mdi-car-sports" class="col-auto" size="md" color="secondary"/>
                {{ raceCar.company_car?.vehicle?.vehicle?.name }} |
                <q-icon name="mdi-card-text-outline" size="md" color="secondary"><q-tooltip>Kennzeichen</q-tooltip></q-icon>
                {{ raceCar.company_car?.license_plate }}
              </div>
              <q-separator vertical/>
              <q-input outlined v-model="raceCar.details" dense label="Hinweis zum Fahrzeug" class="col-sm-3"
                       counter maxlength="128"/>
              <q-separator vertical/>
              <q-checkbox v-model="raceCar.safety_car" :true-value="1" :false-value="0"
                          label="Ist das Fahrzeug ein Safety Car?"/>
              <q-separator vertical/>
              <delete-something-button text="Entfernen" class="col-auto" icon="mdi-car-off"
                                       @create-something-new="removeCarFromList(raceCar)"/>
              <q-separator vertical class="q-mr-sm"/>
              <div class="col-auto">
                <q-chip color="accent" icon="mdi-account" :ripple="false"
                        v-if="returnParticipantForRaceVehicle(raceCar) !== undefined">
                  {{ returnParticipantForRaceVehicle(raceCar) }}
                </q-chip>
              </div>
            </div>
          </div>
        </div>
      </q-tab-panel>
      <q-tab-panel name="Teilnehmer" v-if="canManageRaceParticipants">
        <div class="row q-gutter-md">
          <create-something-new-button text="Teilnehmer hinzufügen" class="col-2"
                                       @create-something-new="addSelectedPerson()"/>
          <q-select class="col-9" outlined v-model="selectedPerson" @filter="lazyLoadPersons" clearable
                    :options="availableOptionsPersons" label="Teilnehmer" use-input input-debounce="50"
                    :option-label="opt => opt.first_name + ' ' + opt.last_name"/>
          <q-separator class="full-width"/>
          <div class="col-12">
            <div class="row items-center q-mt-sm"
                 v-for="raceParticipant in intermediateRace.race_participants" :key="raceParticipant.id">
              <div class="col-3">
                {{ raceParticipant.person?.first_name }} {{ raceParticipant.person?.last_name }}
                {{ raceParticipant.user?.first_name }} {{ raceParticipant.user?.last_name }}
              </div>
              <q-separator vertical class="q-mr-sm"/>
              <q-select outlined v-model="raceParticipant.vehicle" label="Fahrzeug zuweisen" class="col-6"
                        :options="intermediateRace.race_vehicles" clearable
                        v-if="canManageRaceVehicles"
                        :option-label="option => option.company_car.license_plate + ' | ' + option.company_car?.vehicle?.vehicle?.name + ` | Safety Car: ${ option.safety_car ? 'Ja' : 'Nein' }`"/>
              <div class="col-auto" v-else>
                {{ raceParticipant?.vehicle?.company_car?.license_plate }} |
                {{ raceParticipant?.vehicle?.company_car?.vehicle?.vehicle?.name }}
              </div>
              <div class="col-auto q-ml-md">
                <delete-something-button text="Entfernen" class="col-auto" icon="mdi-account-off"
                                         @create-something-new="removeParticipantFromList(raceParticipant)"/>
              </div>
            </div>
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>
    <div class="row q-mt-xs q-gutter-md">
      <create-something-new-button text="Speichern" class="col-auto" :disable="saveButtonDisabled"
                                   @create-something-new="handleSaveButton" icon="mdi-content-save"/>
      <delete-something-button text="Abbrechen" class="col-auto" icon="mdi-close-outline"
                               @create-something-new="$emit('cancel')"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, PropType, ref } from 'vue'
import IRace from 'src/misc/interfaces/Race/IRace'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import DeleteSomethingButton from 'components/general/buttons/DeleteSomethingButton.vue'
import ICompanyCar from 'src/misc/interfaces/CompanyCar/ICompanyCar'
import IRaceVehicle from 'src/misc/interfaces/Race/IRaceVehicle'
import { api } from 'boot/axios'
import IPerson from 'src/misc/interfaces/Person/IPerson'
import IRaceParticipant from 'src/misc/interfaces/Race/IRaceParticipant'

const tabs = ref('AllgemeineInfos')
const props = defineProps({
  companyId: {
    type: Number,
    required: true
  },
  race: {
    type: Object as PropType<IRace | undefined>,
    required: true
  },
  canManageRaceVehicles: {
    type: Boolean,
    required: false,
    default: false
  },
  canManageRaceParticipants: {
    type: Boolean,
    required: false,
    default: false
  }
})
defineEmits(['cancel', 'success-save'])
defineExpose({
  resetOnSuccess
})

onMounted(() => {
  loadRaceVehicles()
  loadPersons()
})

const intermediateRace = ref<IRace| undefined>(props.race ?? { public: 0, laps: 0, participants: 0 } as IRace)
const companyCars = ref<ICompanyCar[]>()
const availableOptionsCompanyCars = ref<ICompanyCar[]>()
const selectedCompanyCar = ref<ICompanyCar>()
const saveButtonDisabled = computed(() => {
  return intermediateRace.value?.name === undefined || intermediateRace.value?.name === '' ||
    intermediateRace.value?.location === undefined || intermediateRace.value?.location === '' ||
    intermediateRace.value?.date === undefined || intermediateRace.value?.date === '' ||
    intermediateRace.value?.laps === undefined || intermediateRace.value?.laps < 0 ||
    intermediateRace.value?.date === undefined || intermediateRace.value?.date === '' ||
    intermediateRace.value?.public === undefined || intermediateRace.value?.participants === undefined ||
    intermediateRace.value?.participants < 0
})
const selectableCompanyCars = computed(() => {
  if (companyCars.value === undefined) return []
  // return only companyCars that are not set as a raceVehicle in the intermediateRace
  return companyCars.value?.filter((v: ICompanyCar) => intermediateRace.value?.race_vehicles?.find((rv: IRaceVehicle) => rv.company_car_id === v.id) === undefined)
})
const persons = ref<IPerson[]>()
const availableOptionsPersons = ref<IPerson[]>()
const selectedPerson = ref<IPerson>()
const selectablePersons = computed(() => {
  if (persons.value === undefined) return []
  // return only persons that are not set as a raceParticipant in the intermediateRace
  return persons.value?.filter((v: IPerson) => intermediateRace.value?.race_participants?.find((rp: IRaceParticipant) => rp.person_id === v.id || rp.user_id === v.id) === undefined)
})

function lazyLoadCompanyCars (val: string, update: (val: () => void) => void) {
  if (!props.canManageRaceVehicles) return
  if (companyCars.value !== undefined) {
    update(() => {
      const needle = val.toLowerCase()
      availableOptionsCompanyCars.value = selectableCompanyCars.value?.filter((v: ICompanyCar) => (v.license_plate + v.vehicle?.vehicle?.name).toLowerCase().indexOf(needle) > -1)
    })
    return
  }
  if (props.companyId <= 0) return
  api.get('/api/companyCars/reduced/' + props.companyId)
    .then((res) => {
      companyCars.value = res.data.companyCars
      availableOptionsCompanyCars.value = res.data.companyCars
      const needle = val.toLowerCase()
      availableOptionsCompanyCars.value = selectableCompanyCars.value?.filter((v: ICompanyCar) => (v.license_plate + v.vehicle?.vehicle?.name).toLowerCase().indexOf(needle) > -1)
    })
    .catch((err) => {
      console.error(err)
    })
}

function lazyLoadPersons (val: string, update: (val: () => void) => void) {
  if (!props.canManageRaceParticipants) return
  if (persons.value !== undefined) {
    update(() => {
      const needle = val.toLowerCase()
      availableOptionsPersons.value = selectablePersons.value?.filter((v: IPerson) => (v.first_name ??= '' + v.last_name).toLowerCase().indexOf(needle) > -1)
    })
  }
  if (props.companyId <= 0) return
  api.get('/api/person/forRace/' + props.companyId)
    .then((res) => {
      persons.value = res.data
      availableOptionsPersons.value = res.data
      const needle = val.toLowerCase()
      availableOptionsPersons.value = selectablePersons.value?.filter((v: IPerson) => (v.first_name ??= '' + v.last_name).toLowerCase().indexOf(needle) > -1)
    })
    .catch((err) => {
      console.error(err)
    })
}

function addSelectedCompanyCar () {
  if (selectedCompanyCar.value === undefined) return
  if (intermediateRace.value === undefined) return
  if (intermediateRace.value?.race_vehicles === undefined) intermediateRace.value.race_vehicles = []
  const raceVehicle = {
    id: Math.random() - 100,
    details: '',
    safety_car: 0,
    company_car_id: selectedCompanyCar.value?.id,
    company_car: selectedCompanyCar.value,
    race_participant_id: 0,
    race_id: intermediateRace.value?.id ?? 0
  } as IRaceVehicle
  intermediateRace.value?.race_vehicles.push(raceVehicle)
  // remove the selected company car from the available options
  availableOptionsCompanyCars.value = availableOptionsCompanyCars.value?.filter((v: ICompanyCar) => v.id !== selectedCompanyCar.value?.id)
  selectedCompanyCar.value = undefined
}

function addSelectedPerson () {
  if (selectedPerson.value === undefined) return
  if (intermediateRace.value === undefined) return
  if (intermediateRace.value?.race_participants === undefined) intermediateRace.value.race_participants = []
  intermediateRace.value?.race_participants.push({
    id: Math.random() - 110,
    disqualified: 0,
    finished: 0,
    person_id: selectedPerson.value?.id,
    person: selectedPerson.value,
    user_id: selectedPerson.value?.user_id,
    user: selectedPerson.value?.user,
    lap: 0,
    race_id: intermediateRace.value?.id ?? 0
  })
  // remove the selected person from the available options
  availableOptionsPersons.value = availableOptionsPersons.value?.filter((v: IPerson) => v.id !== selectedPerson.value?.id)
  selectedPerson.value = undefined
}

function returnParticipantForRaceVehicle (vehicle: IRaceVehicle | undefined | null) {
  if (vehicle === null || undefined) return
  // check if any user is assigned to the raceVehicle
  const participant = intermediateRace.value?.race_participants?.find((v: IRaceParticipant) => v.vehicle !== null && v.vehicle !== undefined && v.vehicle.id === vehicle?.id)
  if (participant !== undefined) {
    // return the participant
    if (participant.person !== undefined) {
      return participant.person.first_name + ' ' + participant.person.last_name
    }
    // return the user
    if (participant.user !== undefined) {
      return participant.user.first_name + ' ' + participant.user.last_name
    }
  }
  return undefined
}

function removeCarFromList (raceCar: IRaceVehicle) {
  // only if company_car is set
  if (raceCar.company_car === undefined) return
  // remove the company car from the participants it's assigned to
  intermediateRace.value?.race_participants?.forEach((rp: IRaceParticipant) => {
    if (rp.vehicle === raceCar) {
      rp.vehicle = undefined
    }
  })
  // remove the race vehicle from the intermediateRace raceVehicles
  const index = intermediateRace.value?.race_vehicles?.indexOf(raceCar)
  if (index === undefined || index === -1) return
  intermediateRace.value?.race_vehicles?.splice(index, 1)
  availableOptionsCompanyCars.value?.push(raceCar.company_car as ICompanyCar)
}

function removeParticipantFromList (participant: IRaceParticipant) {
  // remove the race participant from the intermediateRace raceParticipants
  const index = intermediateRace.value?.race_participants?.indexOf(participant)
  if (index === undefined || index === -1) return
  intermediateRace.value?.race_participants?.splice(index, 1)
  availableOptionsPersons.value?.push(participant.person as IPerson)
}

function handleSaveButton () {
  if (intermediateRace.value?.id === undefined || intermediateRace.value?.id === 0) {
    // create new race
    createNewRace()
  } else {
    editRace()
  }
}

function createNewRace () {
  if (props.companyId === undefined || props.companyId <= 0) return
  api.post('/api/race/create/' + props.companyId, {
    ...intermediateRace.value
  }).catch((err) => {
    console.error(err)
  })
}

function editRace () {
  if (props.companyId === undefined || props.companyId <= 0) return
  api.patch('/api/race/edit/' + props.companyId, {
    ...intermediateRace.value
  }).catch((err) => {
    console.error(err)
  })
}

function resetOnSuccess () {
  intermediateRace.value = undefined
  selectedCompanyCar.value = undefined
}

function loadRaceVehicles () {
  if (!props.canManageRaceVehicles) return
  if (intermediateRace.value === undefined) return
  if (intermediateRace.value?.id === undefined || intermediateRace.value?.id < 1) return
  api.get('/api/race/raceVehicles/' + props.companyId + '?race=' + props.race?.id)
    .then((res) => {
      if (intermediateRace.value === undefined) return
      if (intermediateRace.value.race_vehicles === undefined) {
        intermediateRace.value.race_vehicles = [] as IRaceVehicle[]
      }
      intermediateRace.value.race_vehicles = res.data
    })
    .catch((err) => {
      console.error(err)
    })
}

function loadPersons () {
  if (!props.canManageRaceParticipants) return
  if (intermediateRace.value === undefined) return
  if (intermediateRace.value?.id === undefined || intermediateRace.value?.id < 1) return
  api.get('/api/race/raceParticipants/' + props.companyId + '?race=' + props.race?.id)
    .then((res) => {
      if (intermediateRace.value === undefined) return
      if (intermediateRace.value.race_participants === undefined) {
        intermediateRace.value.race_participants = [] as IRaceParticipant[]
      }
      intermediateRace.value.race_participants = res.data
    })
    .catch((err) => {
      console.error(err)
    })
}

</script>

<style scoped>

</style>
