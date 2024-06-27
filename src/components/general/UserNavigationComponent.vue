<template>
  <q-list separator dark>
    <q-separator />
    <q-item clickable v-ripple to="/user/main">
      <q-item-section avatar>
        <q-icon name="mdi-account"/>
      </q-item-section>
      <q-item-section>Allgemeine Informationen</q-item-section>
    </q-item>
    <q-item clickable v-ripple to="/user/additional-information">
      <q-item-section avatar>
        <q-icon name="mdi-account-details"/>
      </q-item-section>
      <q-item-section>Zusätzliche Informationen</q-item-section>
    </q-item>
    <q-item clickable v-ripple to="/user/vehicles">
      <q-item-section avatar>
        <q-icon name="mdi-car"/>
      </q-item-section>
      <q-item-section>Meine Fahrzeuge</q-item-section>
    </q-item>
    <q-item clickable v-ripple to="/user/friend-list">
      <q-item-section avatar>
        <q-icon name="mdi-account-multiple"/>
      </q-item-section>
      <q-item-section>Freundeslisten</q-item-section>
    </q-item>
    <q-item clickable v-ripple to="/user/settings">
      <q-item-section avatar>
        <q-icon name="mdi-account-cog"/>
      </q-item-section>
      <q-item-section>Einstellungen</q-item-section>
    </q-item>
    <q-item clickable v-ripple to="/user/vehicle-list">
      <q-item-section avatar>
        <q-icon name="mdi-car-multiple"/>
      </q-item-section>
      <q-item-section>Audo Katalog®</q-item-section>
    </q-item>
    <q-separator/>
  </q-list>
</template>

<script setup lang="ts">

</script>

<style scoped>
.q-item.q-router-link--active, .q-item--active {
  color: #ffffff;
  text-decoration: none;
}
.q-item.q-router-link--active:hover, .q-item--active:hover {
  color: #8E4087;
  text-decoration: none;
}
</style>
