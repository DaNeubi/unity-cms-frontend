<template>
  <div class="absolute-center">
    <q-spinner-ball size="25em" color="orange-5" v-if="randomSpinner === 0"/>
    <q-spinner-puff size="25em" color="orange-5" v-if="randomSpinner === 1"/>
    <q-spinner-box size="25em" color="orange-5" v-if="randomSpinner === 2"/>
    <q-spinner-dots size="25em" color="orange-5" v-if="randomSpinner === 3"/>
    <q-spinner-gears size="25em" color="orange-5" v-if="randomSpinner === 4"/>
    <q-spinner-hourglass size="25em" color="orange-5" v-if="randomSpinner === 5"/>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useUserStore } from 'stores/useUserStore'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const loginState = ref(false)
const randomSpinner = ref<number>()

onMounted(async () => {
  // add the tablet script
  const script = document.createElement('script')
  script.src = '/weilhomiezulangsamist/tablet.js?v=0.0.2'
  document.body.appendChild(script)
  // set spinner
  randomSpinner.value = Math.floor(Math.random() * 5)
  loginState.value = await userStore.autoLogin(route.params.token as string)
})

watch(loginState, (value) => {
  if (value) {
    router.push({ name: 'home' })
  }
})

</script>

<style scoped>

</style>
