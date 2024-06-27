<template>
  <q-card :bordered="false" flat class="userMenuMainSize q-mt-md">
    <q-card-section>
      <div class="row full-height full-width items-start justify-start">
        <div class="col-sm-3 col-md-2">
          <div class="row justify-start">
            <UserNavigationComponent/>
          </div>
        </div>
        <div class="col-sm-9 col-md-10">
          <router-view />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">

import UserNavigationComponent from 'components/general/UserNavigationComponent.vue'
</script>

<style scoped>
.userMenuMainSize {
  min-height: 70vh;
  height: 80vh;
}
</style>
