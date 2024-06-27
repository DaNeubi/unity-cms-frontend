<template>
  <q-tabs v-model="tab" inline-label align="left" active-color="secondary" stretch>
    <q-tab name="CurrentVehicles" label="Deine Fahrzeuge" icon="mdi-car-multiple"/>
    <q-tab name="OldVehicles" label="Alte Fahrzeuge" icon="mdi-car"/>
  </q-tabs>
  <q-tab-panels v-model="tab">
    <q-tab-panel name="CurrentVehicles">
      <user-vehicle-current-component/>
    </q-tab-panel>
    <q-tab-panel name="OldVehicles">
      <user-vehicle-removed-component/>
    </q-tab-panel>
  </q-tab-panels>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import UserVehicleCurrentComponent from 'components/user/userVehicles/userVehicleCurrentComponent.vue'
import UserVehicleRemovedComponent from 'components/user/userVehicles/userVehicleRemovedComponent.vue'

const tab = ref('CurrentVehicles')

</script>

<style scoped>

</style>
