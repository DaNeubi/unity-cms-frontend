<template>
  <div class="column">
    <span class="hint-text">
      Nicht gelistete Produkte sind dafür da, um einmalige Produkte zu verkaufen , oder einmalige Käufe erfassen zu können tun tuten.<br/>
      Für Verkäufe/Einnahmen gibt es bei den Nicht gelisteten Produkten keine Mitarbeiter-Anteile.<br/>
      Die Besteuerung der Transaktion erfolgt über die Definierte in der Buchhaltung.
    </span>
    <q-list bordered class="full-width q-mt-lg">
      <NonListedProductPurchaseComponent
        group="nonListedProducts"
        label="Einkauf/Ausgabe"/>
      <q-separator />
      <NonListedProductSellComponent
        group="nonListedProducts"
        label="Verkauf/Einnahme"/>
    </q-list>
  </div>
</template>

<script setup lang="ts">
import NonListedProductPurchaseComponent from 'components/nonListedProducts/NonListedProductPurchaseComponent.vue'
import NonListedProductSellComponent from 'components/nonListedProducts/NonListedProductSellComponent.vue'

</script>

<style scoped>

</style>
