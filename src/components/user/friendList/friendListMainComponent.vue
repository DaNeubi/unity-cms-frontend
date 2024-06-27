<template>
  <q-tabs v-model="tab" inline-label align="left" active-color="secondary" stretch>
    <q-tab name="newFriendList" label="Neue Freundesliste" icon="mdi-account-multiple-plus"/>
    <q-tab name="invites" label="Einladungen" icon="mdi-account-details"/>
    <q-tab :name="friendList.name.replace(' ', '').toLowerCase()"
           v-for="friendList in basicFriendLists" :key="friendList.id" :icon="getIcon(friendList)"
           :content-class="getColor(friendList)">
      {{ friendList.name }}
    </q-tab>
  </q-tabs>
  <q-tab-panels v-model="tab">
    <q-tab-panel name="newFriendList">
      <friend-list-creation-component @create-friend-list="createNewFriendList"/>
    </q-tab-panel>
    <q-tab-panel :name="friendList.name.replace(' ', '').toLowerCase()"
                 v-for="friendList in basicFriendLists" :key="friendList.id">
      <friend-list-content-component :friend-list-id="friendList.id" :user-id="userStore.userId"/>
    </q-tab-panel>
    <q-tab-panel name="invites">
      <friend-list-invitation-component @accepted-invite="refreshFriendListsOnAcceptedInvite"/>
    </q-tab-panel>
  </q-tab-panels>
</template>

<script setup lang="ts">

import { onMounted, ref } from 'vue'
import FriendListCreationComponent from 'components/user/friendList/friendListCreationComponent.vue'
import { api } from 'boot/axios'
import IUserFriendList from 'src/misc/interfaces/UserFriendList/IUserFriendList'
import FriendListContentComponent from 'components/user/friendList/friendListContentComponent.vue'
import { useUserStore } from 'stores/useUserStore'
import IUserFriendListModerator from 'src/misc/interfaces/UserFriendList/IUserFriendListModerator'
import FriendListInvitationComponent from 'components/user/friendList/friendListInvitationComponent.vue'

const tab = ref('newFriendList')
const userStore = useUserStore()
const basicFriendLists = ref<IUserFriendList[]>([])

onMounted(() => {
  getAvailableFriendLists()
})

function createNewFriendList (props: { friendListName: string, friendListVehicleSharing: boolean }) {
  if (props.friendListName.length === 0) return
  api.post('/api/friendList/create', {
    name: props.friendListName,
    vehicles_enabled: props.friendListVehicleSharing
  })
    .then((res) => {
      basicFriendLists.value.push(res.data)
    })
    .catch((err) => {
      console.error(err)
    })
}
function getAvailableFriendLists () {
  api.get('/api/friendList/all')
    .then((res) => {
      basicFriendLists.value = res.data
    })
    .catch((err) => {
      console.error(err)
    })
}
function getIcon (friendList: IUserFriendList) {
  if (checkIfOwner(friendList)) return 'mdi-account-star'
  if (checkIfModerator(friendList)) return 'mdi-account-tie'
  return 'mdi-account'
}
function getColor (friendList: IUserFriendList) {
  if (checkIfOwner(friendList)) return 'text-warning'
  if (checkIfModerator(friendList)) return 'text-positive'
  return ''
}
function checkIfOwner (friendList: IUserFriendList) {
  return friendList.user_id === userStore.userId
}
function checkIfModerator (friendList: IUserFriendList) {
  return friendList.moderators?.some((moderator: IUserFriendListModerator) => moderator.user_id === userStore.userId)
}
function refreshFriendListsOnAcceptedInvite () {
  getAvailableFriendLists()
}
</script>

<style scoped>

</style>
