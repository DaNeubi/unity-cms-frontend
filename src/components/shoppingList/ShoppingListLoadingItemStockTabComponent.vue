<template>
  <q-tab name="loadingtab" class="loadingAnimated" :disable="true">
    <template v-slot:default>
      <p><span></span></p>
    </template>
  </q-tab>
</template>

<script setup lang="ts">

</script>

<style scoped>
p span:before {
  animation: dots 2s linear infinite;
  content: '';
}

@keyframes dots {
  0%,20% {
    content: '.';
  }
  40% {
    content: '..';
  }
  60% {
    content: '...';
  }
  90%, 100% {
    content: '';
  }
}
</style>
