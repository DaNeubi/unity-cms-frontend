<template>
  <on-boarding-component/>
</template>

<script setup lang="ts">
import OnBoardingComponent from 'components/general/onboarding/OnBoardingComponent.vue'
import { useUserStore } from 'stores/useUserStore'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

onMounted(() => {
  // check if the user already filled the fields
  if (userStore.welcomeDone) {
    router.push('/')
  }
})

</script>

<style scoped>

</style>
