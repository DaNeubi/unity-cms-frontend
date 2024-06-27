<template>
  <q-dialog ref="dialogRef" transition-show="scale" transition-hide="scale" persistent>
    <q-card>
      <q-card-section>
        <div class="column">
          <span class="text-subtitle1">
            Hier auswählen, in welches Lager die Produkte der gelöschten Transaktion verschoben werden sollen.
          </span>
        </div>
      </q-card-section>
      <q-card-section>
        <div class="column">
          <q-select label="Lager auswählen"
                    outlined
                    hint="Wenn eines der unten angegebenen Produkte nicht in dem von dir ausgewählten Lager ist, passiert mit diesen halt nichts."
                    v-model="selectedItemStock"
                    clearable
                    :option-label="(val: IItemStock) => val.is_default ? val.name + ' (D)' : val.name "
                    :options="availableItemStocks"/>
        </div>
      </q-card-section>
      <q-card-section>
        <div class="column">
          <div class="text-body1">
            Folgende Artikel werden wieder zurück in das Lager verschoben/herausgenommen:
          </div>
          <div v-for="transaction in transactions"
               :key="transaction.id">
            <div v-if="transaction.type === TransactionType.Sale.valueOf()">
              <div v-for="transactionItems in transaction.transaction_items"
                   :key="transactionItems.item?.id"
                   class="text-body2 text-green-3">
                {{ '+ ' + transactionItems.amount + 'x ' +  transactionItems.item.name }}
              </div>
            </div>
            <div v-else-if="transaction.type === TransactionType.MetroPurchaseMoney.valueOf() || transaction.type === TransactionType.MetroPurchaseCard.valueOf()">
              <div v-for="transactionItems in transaction.transaction_items"
                   :key="transactionItems.item?.id"
                   class="text-body2 text-red-3">
                {{ '- ' + transactionItems.amount + 'x ' +  transactionItems.item.name }}
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-card-actions>
        <DialogActionComponent @dialog-save-button="deleteTransactions()"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, ref } from 'vue'
import DialogActionComponent from 'components/general/dialogs/DialogActionComponent.vue'
import { useDialogPluginComponent } from 'quasar'
import IItemStock from 'src/misc/interfaces/Item/IItemStock'
import { api } from 'src/boot/axios'
import { ITransaction } from 'src/misc/interfaces/Transaction/ITransaction'
import TransactionType from 'src/misc/Enums/Transaction/TransactionType'

export default defineComponent({
  name: 'TransactionHistoryItemStockDialog',
  computed: {
    TransactionType () {
      return TransactionType
    }
  },
  props: {
    transactions: {
      type: Array as PropType<ITransaction[]>,
      required: true
    },
    companyId: {
      type: Number,
      required: true
    }
  },
  components: { DialogActionComponent },
  emits: [
    ...useDialogPluginComponent.emits
  ],
  setup (props) {
    const { dialogRef, onDialogOK } = useDialogPluginComponent()
    const availableItemStocks = ref<IItemStock[]>()
    const selectedItemStock = ref<IItemStock>()
    onMounted(async () => {
      // get all item stocks
      getAllItemStocks()
    })
    function getAllItemStocks () {
      api.get('/api/itemStocks/reducedForCashRegister/' + props.companyId)
        .then((res) => {
          availableItemStocks.value = res.data.itemStocks
        })
    }
    function deleteTransactions () {
      // delete transactions
      api.post('/api/transactionHistory/delete/' + props.companyId, {
        transactions: props.transactions,
        item_stock_id: selectedItemStock.value?.id
      })
        .catch((err) => {
          console.error(err)
        })
      onDialogOK()
    }
    return {
      dialogRef,
      availableItemStocks,
      selectedItemStock,
      deleteTransactions
    }
  }
})
</script>

<style scoped>

</style>
