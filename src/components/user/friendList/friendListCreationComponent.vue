<template>
  <div class="row q-gutter-md">
    <div class="col-6">
      <div class="row">
        <div class="text-h5 col-12">Neue Freundesliste erstellen</div>
        <q-input v-model="friendListName" label="Name der Freundesliste" outlined class="col-6"
                 counter maxlength="100"/>
        <q-checkbox v-model="friendListVehicleSharing" label="Fahrzeuge teilen" class="col-12"/>
        <create-something-new-button text="Freundesliste erstellen" icon="mdi-account-multiple-plus" class="q-mt-lg"
                                     @click="sendFriendListInfoBackToCreation()"/>
      </div>
    </div>
    <div class="col-5">
      <q-img src="https://media1.tenor.com/m/j1lyw3RxJ0oAAAAC/sponge-bob-imagination.gif" :loading="'lazy'"
             alt="Spongebob"/>
      <div class="text-caption">https://media1.tenor.com/m/j1lyw3RxJ0oAAAAC/sponge-bob-imagination.gif</div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { ref } from 'vue'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'

const friendListName = ref<string>('')
const friendListVehicleSharing = ref<boolean>(true)

const emits = defineEmits(['createFriendList'])

function sendFriendListInfoBackToCreation () {
  if (friendListName.value.length === 0) return
  emits('createFriendList', { friendListName: friendListName.value, friendListVehicleSharing: friendListVehicleSharing.value })
}
</script>

<style scoped>

</style>
