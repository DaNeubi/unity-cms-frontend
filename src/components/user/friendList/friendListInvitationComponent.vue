<template>
  <q-list bordered separator>
    <q-item v-for="invite in invites" :key="invite.id + 'invite'">
      <q-item-section avatar>
        <div class="row q-gutter-md items-center">
          <q-btn outline rounded label="Annehmen" color="positive" icon="mdi-check" @click="acceptInvite(invite.id)"/>
          <q-btn outline rounded label="Ablehnen" color="negative" icon="mdi-close" @click="declineInvite(invite.id)"/>
        </div>
      </q-item-section>
      <q-item-section>
        <div class="row items-center">
          Du wurdest von
          <q-chip :label="invite?.invited_by?.first_name + ' ' + invite?.invited_by?.last_name" color="accent"/>
          in die Freundesliste
          <q-chip :label="invite?.friend_list?.name" color="teal"/>
          als
          <q-chip :label="invite.type === 0 ? 'Mitglied' : 'Moderator'" color="secondary"/>
          am {{ FormatDateTime(invite.created_at) }} eingeladen.
        </div>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import IUserFriendListInvite from 'src/misc/interfaces/UserFriendList/IUserFriendListInvite'
import { api } from 'boot/axios'
import FormatDateTime from '../../../misc/functions/FormatDateTime'

const invites = ref<IUserFriendListInvite[]>()

onMounted(() => {
  getInvites()
})

const emits = defineEmits(['accepted-invite', 'declined-invite'])

function getInvites () {
  api.get('/api/friendList/invites')
    .then((res) => {
      invites.value = res.data
    })
    .catch((err) => {
      console.error(err)
    })
}
function acceptInvite (inviteId: number) {
  api.post('/api/friendList/acceptInvite', {
    invite_id: inviteId
  })
    .then(() => {
      // remove the invite from the list
      invites.value = invites.value.filter((invite) => invite.id !== inviteId)
      emits('accepted-invite')
    })
    .catch((err) => {
      console.error(err)
    })
}
function declineInvite (inviteId: number) {
  api.post('/api/friendList/declineInvite', {
    invite_id: inviteId
  })
    .then(() => {
      // remove the invite from the list
      invites.value = invites.value.filter((invite) => invite.id !== inviteId)
      emits('declined-invite')
    })
    .catch((err) => {
      console.error(err)
    })
}
</script>

<style scoped>

</style>
