<template>
  <q-table class="default-table-height cms-sticky-header-table"
           virtual-scroll
           title="Hier werden die letzten Einnahmen und Ausgaben aller Mitarbeiter/innen angezeigt"
           no-data-label="Keine Daten vorhanden"
           loading-label="Daten werden abgerufen..."
           :columns="columns"
           row-key="id"
           :rows="transactions"
           v-model:pagination="pagination"
           :rows-per-page-options="[0]"
           :virtual-scroll-item-size="30"
           :virtual-scroll-sticky-size-start="30"
           @virtual-scroll="loadMoreTransactions"
           :selection="canDelete ? 'multiple' : 'none'"
           v-model:selected="selectedTransactions"
           @selection="(state) => state.added ? deleteButtonDisabled = false : deleteButtonDisabled = true"
           :loading="loading">
    <template v-slot:top-right>
      <div class="row items-center">
        <div>
          <q-btn label="Ausgewählte löschen"
                 class="q-mr-md"
                 color="negative"
                 icon="mdi-delete-outline"
                 v-if="canDelete"
                 :disable="deleteButtonDisabled"
                 @click="deleteSelectedTransactions"/>
          <q-btn label="Änderungen speichern"
                 color="secondary"
                 class="q-mr-md"
                 icon="mdi-content-save-outline"
                 v-if="canEdit"
                 :disable="changedTransactions.length === 0"
                 @click="uploadEditedTransactions"/>
        </div>
        <div class="text-orange-5 text-h6" v-if="(canDelete && canEdit)">
          Achtung, du kannst Transaktionen bearbeiten und löschen
        </div>
        <div class="text-orange-5 text-h6" v-else-if="canEdit">
          Achtung, du kannst Transaktionen bearbeiten
        </div>
        <div class="text-orange-5 text-h6" v-else-if="canDelete">
          Achtung, du kannst Transaktionen löschen
        </div>
      </div>
    </template>
    <template v-slot:loading>
      <q-inner-loading showing color="primary"/>
    </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td v-if="canDelete">
          <q-checkbox color="accent"
                      :disable="props.row.type === 9 || !transactionInCurrentMonth(props.row)"
                      v-model="props.selected"/>
        </q-td>
        <q-td v-for="headerVal in columns"
              :key="headerVal.name"
              :props="props">
          <div v-if="headerVal.name === 'number'">
            {{ props.row[headerVal.name] }}
          </div>
          <div v-else-if="headerVal.name === 'total'">
            ${{ props.row[headerVal.name] }}
          </div>
          <div v-else-if="headerVal.name === 'tip'"
               class="cursor-pointer row full-width full-height items-center justify-end">
            ${{ props.row[headerVal.name] }}
            <q-popup-edit :model-value="props.row[headerVal.name]"
                          v-slot="scope"
                          buttons
                          v-if="canEdit && transactionInCurrentMonth(props.row)"
                          label-set="Aktualisieren"
                          label-cancel="Abbrechen"
                          @save="(val) => editTransaction(val, props.row, headerVal.name)">
              <q-input v-model="scope.value"
                       outlined
                       label="Trinkgeld"
                       :min="0"/>
            </q-popup-edit>
          </div>
          <div v-else-if="headerVal.name === 'discount_amount'"
               class="row full-width full-height items-center justify-end">
            ${{ props.row[headerVal.name] }}
          </div>
          <div v-else-if="headerVal.name === 'items'"
               class="cursor-pointer row full-width full-height items-center justify-end">
            <q-scroll-area class="full-height full-width col-12" :thumb-style="{ backgroundColor: '#0152A9', opacity: 1 }" style="max-width: 20vw;">
              <div v-if="props.row.transaction_items !== undefined && props.row.transaction_items !== null && props.row.transaction_items.length > 0">
                <div v-for="transactionItem in props.row.transaction_items"
                     :key="transactionItem.id" :class="`${ (canEdit && !transactionItem.from_menu && transactionInCurrentMonth(props.row)) ? 'item-hover-animation' : '' }` + ' row justify-center items-center'">
                  <span v-if="!checkForPurchaseTransactionType(props.row)">
                    {{ transactionItem.amount }}x {{ transactionItem.item.name }} á ${{ parseFloat(transactionItem.price) }}
                    <q-tooltip v-if="canEdit && !transactionItem.from_menu">
                      Hier klicken um die Anzahl zu bearbeiten
                    </q-tooltip>
                    <q-tooltip v-else-if="canEdit && transactionItem.from_menu">
                      Artikel aus einem Menü können nicht bearbeitet werden
                    </q-tooltip>
                  </span>
                  <span v-else>
                    {{ transactionItem.amount }}x {{ transactionItem.item.name }} á ${{ parseFloat(transactionItem.purchase_price) }}
                  </span>
                  <q-popup-edit :model-value="transactionItem.amount"
                                v-slot="scope"
                                buttons
                                v-if="canEdit && !transactionItem.from_menu && transactionInCurrentMonth(props.row)"
                                label-set="Aktualisieren"
                                label-cancel="Abbrechen"
                                @save="(val) => editTransactionItem(val, transactionItem)">
                    <q-input v-model.number="scope.value"
                             v-if="!checkForPurchaseTransactionType(props.row)"
                             :label="`Anzahl von ${ transactionItem.item.name }, je $${ parseFloat(transactionItem.price) }`"
                             type="number"
                             :min="0"/>
                    <q-input v-model.number="scope.value"
                             v-else
                             :label="`Anzahl von ${ transactionItem.item.name }, je $${ parseFloat(transactionItem.purchase_price) }`"
                             type="number"
                             :min="0"/>
                  </q-popup-edit>
                </div>
              </div>
              <div v-else-if="(props.row.transaction_non_items !== null && props.row.transaction_non_items !== undefined) || props.row.type === 6 ||  props.row.type === 7 || props.row.type === 8">
              <span class="row justify-center">
                {{ props.row.transaction_non_items.name }}
                <q-tooltip>
                  Diesen Transaktionstypen kannst du nicht bearbeiten, nur löschen.
                </q-tooltip>
              </span>
              </div>
            </q-scroll-area>
          </div>
          <div v-else-if="headerVal.name === 'tax_percentage'"
               class="cursor-pointer row full-width full-height items-center justify-end">
            {{ props.row[headerVal.name] }}%
            <q-popup-edit :model-value="props.row[headerVal.name]"
                          v-slot="scope"
                          buttons
                          v-if="canEdit && transactionInCurrentMonth(props.row)"
                          label-set="Aktualisieren"
                          label-cancel="Abbrechen"
                          @save="(val) => editTransaction(val, props.row, headerVal.name)">
              <q-input v-model.number="scope.value"
                       outlined
                       label="Steuersatz"
                       type="number"
                       :min="0"
                       :max="100">
                <template v-slot:append>
                  <q-icon name="mdi-percent"/>
                </template>
              </q-input>
            </q-popup-edit>
          </div>
          <div v-else-if="headerVal.name === 'created_at'"
               class="cursor-pointer row full-width full-height items-center justify-end">
            <div v-if="props.row['created_at'] !== props.row['updated_at']">
              <div class="col">
                <div>
                  <i>erstellt am: {{ FormatDateTime(props.row['created_at']) }}</i>
                </div>
                <div>
                  <i>zuletzt bearbeitet: {{ FormatDateTime(props.row['updated_at']) }}</i>
                </div>
              </div>
              <q-popup-edit :model-value="props.row.created_at"
                            v-slot="scope"
                            buttons
                            v-if="canEdit && transactionInCurrentMonth(props.row)"
                            label-set="Aktualisieren"
                            label-cancel="Abbrechen"
                            @save="(val) => editTransaction(val, props.row, headerVal.name)">
                <q-input filled
                         v-model="scope.value">
                  <template v-slot:prepend>
                    <q-icon name="mdi-calendar-check" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="scope.value" mask="YYYY-MM-DDTHH:mm:ss">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Schließen" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                      <q-tooltip>
                        Hier klicken um das Datum zu bearbeiten
                      </q-tooltip>
                    </q-icon>
                  </template>
                  <template v-slot:append>
                    <q-icon name="mdi-clock-outline" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-time v-model="scope.value" mask="YYYY-MM-DTHH:mm:ss" format24h>
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Schließen" color="primary" flat />
                          </div>
                        </q-time>
                      </q-popup-proxy>
                      <q-tooltip>
                        Hier klicken um die Uhrzeit zu bearbeiten
                      </q-tooltip>
                    </q-icon>
                  </template>
                </q-input>
              </q-popup-edit>
            </div>
            <div v-else>
              {{ FormatDateTime(props.row['created_at']) }}
              <q-popup-edit :model-value="props.row.created_at"
                            v-slot="scope"
                            buttons
                            v-if="canEdit && transactionInCurrentMonth(props.row)"
                            label-set="Aktualisieren"
                            label-cancel="Abbrechen"
                            @save="(val) => editTransaction(val, props.row, headerVal.name)">
                <q-input filled
                         v-model="scope.value">
                  <template v-slot:prepend>
                    <q-icon name="mdi-calendar-check" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="scope.value" mask="YYYY-MM-DDTHH:mm:ss">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Schließen" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                      <q-tooltip>
                        Hier klicken um das Datum zu bearbeiten
                      </q-tooltip>
                    </q-icon>
                  </template>
                  <template v-slot:append>
                    <q-icon name="mdi-clock-outline" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-time v-model="scope.value" mask="YYYY-MM-DTHH:mm:ss" format24h>
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Schließen" color="primary" flat />
                          </div>
                        </q-time>
                      </q-popup-proxy>
                      <q-tooltip>
                          Hier klicken um die Uhrzeit zu bearbeiten
                      </q-tooltip>
                    </q-icon>
                  </template>
                </q-input>
              </q-popup-edit>
            </div>
          </div>
          <div v-else-if="headerVal.name === 'user'">
            <div>
              <div v-if="props.row.user">
                {{ props.row.user.first_name }} {{ props.row.user.last_name }}
              </div>
              <div v-else>
                Kein Mitarbeiter gefunden
              </div>
            </div>
          </div>
          <div v-else-if="headerVal.name === 'note'"
               class="cursor-pointer row full-width full-height items-center justify-end">
            {{ props.row.note }}
            <q-popup-edit :model-value="props.row[headerVal.name]"
                          v-slot="scope"
                          buttons
                          v-if="canEdit && transactionInCurrentMonth(props.row)"
                          label-set="Aktualisieren"
                          label-cancel="Abbrechen"
                          @save="(val) => editTransaction(val, props.row, headerVal.name)">
              <q-input v-model="scope.value"
                       label="Notiz"
                       filled
                       counter
                       maxlength="500"
                       autogrow/>
            </q-popup-edit>
          </div>
          <div v-else-if="headerVal.name === 'type'"
               class="cursor-pointer row full-width full-height items-center justify-end">
            {{ FormatTransactionTypeToGerman(props.row[headerVal.name]) }}
            <q-popup-edit :model-value="props.row[headerVal.name]"
                          v-slot="scope"
                          buttons
                          v-if="canEdit && transactionInCurrentMonth(props.row)"
                          label-set="Aktualisieren"
                          label-cancel="Abbrechen"
                          @save="(val) => editTransaction(val, props.row, headerVal.name)">
              <q-select v-model="scope.value"
                        label="Transaktions Typ"
                        :options="transactionTypeLabels"
                        :option-label="option => FormatTransactionTypeToGerman(option)"/>
            </q-popup-edit>
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import { companyStore } from 'stores/companyStore'
import { ITransaction } from 'src/misc/interfaces/Transaction/ITransaction'
import { api } from 'src/boot/axios'
import FormatDateTime from '../../misc/functions/FormatDateTime'
import FormatTransactionTypeToGerman from '../../misc/functions/general/FormatTransactionTypeToGerman'
import ChangeTableDeleteButtonState from 'src/misc/functions/tables/ChangeTableDeleteButtonState'
import TransactionType from 'src/misc/Enums/Transaction/TransactionType'
import IDiscount from 'src/misc/interfaces/Discount/IDiscount'
import IEditedTransaction from 'src/misc/interfaces/Transaction/IEditedTransaction'
import ITransactionItem from 'src/misc/interfaces/Transaction/ITransactionItem'
import { useQuasar } from 'quasar'
import TransactionHistoryItemStockDialog
  from 'components/transactionHistory/dialogs/TransactionHistoryItemStockDialog.vue'
import laravelEcho from 'boot/laravelecho'
import IEncapsulatedIntermediateTransactionHistoryUpdate
  from 'src/misc/interfaces/Transaction/IEncapsulatedIntermediateTransactionHistoryUpdate'
import AssignPolicies from 'src/misc/functions/policies/Policies'

export default defineComponent({
  name: 'TransactionHistoryAllComponent',
  methods: { ChangeTableDeleteButtonState, FormatTransactionTypeToGerman, FormatDateTime },
  components: {},
  setup () {
    const $q = useQuasar()
    const loading = ref(true)
    const cStore = companyStore()
    const companyId = computed(() => cStore.companyId)
    const transactions = ref<ITransaction[]>([])
    const canEdit = ref<boolean>(false)
    const canDelete = ref<boolean>(false)
    const selectedTransactions = ref<ITransaction[]>([])
    const deleteButtonDisabled = ref<boolean>(true)
    const selectedEditingDiscount = ref<number>()
    const availableDiscounts = ref<IDiscount[]>([])
    const availableOptionsDiscounts = ref<IDiscount[]>([])
    const changedTransactions = ref<ITransaction[]>([])
    const transactionTypeLabels: number[] = [TransactionType.Purchase,
      TransactionType.Sale, TransactionType.UserWithdrawal, TransactionType.MetroPurchaseMoney,
      TransactionType.MetroPurchaseCard]
    const columns = [
      { name: 'total', label: 'Gesamt', field: 'total' },
      { name: 'number', label: 'Re. Nummer', field: 'number' },
      { name: 'tip', label: 'Trinkgeld', field: 'tip' },
      { name: 'discount_amount', label: 'Rabatt', field: 'discount_amount' },
      { name: 'tax_percentage', label: 'Steuersatz', field: 'tax_percentage' },
      { name: 'items', label: 'Artikel', field: 'items', style: 'min-width: 20vw' },
      { name: 'created_at', label: 'Datum', field: 'created_at' },
      { name: 'user', label: 'Mitarbeiter/in', field: 'user' },
      { name: 'note', label: 'Notiz', field: 'note' },
      { name: 'type', label: 'Typ', field: 'type' }
    ]
    watch(() => companyId.value, () => {
      getPolicies()
      subscribeChangedTransactions()
    })
    onMounted(() => {
      // get all the available policies
      getPolicies()

      // subscribe to the transaction history changed event
      subscribeChangedTransactions()
    })
    onUnmounted(() => {
      laravelEcho.leave('transactionHistory.changed.' + companyId.value)
    })
    function subscribeChangedTransactions () {
      if (companyId.value <= 0) { return }
      // listen to the transaction history updated event
      laravelEcho.join('transactionHistory.changed.' + companyId.value)
        .listen('.company.transactionHistory.changed', (cb : IEncapsulatedIntermediateTransactionHistoryUpdate) => {
          // check for the company again
          if (cb.intermediateTransactionHistoryUpdated?.company_id !== companyId.value) {
            return
          }
          // remove the given transactions from the list
          if (transactions.value === undefined) {
            return
          }
          for (let i = 0; i < cb.intermediateTransactionHistoryUpdated.transactionHistoryItemIds.length; i++) {
            const index = transactions.value.findIndex((t: ITransaction) => t.id === cb.intermediateTransactionHistoryUpdated?.transactionHistoryItemIds[i])
            if (index !== -1) {
              transactions.value.splice(index, 1)
            }
          }

          // clear selected transactions
          selectedTransactions.value = []
        })
    }
    function getPolicies () {
      if (companyId.value <= 0) { return }
      api.get('/api/policies/transactionManagement/transactions/' + companyId.value)
        .then((response) => {
          AssignPolicies([
            { policyName: 'TransactionHistory_Delete', policyToAssign: canDelete },
            { policyName: 'TransactionHistory_Edit', policyToAssign: canEdit }
          ], response.data.transactionHistoryPolicies)
        })
        .catch((err) => {
          console.error(err)
        })
    }
    function editTransaction (newValue: string | number, transaction: ITransaction, valueChanged: string) {
      if (transaction.transaction_non_items) {
        showTransactionTypeNotEditable()
        return
      }
      if (transaction.type === 6 || transaction.type === 7 || transaction.type === 8 || transaction.type === 9) {
        showTransactionTypeNotEditable()
        return
      }
      transaction[valueChanged] = newValue
      // check if the transaction is already in the changedTransactions array
      const index = changedTransactions.value.findIndex((t: ITransaction) => t.id === transaction.id)
      if (index === -1) {
        changedTransactions.value.push(transaction)
      }
    }
    function editTransactionItem (newValue: number, transactionItem: ITransactionItem) {
      transactionItem.amount = +newValue
      // check if the items transaction is already in the array
      const index = changedTransactions.value?.findIndex((t: ITransaction) => t.id === transactionItem.transaction_id)
      if (index === -1) {
        changedTransactions.value.push(
          transactions.value?.find(
            (t: ITransaction) => t.id === transactionItem.transaction_id) as ITransaction)
      }
    }
    function uploadEditedTransactions () {
      // move the changedTransactions to the IEditedTransactions
      const editedTransactions: IEditedTransaction[] = []
      changedTransactions.value.forEach((t: ITransaction) => {
        editedTransactions.push({
          id: t.id,
          discount_id: t.discount_id,
          discount_amount: t.discount_amount,
          note: t.note,
          type: t.type,
          transaction_items: t.transaction_items,
          total: t.total,
          tip: t.tip,
          tax_percentage: t.tax_percentage,
          created_at: t.created_at
        } as IEditedTransaction)
      })

      // post the changes to the server
      api.patch('/api/transactionHistory/update/' + companyId.value, {
        transactions: editedTransactions
      })
    }
    function deleteSelectedTransactions () {
      $q.dialog({
        component: TransactionHistoryItemStockDialog,
        componentProps: {
          companyId: companyId.value,
          transactions: selectedTransactions.value
        },
        ok: {
          label: 'Ja',
          push: true
        }
      })
    }
    function loadMoreTransactions () {
      if (companyId.value <= 0) { return }
      api.get('/api/transactionHistory/all/reduced/' + companyId.value, {
        params: {
          offset: transactions.value?.length ?? 0
        }
      })
        .then((response) => {
          if (transactions.value !== undefined && transactions.value?.length > 0) {
            transactions.value = transactions.value?.concat(response.data)
            loading.value = false
          } else {
            transactions.value = response.data
            loading.value = false
          }
        })
        .catch((err) => {
          console.error(err)
        })
    }
    function filterDiscounts (val: string, update: (val: () => void) => void) {
      if (availableDiscounts.value !== undefined && availableDiscounts.value?.length > 0) {
        update(() => {
          const needle = val.toLowerCase()
          availableOptionsDiscounts.value =
            availableDiscounts.value?.filter((v) => v.name.toLowerCase().indexOf(needle) > -1)
        })
        return
      }
      api.get('/api/discounts/reducedForCashRegister/' + companyId.value)
        .then((res) => {
          availableDiscounts.value = res.data
          const needle = val.toLowerCase()
          availableOptionsDiscounts.value =
            availableDiscounts.value?.filter((v) => v.name.toLowerCase().indexOf(needle) > -1)
        })
        .catch((err) => {
          console.error(err)
        })
    }
    function checkForPurchaseTransactionType (transaction: ITransaction) {
      return transaction.type === TransactionType.MetroPurchaseMoney ||
        transaction.type === TransactionType.MetroPurchaseCard
    }
    function showTransactionTypeNotEditable () {
      $q.notify({
        message: 'Diesen Transaktionstypen kannst du nicht bearbeiten, nur löschen.',
        color: 'orange-5',
        icon: 'mdi-alert-circle-outline',
        position: 'top',
        timeout: 2500
      })
    }
    function transactionInCurrentMonth (transaction: ITransaction) {
      if (transaction.created_at === undefined) return false
      const creationDate = new Date(transaction.created_at)
      const currentDate = new Date()
      return creationDate.getMonth() === currentDate.getMonth() && creationDate.getFullYear() === currentDate.getFullYear()
    }
    return {
      columns,
      loading,
      transactions,
      pagination: ref({
        rowsPerPage: 30
      }),
      loadMoreTransactions,
      editTransaction,
      canEdit,
      canDelete,
      selectedTransactions,
      deleteButtonDisabled,
      transactionTypeLabels,
      selectedEditingDiscount,
      availableOptionsDiscounts,
      filterDiscounts,
      changedTransactions,
      uploadEditedTransactions,
      deleteSelectedTransactions,
      editTransactionItem,
      checkForPurchaseTransactionType,
      transactionInCurrentMonth
    }
  }
})
</script>

<style scoped lang="sass">
.item-hover-animation
  transition: all 0.3s ease-in

.item-hover-animation:hover
  animation: item-hovering 2s infinite

/**
  Animation keyframes
 */
@keyframes item-hovering
  0%, 100%
    transform: scale(1)
    color: #EBEBEB

  50%
    transform: scale(1.1)
    color: #7E6FFF

/** table

.my-sticky-header-table
  .q-table__top,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: #27272F

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
</style>
