<template>
  <transition-group appear
                    enter-active-class="animated fadeInRight"
                    leave-active-class="animated fadeOutLeft">
    <div class="col-12" v-if="loading && !preparingData">
      <div class="row">
        <div class="col-4">
        </div>
        <div class="col-4 row items-center justify-center">
          <div class="text-h6">
            Hole Daten
          </div>
          <q-spinner-hourglass size="3rem" color="secondary"/>
        </div>
        <div class="col-4">
        </div>
      </div>
    </div>
  </transition-group>
  <transition-group appear
                    enter-active-class="animated fadeInRight"
                    leave-active-class="animated fadeOutLeft">
    <div class="col-12" v-if="!loading && preparingData">
      <div class="row">
        <div class="col-4">
        </div>
        <div class="col-4 row items-center justify-center">
          <div class="text-h6">
            Verarbeite Daten
          </div>
          <q-spinner-grid size="3rem" color="accent"/>
        </div>
        <div class="col-4">
        </div>
      </div>
    </div>
  </transition-group>
</template>

<script setup lang="ts">

defineProps({
  loading: {
    type: Boolean,
    required: true,
    default: false
  },
  preparingData: {
    type: Boolean,
    required: true,
    default: false
  }
})
</script>

<style scoped>

</style>
