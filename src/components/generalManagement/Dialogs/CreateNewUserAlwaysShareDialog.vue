<template>
  <q-dialog transition-show="scale" transition-hide="scale" persistent ref="dialogRef">
    <q-card class="q-pa-lg">
      <q-card-section>
        <div class="text-h5">Neuen Mitarbeiter Immer-Anteil erstellen</div>
      </q-card-section>
      <q-card-section>
        <div class="column">
          <q-select outlined v-model="selectedRank"
                    :options="allAvailableRanks"
                    option-value="id"
                    option-label="name"
                    label="Rang"/>
          <q-input label="Anteil in %"
                   outlined
                   type="number"
                   :min="0"
                   :max="100"
                   class="q-mt-md"
                   v-model.number="userAlwaysShare"/>
          <q-separator class="q-mt-sm"/>
          <span class="q-mt-sm">
            Hier kann noch spezifiziert werden, wo der Mitarbeiter Immer-Anteil dann verfügbar ist.
          </span>
          <q-checkbox v-model="availableInCashRegister" label="Aktiv in der Kasse" class="q-mt-sm"/>
        </div>
      </q-card-section>
      <q-card-actions>
        <DialogActionComponent @dialog-save-button="createUserAlwaysShare()"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'
import DialogActionComponent from 'components/general/dialogs/DialogActionComponent.vue'
import { useDialogPluginComponent } from 'quasar'
import Rank from 'src/misc/classes/Rank/Rank'

export default defineComponent({
  name: 'CreateNewUserAlwaysShareDialog',
  components: { DialogActionComponent },
  emits: [
    ...useDialogPluginComponent.emits
  ],
  props: {
    companyId: {
      type: Number,
      required: true
    },
    allRanks: {
      type: Array as PropType<Array<Rank>>,
      required: true
    }
  },
  setup (props) {
    const selectedRank = ref<Rank>()
    const allAvailableRanks = ref<Rank[]>(props.allRanks)
    const userAlwaysShare = ref<number>(0)
    const availableInCashRegister = ref<boolean>(true)
    const { dialogRef, onDialogOK } = useDialogPluginComponent()
    function createUserAlwaysShare () {
      if (selectedRank.value === undefined) {
        return
      }
      onDialogOK({
        rank_id: selectedRank.value.id,
        always_share: userAlwaysShare.value,
        always_share_cash_register: availableInCashRegister.value
      })
    }
    return {
      selectedRank,
      allAvailableRanks,
      userAlwaysShare,
      availableInCashRegister,
      dialogRef,
      createUserAlwaysShare
    }
  }
})
</script>

<style scoped>

</style>
