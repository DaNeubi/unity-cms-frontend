<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h5">
        Letzte Seite Speichern
      </div>
      <div class="hint-text">
        Wir speichern lediglich den Pfad der von dir zuletzt besuchten Seite, falls du diese Einstellung aktivierst.🚗
      </div>
    </q-card-section>
    <q-separator/>
    <q-card-section>
      <div class="column">
        <q-toggle v-model="generalAvailable" color="positive" keep-color checked-icon="mdi-check"
                  unchecked-icon="mdi-close" :true-value="1" :false-value="0"
                  @update:modelValue="disableAllOnUnselect()"
                  :label="`${ generalAvailable ? 'Speichern aktiv' : 'Letzte Seite wird NICHT gespeichert' }`"/>
        <div class="row">
          <q-toggle v-model="intermediateUserSettings.last_route_save_web" label="Website" color="teal-5" keep-color
                    checked-icon="mdi-application-outline" unchecked-icon="mdi-hat-fedora" :true-value="1"
                    :false-value="0" :disable="!generalAvailable"/>
          <q-toggle v-model="intermediateUserSettings.last_route_save_tablet" label="Tablet" color="teal-5" keep-color
                    checked-icon="mdi-tablet" unchecked-icon="mdi-hat-fedora" :true-value="1"
                    :false-value="0" :disable="!generalAvailable"/>
          <div class="col-12"></div>
          <create-something-new-button text="Speichern" @click="updateLastRouteSettings" class="q-mt-sm"
                                       icon="mdi-content-save" color="positive" rounded/>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { PropType, ref } from 'vue'
import IUserSetting from 'src/misc/interfaces/User/IUserSetting'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'

const props = defineProps({
  userId: {
    type: Number,
    required: true
  },
  userSettings: {
    type: Object as PropType<IUserSetting>,
    required: true
  }
})

const emits = defineEmits(['updateUserSettings'])
const generalAvailable = ref<number>(props.userSettings?.last_route_save_tablet ? 1 : props.userSettings?.last_route_save_web ?? 0)
const intermediateUserSettings = ref<IUserSetting>(JSON.parse(JSON.stringify(props.userSettings)) as IUserSetting)

function disableAllOnUnselect () {
  if (!generalAvailable.value) {
    intermediateUserSettings.value.last_route_save_web = 0
    intermediateUserSettings.value.last_route_save_tablet = 0
  }
}
function updateLastRouteSettings () {
  emits('updateUserSettings', intermediateUserSettings.value)
}

</script>

<style scoped>

</style>
