<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue'
import { useUserStore } from 'stores/useUserStore'
import { useRouter } from 'vue-router'
import { lastPageHistoryStore } from 'stores/lastPageStore'

export default defineComponent({
  name: 'App',
  setup () {
    const userStore = useUserStore()
    const router = useRouter()
    const lastPageStore = lastPageHistoryStore()
    watch(() => userStore.lastSavedRoute, (route) => {
      if (route !== undefined) {
        router.push(route)
      }
    })
    watch(() => router.currentRoute.value.fullPath, () => {
      lastPageStore.setRoute(router.currentRoute.value.fullPath)
    })
    return {
    }
  }
})
</script>
