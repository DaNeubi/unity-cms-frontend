<template>
  <q-scroll-area style="height: 55vh;">
    <div class="column">
      <q-card flat bordered>
        <q-card-section horizontal>
          <q-card-section class="q-pt-xs">
            <div class="text-body2"><b>Moderatoren verwalten</b></div>
          </q-card-section>
        </q-card-section>
        <q-card-section class="q-pt-sm q-pb-xs">
          <div class="row q-gutter-md">
            <q-btn label="Moderator Einladung verschicken" color="positive" icon="mdi-mailbox-outline"
                   class="col-auto" :disable="invitationEmail.length === 0"
                   @click="createInvite(1)"/>
            <q-input outlined label="U-Mail Adresse" v-model="invitationEmail" dense class="col-md-3" color="secondary"/>
          </div>
        </q-card-section>
        <q-card-section class="q-mt-none">
          <div class="column" v-if="friendList?.moderators !== null && (friendList.moderators?.length ?? 0 > 0)">
            <div class="row items-center text-body1 q-gutter-sm" v-for="moderator in friendList?.moderators" :key="moderator.id + 'mod'">
              <div>{{ moderator.user?.first_name }} {{ moderator.user?.last_name }}:</div>
              <div>(Dabei seit: {{ FormatDateTime(moderator.created_at) }})</div>
              <delete-something-button outline text="Entfernen" @create-something-new="removeModerator(moderator.id)"/>
            </div>
          </div>
          <div v-else class="text-body2">
            Keine Moderatoren zugewiesen
          </div>
        </q-card-section>
      </q-card>
      <q-space class="q-mt-xs q-mb-xs"/>
      <q-card flat bordered>
        <q-card-section horizontal>
          <q-card-section class="q-pt-xs">
            <div class="text-body2"><b>Mitglieder verwalten</b></div>
          </q-card-section>
        </q-card-section>
        <q-card-section class="q-pt-sm q-pb-xs">
          <div class="row q-gutter-md">
            <q-btn label="Mitglieds Einladung verschicken" color="positive" icon="mdi-mailbox-outline"
                   class="col-auto" :disable="invitationEmail.length === 0"
                   @click="createInvite(0)"/>
            <q-input outlined label="U-Mail Adresse" v-model="invitationEmail" dense class="col-md-3" color="secondary"/>
          </div>
        </q-card-section>
        <q-card-section class="q-mt-none">
          <div class="column" v-if="friendList?.members !== null && (friendList.members?.length ?? 0 > 0)">
            <div class="row items-center text-body1 q-gutter-sm" v-for="member in friendList?.members" :key="member.id + 'member'">
              <div>{{ member.user?.first_name }} {{ member.user?.last_name }}</div>
              <div>(Dabei seit: {{ FormatDateTime(member.created_at) }})</div>
              <delete-something-button outline text="Entfernen" @create-something-new="removeMember(member.id)"/>
            </div>
          </div>
          <div v-else class="text-body2">
            Keine Mitglieder zugewiesen
          </div>
        </q-card-section>
      </q-card>
      <q-space class="q-mt-xs q-mb-xs"/>
      <q-card flat bordered>
        <q-card-section>
          <q-scroll-area style="height: 15vh;"
                         v-if="friendList?.invites !== null && (friendList?.invites?.length ?? 0 > 0)">
            <div v-for="invite in friendList?.invites" :key="invite.id + 'inv'">
              <div class="row q-gutter-md items-center">
                <div>
                  <q-chip :label="invite?.user?.first_name + ' ' + invite?.user?.last_name" color="primary"/>
                  wurde von
                  <q-chip :label="invite?.invited_by?.first_name + ' ' + invite?.invited_by?.last_name" color="accent"/>
                  als
                  <q-chip :label="invite.type === 0 ? 'Mitglied' : 'Moderator'" color="secondary"/>
                  am {{ FormatDateTime(invite.created_at) }} eingeladen.
                  Aktueller Status:
                  <q-chip :label="InvitationStatus[invite.status]"
                          :color="invite.status === 0 ? 'warning' : invite.status === 1 ? 'positive' : 'negative'"/>
                </div>
                <q-btn label="Zurückziehen" color="warning" outline rounded @click="revokeInvite(invite.id)" :disable="invite.status >= 1"/>
              </div>
            </div>
          </q-scroll-area>
        </q-card-section>
      </q-card>
    </div>
  </q-scroll-area>
</template>

<script setup lang="ts">
import { PropType, ref } from 'vue'
import IUserFriendList from 'src/misc/interfaces/UserFriendList/IUserFriendList'
import { api } from 'boot/axios'
import FormatDateTime from '../../../misc/functions/FormatDateTime'
import InvitationStatus from 'src/misc/Enums/UserFriendList/UserFriendListInviteStatus'
import DeleteSomethingButton from 'components/general/buttons/DeleteSomethingButton.vue'

const props = defineProps({
  friendList: {
    type: Object as PropType<IUserFriendList>,
    required: true
  }
})

const emits = defineEmits(['remove-invite', 'add-invite', 'remove-moderator', 'remove-member'])
const invitationEmail = ref<string>('')

function createInvite (invitationType: number) {
  api.post('/api/friendList/createInvite', {
    friend_list_id: props.friendList.id,
    umail: invitationEmail.value,
    type: invitationType
  })
    .then((res) => {
      invitationEmail.value = ''
      emits('add-invite', res.data)
    })
    .catch((err) => {
      console.error(err)
    })
}
function revokeInvite (invitationNumber: number) {
  api.post('/api/friendList/revokeInvite', {
    invite_id: invitationNumber
  })
    .then(() => {
      emits('remove-invite', invitationNumber)
    })
    .catch((err) => {
      console.error(err)
    })
}
function removeModerator (modId: number) {
  api.post('/api/friendList/deleteModerator', {
    friend_list_id: props.friendList.id,
    moderator_id: modId
  })
    .then(() => {
      emits('remove-moderator', modId)
    })
    .catch((err) => {
      console.error(err)
    })
}
function removeMember (memberId: number) {
  api.post('/api/friendList/deleteMember', {
    friend_list_id: props.friendList.id,
    member_id: memberId
  })
    .then(() => {
      emits('remove-member', memberId)
    })
    .catch((err) => {
      console.error(err)
    })
}
</script>

<style scoped>

</style>
