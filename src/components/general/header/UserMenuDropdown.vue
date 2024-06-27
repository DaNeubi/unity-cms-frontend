<template>
  <q-btn round
         icon="mdi-account-circle"
         color="accent">
    <q-menu transition-hide="flip-left"
            :persistent="false"
            transition-show="flip-right">
      <q-list separator>
        <q-item clickable
                @click="routeToPath('main')"
                v-ripple>
          <q-item-section avatar>
            <q-icon name="mdi-account"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>Profil</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable
                @click="routeToPath('vehicles')"
                v-ripple>
          <q-item-section avatar>
            <q-icon name="mdi-plane-car"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>Fahrzeuge</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable
                @click="routeToPath('friend-list')"
                v-ripple>
          <q-item-section avatar>
            <q-icon name="mdi-account-multiple"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>Freundeslisten</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable
                @click="routeToPath('vehicle-list')"
                v-ripple>
          <q-item-section avatar>
            <q-icon name="mdi-tank"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>Audo Katalog®</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable
                @click="routeToPath('settings')"
                v-ripple>
          <q-item-section avatar>
            <q-icon name="mdi-cogs"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>Einstellungen</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">

import { useRouter } from 'vue-router'

const router = useRouter()

function routeToPath (selectedItem: string) {
  router.push('/user/' + selectedItem)
}
</script>

<style scoped>

</style>
