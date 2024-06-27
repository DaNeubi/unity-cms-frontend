<template>
  <q-dialog transition-show="scale" transition-hide="scale" persistent ref="dialogRef">
    <q-card class="q-pa-lg">
      <q-card-section>
        <div class="text-h5">Neuen Mitarbeiter Anteil erstellen</div>
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
                   :min="0"
                   :max="100"
                   type="number"
                   class="q-mt-md"
                   v-model.number="userShare"/>
        </div>
      </q-card-section>
      <q-card-actions>
        <DialogActionComponent @dialog-save-button="createUserShare()"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'
import DialogActionComponent from 'components/general/dialogs/DialogActionComponent.vue'
import Rank from 'src/misc/classes/Rank/Rank'
import { useDialogPluginComponent } from 'quasar'

export default defineComponent({
  name: 'CreateNewUserShareDialog',
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
    const userShare = ref<number>(0)
    const { dialogRef, onDialogOK } = useDialogPluginComponent()
    function createUserShare () {
      if (selectedRank.value === undefined) {
        return
      }
      onDialogOK({
        rank_id: selectedRank.value.id,
        user_share: userShare.value
      })
    }
    return {
      selectedRank,
      allAvailableRanks,
      userShare,
      createUserShare,
      dialogRef
    }
  }
})
</script>

<style scoped>

</style>
