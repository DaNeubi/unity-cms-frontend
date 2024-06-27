<template>
  <div class="column">
    <div class="row q-gutter-md">
      <q-expansion-item id="userFriendListModExpand" label="Moderatoren" icon="mdi-account-cowboy-hat" class="col-5">
        <q-card>
          <q-card-section>
            <q-list bordered separator v-if="friendList?.moderators !== null && (friendList?.moderators?.length ?? 0 > 0)">
              <q-item v-for="moderator in friendList?.moderators" :key="moderator.id">
                <q-item-section>
                  <q-item-label>
                    {{ moderator?.user?.first_name }} {{ moderator?.user?.last_name }}
                  </q-item-label>
                  <q-item-label caption>
                    Dabei seit: {{ FormatDateTime(moderator?.created_at) }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="text-body1">
              Keine Moderatoren zugewiesen
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>
      <q-expansion-item id="userFriendListMembersExpand" label="Mitglieder" icon="mdi-account-multiple" class="col-5">
        <q-card>
          <q-card-section>
            <q-list bordered separator v-if="friendList?.members !== null && (friendList?.members?.length ?? 0 > 0)">
              <q-item v-for="member in friendList?.members" :key="member.id">
                <q-item-section>
                  <q-item-label>
                    {{ member?.user?.first_name }} {{ member?.user?.last_name }}
                  </q-item-label>
                  <q-item-label caption>
                    Dabei seit: {{ FormatDateTime(member?.created_at) }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="text-body1">
              Keine Mitglieder zugewiesen
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </div>
    <div v-if="friendList?.vehicles_enabled" class="q-mt-md">
      <div class="text-h6">
        Geteilte Fahrzeuge ({{ friendList?.vehicles?.length ?? 0}})
      </div>
      <q-separator class="q-mb-md"/>
      <div class="row q-gutter-md" v-if="!loadingUserVehicles">
        <create-something-new-button text="Fahrzeug teilen" @create-something-new="shareVehicle()"/>
        <q-select :options="allAvailableUserVehicles" v-model="selectedUserVehicle" outlined class="col-4"
                  :option-label="opt => getVehicleNameString(opt)"/>
      </div>
      <q-skeleton v-else/>
      <q-list bordered separator v-if="friendList.vehicles !== undefined && friendList.vehicles.length > 0"
              class="q-mt-md">
        <q-expansion-item v-for="sharedVehicle in friendList?.vehicles" :key="sharedVehicle.id">
          <template v-slot:header>
            <q-item-section avatar>
              <q-avatar icon="mdi-car" color="secondary"/>
            </q-item-section>
            <q-item-section>
              <q-item-label>
                <div class="text-body1 text-bold">
                  {{ sharedVehicle.vehicle?.license_plate?.length ?? 0 > 0 ? sharedVehicle.vehicle?.license_plate : '(Kein Kennzeichen)' }}
                  - ({{ sharedVehicle.vehicle?.user?.first_name }} {{sharedVehicle.vehicle?.user?.last_name }})
                </div>
              </q-item-label>
              <q-item-label caption>
                <div>
                  {{ sharedVehicle.vehicle?.vehicle?.manufacturer?.name }} - {{ sharedVehicle.vehicle?.vehicle?.name }}
                  {{ sharedVehicle.vehicle?.vehicle?.fuel_type?.name }} <b>{{ checkIfAnyTuningSet(sharedVehicle.vehicle?.tuning as IUserVehicleTuning) ? '[LT]' : '' }}</b>
                </div>
              </q-item-label>
            </q-item-section>
          </template>
          <q-card>
            <q-card-section>
              <div class="column q-gutter-sm text-body1">
                <div>
                  Kennzeichen: <b>{{ sharedVehicle.vehicle?.license_plate?.length ?? 0 > 0 ? sharedVehicle.vehicle?.license_plate : '--' }}</b>
                </div>
                <div>
                  Parkort: <b>{{ sharedVehicle.vehicle?.parking_location?.length ?? 0 > 0 ? sharedVehicle.vehicle?.parking_location : 'Ich nix wissen🤔' }}</b>
                </div>
                <div>
                  Tuning: <b>{{ createTuningString(sharedVehicle.vehicle?.tuning as IUserVehicleTuning | null)}}</b>
                </div>
                <div>
                  Farben: <b>{{ createColorString(sharedVehicle?.vehicle?.colors as IUserVehicleColor[] | null) }}</b>
                </div>
                <div>
                  Hinzugefügt am: <b>{{ FormatDateTime(sharedVehicle.created_at) }}</b>
                </div>
                <div>
                  <q-btn outline label="Entfernen" color="negative" icon="mdi-engine-off-outline"
                         @click="removeSharedVehicle(sharedVehicle.user_vehicle_id, sharedVehicle.id)"
                         v-if="canEdit || sharedVehicle.vehicle?.user_id === userId"/>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </q-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, PropType, ref } from 'vue'
import IUserFriendList from 'src/misc/interfaces/UserFriendList/IUserFriendList'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import IUserVehicle from 'src/misc/interfaces/UserVehicle/IUserVehicle'
import { api } from 'boot/axios'
import IUserVehicleTuning from 'src/misc/interfaces/UserVehicle/IUserVehicleTuning'
import IUserVehicleColor from 'src/misc/interfaces/UserVehicle/IUserVehicleColor'
import FormatDateTime from '../../../misc/functions/FormatDateTime'

const allUserVehicles = ref<IUserVehicle[]>([])
const allAvailableUserVehicles = computed(() => {
  return allUserVehicles.value.filter((userVehicle: IUserVehicle) => {
    return !props.friendList?.vehicles?.some((sharedVehicle) => sharedVehicle.user_vehicle_id === userVehicle.id)
  })
})
const selectedUserVehicle = ref<IUserVehicle>()
const loadingUserVehicles = ref<boolean>(false)

const props = defineProps({
  friendList: {
    type: Object as PropType<IUserFriendList>,
    required: true
  },
  canEdit: {
    type: Boolean,
    required: true,
    default: false
  },
  userId: {
    type: Number,
    required: true
  }
})

const emits = defineEmits(['added-vehicle-to-share', 'removed-vehicle-to-share'])

onMounted(() => {
  getUserVehicles()
})

function getUserVehicles () {
  loadingUserVehicles.value = true
  api.get('/api/userVehicle/all')
    .then((res) => {
      allUserVehicles.value = res.data
      loadingUserVehicles.value = false
    })
    .catch((err) => {
      console.error(err)
    })
}
function getVehicleNameString (vehicle: IUserVehicle) {
  let vehicleName = vehicle?.vehicle?.name
  if (vehicle.license_plate === null) {
    vehicleName += ' (--)'
  } else {
    vehicleName += ' (' + vehicle.license_plate + ')'
  }
  return vehicleName
}
function shareVehicle () {
  if (selectedUserVehicle.value === null || selectedUserVehicle.value === undefined) return
  api.post('/api/friendList/shareVehicle', {
    friend_list_id: props.friendList?.id,
    user_vehicle_id: selectedUserVehicle.value?.id
  })
    .then((res) => {
      selectedUserVehicle.value = undefined
      emits('added-vehicle-to-share', res.data)
    })
    .catch((err) => {
      console.error(err)
    })
}
function removeSharedVehicle (userVehicleId: number, sharedVehicleId: number) {
  api.post('/api/friendList/removeSharedVehicle', {
    friend_list_id: props.friendList?.id,
    user_vehicle_id: userVehicleId
  })
    .then(() => {
      emits('removed-vehicle-to-share', sharedVehicleId)
    })
    .catch((err) => {
      console.error(err)
    })
}
function checkIfAnyTuningSet (tuning: IUserVehicleTuning | null) {
  if (tuning === null || tuning === undefined || tuning.id === -1) {
    return false
  }
  return tuning.engine_tuning || tuning.transmission_tuning || tuning.turbo_tuning || tuning.brake_tuning
}
function createTuningString (tuning?: IUserVehicleTuning | null) {
  if (tuning === null || tuning === undefined || tuning.id === -1) {
    return 'Kein Tuning'
  }
  let tuningString = ''
  if (tuning.engine_tuning) {
    tuningString += 'Motor-Tuning'
  }
  if (tuning.transmission_tuning) {
    if (tuningString.length > 0) {
      tuningString += ', '
    }
    tuningString += 'Getriebe-Tuning'
  }
  if (tuning.turbo_tuning) {
    if (tuningString.length > 0) {
      tuningString += ', '
    }
    tuningString += 'Turbo-Tuning'
  }
  if (tuning.brake_tuning) {
    if (tuningString.length > 0) {
      tuningString += ', '
    }
    tuningString += 'Bremsen-Tuning'
  }
  if (tuningString.length === 0) {
    tuningString = 'Kein Tuning'
  }
  return tuningString
}
function createColorString (colors?: IUserVehicleColor[] | null) {
  if (colors === null || colors === undefined || colors.length === 0) return 'Keine Farben'
  let colorString = ''
  colors.forEach((color: IUserVehicleColor, i: number) => {
    if (i > 0 && i < colors.length) {
      colorString += ', '
    }
    colorString += color.name + ': ' + color.hexa_color
  })
  return colorString
}
</script>

<style scoped>

</style>
