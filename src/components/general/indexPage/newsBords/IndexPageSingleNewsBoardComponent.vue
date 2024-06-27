<template>
  <q-tab-panel :name="`${ name }`">
    <div class="news-board-style" v-html="content"/>
  </q-tab-panel>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  id: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['user-read-news-board'])

onMounted(() => {
  emit('user-read-news-board', props.id)
})

</script>

<style scoped>
.news-board-style {
  line-height: 1.0;
}
</style>
