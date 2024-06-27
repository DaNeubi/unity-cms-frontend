<template>
  <div class="col items-center">
    <div v-if="!loading">
      <div class="row q-mb-md q-gutter-md">
        <edit-something-button text="Bearbeiten" icon="mdi-pencil" @click="editMode = !editMode" v-if="canEdit"/>
        <div class="text-h6">
          Diese Freundesliste gehört: <u>{{ friendList?.user?.first_name }} {{ friendList?.user?.last_name }}</u>
        </div>
      </div>
      <div v-if="friendList !== undefined">
        <q-scroll-area style="height: 55vh;">
          <friend-list-content-edit-component v-if="editMode" :friend-list="friendList" @remove-member="removeMember"
                                              @remove-moderator="removeModerator"
                                              @add-invite="addInvite" @remove-invite="removeInvite"/>
          <friend-list-content-view-component v-else :friend-list="friendList" :can-edit="canEdit"
                                              @added-vehicle-to-share="addSharedVehicle" :user-id="userId"
                                              @removed-vehicle-to-share="removeSharedVehicle"/>
        </q-scroll-area>
      </div>
    </div>
    <div v-else>
      <q-skeleton/>
    </div>
  </div>
</template>

<script setup lang="ts">

import { api } from 'boot/axios'
import { computed, onMounted, ref } from 'vue'
import IUserFriendList from 'src/misc/interfaces/UserFriendList/IUserFriendList'
import FriendListContentViewComponent from 'components/user/friendList/friendListContentViewComponent.vue'
import FriendListContentEditComponent from 'components/user/friendList/friendListContentEditComponent.vue'
import EditSomethingButton from 'components/general/buttons/EditSomethingButton.vue'
import IUserFriendListVehicle from 'src/misc/interfaces/UserFriendList/IUserFriendListVehicle'
import IUserFriendListInvite from 'src/misc/interfaces/UserFriendList/IUserFriendListInvite'

const friendList = ref<IUserFriendList>()
const loading = ref<boolean>(false)
const editMode = ref<boolean>(false)

const canEdit = computed(() => {
  return friendList.value?.moderators?.some((moderator) => moderator.user_id === props.userId) ||
    friendList.value?.user_id === props.userId
})

const props = defineProps({
  friendListId: {
    type: Number,
    required: true
  },
  userId: {
    type: Number,
    required: true
  }
})

onMounted(() => {
  getFriendListDetails()
})

function getFriendListDetails () {
  loading.value = true
  api.get('/api/friendList/details?friend_list_id=' + props.friendListId)
    .then((res) => {
      friendList.value = res.data
      loading.value = false
    })
    .catch((err) => {
      loading.value = false
      console.error(err)
    })
}
function addSharedVehicle (sharedVehicle: IUserFriendListVehicle) {
  if (friendList.value === undefined) return
  if (friendList.value?.vehicles === undefined) {
    friendList.value.vehicles = []
  }
  friendList.value?.vehicles?.push(sharedVehicle)
}
function removeSharedVehicle (sharedVehicleId: number) {
  if (friendList.value === undefined) return
  if (friendList.value?.vehicles === undefined) return
  friendList.value.vehicles = friendList.value.vehicles.filter((vehicle) => vehicle.id !== sharedVehicleId)
}
function addInvite (newInvite: IUserFriendListInvite) {
  if (friendList.value === undefined) return
  if (friendList.value?.invites === undefined) {
    friendList.value.invites = []
  }
  friendList.value.invites.push(newInvite)
}
function removeInvite (inviteId: number) {
  if (friendList.value === undefined) return
  if (friendList.value?.invites === undefined) return
  friendList.value.invites = friendList.value.invites.filter((invite) => invite.id !== inviteId)
}
function removeModerator (moderatorId: number) {
  if (friendList.value === undefined) return
  if (friendList.value?.moderators === undefined) return
  const userId = friendList.value.moderators.find((moderator) => moderator.id === moderatorId)?.user_id
  friendList.value.moderators = friendList.value.moderators.filter((moderator) => moderator.id !== moderatorId)
  if (friendList.value?.vehicles === undefined || userId === undefined) return
  friendList.value.vehicles = friendList.value.vehicles.filter((vehicle) => vehicle.vehicle?.user_id !== userId)
}
function removeMember (memberId: number) {
  if (friendList.value === undefined) return
  if (friendList.value?.members === undefined) return
  const userId = friendList.value.members.find((member) => member.id === memberId)?.user_id
  friendList.value.members = friendList.value.members.filter((member) => member.id !== memberId)
  if (friendList.value?.vehicles === undefined || userId === undefined) return
  friendList.value.vehicles = friendList.value.vehicles.filter((vehicle) => vehicle.vehicle?.user_id !== userId)
}
</script>

<style scoped>

</style>
