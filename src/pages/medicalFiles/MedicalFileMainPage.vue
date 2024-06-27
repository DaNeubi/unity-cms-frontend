<template>
  <div>
    <medical-file-main-component
      :user-id="+$route.params.userId"
      :can-see-psychological="true"/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import MedicalFileMainComponent from 'components/medicalFiles/medicalFileMainComponent.vue'

export default defineComponent({
  name: 'MedicalFileMainPage',
  components: { MedicalFileMainComponent }
})
</script>

<style scoped>

</style>
