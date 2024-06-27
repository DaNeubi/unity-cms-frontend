<template>
  <div class="column q-gutter-md" v-if="userSettings !== undefined">
    <user-settings-last-route-component :user-id="userId" :user-settings="userSettings"
                                        @update-user-settings="updateUserSettings"/>
  </div>
  <q-skeleton v-else/>
</template>

<script setup lang="ts">

import { useUserStore } from 'stores/useUserStore'
import { computed, onMounted, ref } from 'vue'
import UserSettingsLastRouteComponent from 'components/user/userSettings/userSettingsLastRouteComponent.vue'
import { api } from 'boot/axios'
import IUserSetting from '../../../misc/interfaces/User/IUserSetting'
import { lastPageHistoryStore } from 'stores/lastPageStore'

const userStore = useUserStore()
const userId = computed(() => userStore.userId)
const userSettings = ref<IUserSetting>()
const lastPageStore = lastPageHistoryStore()

onMounted(() => {
  getUserSettings()
})

function getUserSettings () {
  api.get('/api/userSettings/settings')
    .then((response) => {
      userSettings.value = response.data
    })
    .catch((error) => {
      console.error(error)
    })
}
function updateUserSettings (updatedUserSettings: IUserSetting) {
  userSettings.value = updatedUserSettings
  // check if the current device permission changed for the last page
  if (userStore.currentLoggedOnDevice === 'web') {
    lastPageStore.routeLoggingEnabled = userSettings.value?.last_route_save_web === 1
  }
  if (userStore.currentLoggedOnDevice === 'tablet') {
    lastPageStore.routeLoggingEnabled = userSettings.value?.last_route_save_tablet === 1
  }
  api.patch('/api/userSettings/updateSettings', userSettings.value)
    .catch((error) => {
      console.error(error)
    })
}
</script>

<style scoped>

</style>
