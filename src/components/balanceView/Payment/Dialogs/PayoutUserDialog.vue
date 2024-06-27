<template>
  <q-dialog ref="dialogRef" transition-show="scale" transition-hide="scale">
    <q-card class="q-pa-md">
      <q-card-section>
        <div class="text-h5">Mitarbeiter/in auszahlen</div>
      </q-card-section>
      <q-card-section>
        <div class="row items-center q-gutter-sm">
          <div class="col-12">
            Hier kann nach bedarf noch ein Benutzerdefinierter Betrag für die Auszahlung ausgewählt werden.
          </div>
          <div class="col-12">
            <q-checkbox v-model="payoutDirect"
                        color="accent"
                        label="Nicht alles/andere Summe auszahlen"/>
          </div>
          <div v-if="payoutDirect"
               class="col-12">
            <div class="row">
              <div class="col-12 hint-text q-mb-md">
                Bei der Benutzerdefinierten Auszahlung, wird beim Betrag zuerst vom "Trinkgeld-Konto" genommen und dann vom "Mitarbeiter-Anteil-Konto". Wenn mehr angegeben wird als der/die Mitarbeiter/in hat, dann wird das "Trinkgeld-Konto" ins Negative gehen.
              </div>
              <div class="col-12">
                <q-input label="Summe, die Ausgezahlt werden soll in $"
                         type="number"
                         outlined
                         v-model.number="payoutAmount"
                         :rules="[val => val > 0 || 'Betrag muss größer als 0 sein']"/>
              </div>
            </div>
          </div>
          <div v-else
               class="col-12">
            <div class="text-h4 text-orange">
              Alles wird ausgezahlt
            </div>
            <div class="col-12 text-h6">
              ${{ payoutAmount }}
            </div>
          </div>
        </div>
      </q-card-section>
      <q-card-actions>
        <DialogActionComponent @dialog-save-button="makePayout()"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import IUserBalanceCurrent from 'src/misc/interfaces/User/IUserBalanceCurrent'
import { defineComponent, ref } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import DialogActionComponent from 'components/general/dialogs/DialogActionComponent.vue'
import { api } from 'src/boot/axios'

export default defineComponent({
  name: 'PayoutUserDialog',
  components: { DialogActionComponent },
  emits: [
    ...useDialogPluginComponent.emits
  ],
  props: {
    userBalanceCurrent: {
      type: Object as () => IUserBalanceCurrent,
      required: true
    },
    companyId: {
      type: Number,
      required: true,
      default: 0
    }
  },
  setup (props) {
    const { dialogRef, onDialogOK } = useDialogPluginComponent()
    const payoutDirect = ref<boolean>(false)
    const payoutAmount = ref<number>(props.userBalanceCurrent.manually_added_share + props.userBalanceCurrent.manually_added_tip + props.userBalanceCurrent.current_share + props.userBalanceCurrent.current_tip)
    function makePayout () {
      if (props.companyId <= 0 || payoutAmount.value <= 0) return
      api.post('/api/payout/make/' + props.companyId, {
        receiver_user: props.userBalanceCurrent.user_id,
        custom_payout: payoutDirect.value,
        custom_payout_amount: payoutAmount.value
      })
        .catch((error) => {
          console.error(error)
        })
      onDialogOK()
    }
    return {
      dialogRef,
      payoutDirect,
      payoutAmount,
      makePayout
    }
  }
})
</script>

<style scoped>

</style>
