<template>
  <q-tab :name="`${ name }`"
         :label="label"
         :icon="icon">
    <q-badge v-if="!isUpToDate" color="red-9" floating label="N" @click="incrementNotificationClickCounter()">
      <q-tooltip class="text-body2">
        Da hast du was noch nicht gelesen
      </q-tooltip>
    </q-badge>
  </q-tab>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'

defineProps({
  name: {
    type: String,
    required: true
  },
  id: {
    type: Number,
    required: true
  },
  icon: {
    type: String,
    required: false,
    default: 'mdi-newspaper'
  },
  label: {
    type: String,
    required: false,
    default: ''
  },
  isUpToDate: {
    type: Boolean,
    required: false,
    default: true
  }
})

const notificationClickCounter = ref<number>(0)
const $q = useQuasar()

function incrementNotificationClickCounter () {
  notificationClickCounter.value++
  if (notificationClickCounter.value === 7) {
    $q.notify({
      message: 'N steht für Nukleares Waffenarsenal!',
      color: 'primary',
      position: 'center',
      timeout: 5000,
      icon: 'mdi-nuke'
    })
    const audio = new Audio('/sounds/FUN-NArsenal.mp3')
    audio.volume = 0.4
    audio.play()
  }
}

</script>
