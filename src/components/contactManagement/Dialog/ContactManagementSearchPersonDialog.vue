<template>
  <q-dialog ref="dialogRef"
            transition-show="scale"
            transition-hide="scale"
            :persistent="false">
    <q-card class="full-width">
      <q-card-section>
        <div class="text-h4">
          Person suchen
        </div>
      </q-card-section>
      <q-card-section v-if="noPersonsFound">
        <div class="row">
          <div class="text-body1 text-red-8">
            Es konnte keine Person mit deinen suchkriterien gefunden werden.
          </div>
        </div>
      </q-card-section>
      <q-card-section>
        <div class="column">
          <q-input label="Vorname"
                   v-model="firstName"
                   rounded
                   outlined
                   counter
                   maxlength="128"
                   @keydown.enter="searchPerson()"/>
          <q-input label="Nachname"
                   v-model="lastName"
                   class="q-mt-lg"
                   rounded
                   outlined
                   counter
                   maxlength="128"
                   @keydown.enter="searchPerson()"/>
        </div>
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div class="col-auto">
            <q-btn label="Suchen"
                   color="positive"
                   icon="mdi-magnify"
                   @click="searchPerson()"/>
          </div>
        </div>
      </q-card-section>
      <q-inner-loading :showing="loadingPersons">
        <q-spinner-dots size="lg" color="orange-7"/>
      </q-inner-loading>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import { companyStore } from 'stores/companyStore'
import IPerson from 'src/misc/interfaces/Person/IPerson'
import { api } from 'src/boot/axios'

export default defineComponent({
  name: 'ContactManagementSearchPersonDialog',
  emits: [
    ...useDialogPluginComponent.emits
  ],
  setup () {
    const { dialogRef, onDialogOK } = useDialogPluginComponent()
    const cStore = companyStore()
    const companyId = computed(() => cStore.companyId)
    const firstName = ref<string>()
    const lastName = ref<string>()
    const recommendedPersons = ref<IPerson[]>()
    const loadingPersons = ref<boolean>(false)
    const noPersonsFound = ref<boolean>(false)
    function searchPerson () {
      loadingPersons.value = true
      noPersonsFound.value = false
      let searchQuery = ''
      if ((firstName.value?.length ?? 0 >= 2) && (lastName.value?.length ?? 0 >= 2)) {
        searchQuery += '?firstName=' + firstName.value + ';lastName=' + lastName.value
      } else if (firstName.value?.length ?? 0 >= 2) {
        searchQuery += '?firstName=' + firstName.value
      } else if (lastName.value?.length ?? 0 >= 2) {
        searchQuery += '?lastName=' + lastName.value
      }
      api.get('/api/person/searchSpecific/' + companyId.value + searchQuery)
        .then((response) => {
          recommendedPersons.value = response.data.persons
          loadingPersons.value = false
          if (recommendedPersons.value?.length ?? 0 >= 1) {
            onDialogOK(recommendedPersons.value)
          } else {
            noPersonsFound.value = true
          }
        })
    }
    return {
      dialogRef,
      firstName,
      lastName,
      recommendedPersons,
      searchPerson,
      loadingPersons,
      noPersonsFound
    }
  }
})
</script>

<style scoped>

</style>
