<template>
  <div class="row">
    <q-table class="full-width">
      <template v-slot:top>
        <div class="row full-width q-gutter-md items-center">
          <div class="col-auto">
            <div class="text-h4">Personenkartei</div>
          </div>
          <div class="col-auto">
            <q-btn label="Akte erstellen"
                   rounded
                   icon="mdi-plus"
                   @click="createNewDocument()"
                   color="accent"/>
          </div>
        </div>
      </template>
    </q-table>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { companyStore } from 'stores/companyStore'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'ContactMedicalFilesComponent',
  props: {
    personId: {
      type: Number,
      required: true
    }
  },
  setup (props) {
    const cStore = companyStore()
    const companyId = computed(() => cStore.companyId)
    const router = useRouter()
    function createNewDocument () {
      router.push('/documents/medizinische-akte/' + companyId.value + '/' + props.personId)
    }
    return {
      createNewDocument
    }
  }
})
</script>

<style scoped>

</style>
