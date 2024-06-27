<template>
  <div class="fullscreen bg-primary text-white text-center q-pa-md flex flex-center">
    <div class="col">
      <q-img src="images/404.webp"
             loading="lazy"
             width="500px"
             height="500px"
             ratio="1">
      </q-img>

      <div class="text-h2" style="opacity:.4;">
        Upsi! Unsere Enten haben die Seite nicht gefunden.
      </div>
      <div class="text-h6 q-mt-md">
        Folgende URL wurde leider nicht gefunden: {{ $route.path }}
      </div>

      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="blue"
        unelevated
        to="/"
        label="Zurück nach Entenhausen"
        no-caps
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ErrorNotFound'
})
</script>
