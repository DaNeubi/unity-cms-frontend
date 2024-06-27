<template>
  <div class="col justify-start q-mt-sm">
    <div class="col">
      <div class="row items-center justify-start q-gutter-sm"
           v-if="!loadingPermissions">
        <q-select v-model="selectedDiscount" use-input outlined class="col-3" label="Rabatte"
                  :options="availableOptionDiscounts" option-value="id"
                  :option-label="val => val.name + ' |> ' + parseFloat(val.amount) + '%'"
                  clearable v-if="canSeeDiscounts" @filter="filterDiscounts">
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                Keine Rabatte gefunden
              </q-item-section>
            </q-item>
          </template>
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label class="text-subtitle1">
                  {{ scope.opt.name }} |> {{ parseFloat(scope.opt.amount) }}%
                </q-item-label>
                <q-item-label class="text-body2">
                  {{ scope.opt.description }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
        <q-checkbox v-model="keepDiscountSelected" label="Rabatt behalten" class="col-lg-auto col-xl-2" v-if="canSeeDiscounts"
                    color="secondary"/>
        <div class="col-auto">
          <q-btn color="info" outline v-if="canMakeEmployeeWithdrawal" @click="createUserWithdraw()"
                 label="Mitarbeiterentnahme"/>
        </div>
        <q-input v-model.number="santosCardCode" type="number" class="col-lg-auto col-xl-2" v-if="santosCardSettings !== undefined && santosCardSettings?.enabled"
                 mask="######" counter maxlength="6" outlined label="Santos Card Code" clearable
                 :hint="`Faktor: $1 = ` + parseFloat((santosCardSettings?.multiplier)?.toString() ?? '') + ` Punkte. Aktuell: ` + Math.floor(total * santosCardSettings?.multiplier) + ` Punkte`">
          <template v-slot:prepend>
            <q-icon name="mdi-credit-card-chip-outline"/>
          </template>
        </q-input>
        <q-icon name="mdi-refresh" :color="lastStateSave === undefined ? 'orange-4' : 'positive'"
                size="md" class="col-auto q-ml-md" @click="refreshCounterClickCount++">
          <q-tooltip class="text-body2">
            Aktueller Stand zuletzt gespeichert am {{ FormatDateTime(lastStateSave) }}
          </q-tooltip>
        </q-icon>
      </div>
      <div class="row items-center q-gutter-md q-mb-sm" v-else>
        <q-skeleton height="40px" width="30%"/>
        <q-skeleton height="40px" width="7%"/>
        <q-skeleton height="40px" width="10%"/>
        <q-skeleton height="40px" width="10%"/>
        <q-skeleton height="40px" width="7%"/>
        <q-skeleton height="40px" width="30%"/>
      </div>
      <div class="row items-center">
        <div class="col-md-3 col-lg-3">
          <div class="col" v-if="!loadingPermissions">
            <div class="text-red-9 text-subtitle-2">* Rabatt wird nicht angewendet</div>
            <div class="text-blue-8 text-subtitle-2">* Mitarbeiter-Anteil wird nicht angewendet</div>
          </div>
        </div>
        <div class="col-md-4 col-lg-5">
        </div>
        <q-btn color="warning" outline size="md" class="q-mb-none q-pb-none col-auto" @click="resetItemAmount()"
               label="Artikel zurücksetzen">
          <q-tooltip anchor="top middle" self="top middle" class="text-body2">
            Setzt die Anzahl aller Artikel und Menüs auf 0 zurück
          </q-tooltip>
        </q-btn>
        <q-btn color="warning" outline size="md" class="q-mb-none q-pb-none col-auto q-ml-lg"
               @click="resetAll()" label="Kasse zurücksetzen">
          <q-tooltip anchor="top middle" self="top middle" class="text-body2">
            Setzt die komplette Kasse zurück, inklusive des gespeicherten Standes
          </q-tooltip>
        </q-btn>
      </div>
    </div>
    <q-separator class="q-mt-sm q-mb-md"/>
    <div class="col">
      <div class="row items-center">
        <div class="col-md-2 col-lg-3">
          <div class="text-h5 text-grey-5">Gesamt: $<u>{{ total.toLocaleString() }}</u></div>
        </div>
        <div class="row col-5"
             v-if="!loadingDefaultItemStock">
          <q-checkbox v-model="useDefaultItemStock" label="Automatisch rausnehmen" color="secondary"
                      @update:model-value="(val: number) => {
                        if (val) {
                          selectedItemStock = defaultItemStock
                        }
                      }"
                      class="q-mr-sm"/>
          <q-select v-model="selectedItemStock"
                    :options="availableOptionItemStocks" outlined clearable class="col-6"
                    :disable="useDefaultItemStock" label="Lager" option-value="id" :option-label="val => val.name"
                    @filter="filterItemStocks"/>
        </div>
        <div class="row col-5 q-gutter-sm justify-center"
             v-else>
          <q-skeleton type="QCheckbox" height="40px"/>
          <q-skeleton height="40px" width="40%"/>
        </div>
        <div class="col-md-5 col-lg-4">
          <div class="row justify-between">
            <q-input v-model.number="amountGiven" outlined label="Gegeben" type="number" :min="total">
              <template v-slot:prepend>
                <q-icon name="mdi-currency-usd"/>
              </template>
            </q-input>
            <q-btn color="secondary" outline class="q-ml-md" size="md" icon="mdi-compare-horizontal"
                   label="Geizhals" @click="setGivenToTotal()"/>
          </div>
        </div>
      </div>
    </div>
    <q-separator class="q-mt-sm q-mb-md"/>
    <div class="col">
      <div class="row items-center">
        <div class="col-2">
          <q-btn color="positive" outline size="md" :disable="amountGiven < total || disableTransactionButton"
                 icon="mdi-content-save-outline" label="Bezahlt" @click="createTransaction"/>
        </div>
        <div class="col-4">
          <div v-if="loadingTransactionNumber">
            <q-skeleton type="text" height="60px" width="60%"/>
          </div>
          <div v-else class="row q-gutter-md">
            <div class="text-h6">
              Rechnungsnummer: {{ transactionNumber }}
            </div>
            <q-btn color="primary" outline size="sm" icon="mdi-reload" @click="getNewTransactionNumber">
              <q-tooltip>
                Neue Rechnungsnummer erhalten
              </q-tooltip>
            </q-btn>
          </div>
        </div>
        <div class="col-6">
          <q-input v-model="note" outlined counter clearable v-if="canAddNote" maxlength="500" type="text"
                   label="Notizfeld"/>
        </div>
      </div>
    </div>
    <q-separator class="q-mt-sm q-mb-md"/>
    <div class="col">
      <div class="row items-center">
        <div class="col-6 text-h6">
          Artikel
        </div>
        <div class="col-2 text-h6">
          Kategorie
        </div>
        <div class="col-4 text-h6">
          Menge
        </div>
      </div>
    </div>
    <div class="col">
      <div v-if="loadingItems">
        <div class="col q-mb-sm" v-for="i in 5" :key="i">
          <div class="row q-gutter-md">
            <q-skeleton height="40px" width="40%"/>
            <q-skeleton height="40px" width="15%"/>
            <q-skeleton height="40px" width="20%"/>
            <q-skeleton height="40px" width="21%"/>
          </div>
        </div>
      </div>
      <div class="row items-center q-mb-sm q-pa-sm article-container-base"
           v-else
           v-for="item in availableItems"
           :key="item.id" :style="item.item_type_id !== null && item.item_type_id > 0 && item.item_type.color !== null ?
            'background-color:' + item.item_type.color + ';' :
            item.item_category_id !== null && item.item_category_id > 0 ?
            'background-color:' + item.item_category.color + ';' : ''">
        <div class="col-6">
          <div class="row items-center">
            <div class="col-grow col-md-6 col-sm-6 q-mr-md">
              <div class="text-subtitle1">
                {{ item.name }}
              </div>
              <div class="text-caption text-grey-5">
                {{ item.description }}
              </div>
            </div>
            <div class="col">
              <div class="row items-center">
                <div class="col-auto">
                  ${{ parseFloat(item.selling_price.toString()) }} (pro Stück)
                </div>
                <div class="text-red-9 q-mr-sm col-auto" v-if="!item.discount_available">
                  *
                  <q-tooltip>Hier gibt's keinen Rabatt</q-tooltip>
                </div>
                <div class="text-blue-8 col-auto" v-if="!item.user_share">
                  *
                  <q-tooltip>Hier gibt's keinen Mitarbeiteranteil</q-tooltip>
                </div>
                <div class="col-lg">
                  <div class="row items-center justify-start full-width"
                       v-if="item.item_menus !== undefined && item.item_menus?.length > 0">
                    <div class="col-10"
                         v-for="menu in item.item_menus"
                         :key="menu.id">
                      <div class="row items-center">
                        <div class="col-10">
                          <div class="row items-center justify-start"
                               v-for="menuItems in menu.item_menu_category"
                               :key="menuItems.id + Math.random()">
                            <div class="col-12" v-for="item in menuItems.item_category?.items"
                                 :key="item.id + Math.random()">
                              <div v-if="item.amount > 0">
                                {{ item.name }} {{ item.amount }}x
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="col-auto">
                          <q-icon @click="editMenuFormItemMenu(item, menu)" name="mdi-pencil" v-if="false" size="sm">
                            <q-tooltip>Bearbeiten</q-tooltip>
                          </q-icon>
                          <q-icon @click="removeMenuFormItemMenu(item, menu)" name="mdi-trash-can" size="sm">
                            <q-tooltip>Löschen</q-tooltip>
                          </q-icon>
                        </div>
                      </div>
                      <q-separator :class="item.item_menus?.length > 1 ? 'q-mb-sm' : ''"/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-3">
              <div class="row">
                <div v-if="canSeeItemStock && Object.keys(selectedItemStock).length > 0 && (selectedItemStock !== undefined && selectedItemStock?.item_stock_item_types === undefined)">
                  <q-skeleton width="8em"
                              class="bg-teal-8"
                              animation="pulse-y"/>
                </div>
                <div v-else-if="canSeeItemStock && Object.keys(selectedItemStock).length > 0 && selectedItemStock?.item_stock_items?.find((itemStockItem) => itemStockItem.item_id === item.id)">
                  noch {{ selectedItemStock?.item_stock_items?.find((itemStockItem) => itemStockItem.item_id === item.id).current_amount }} im Lager
                </div>
                <div v-else-if="canSeeItemStock && Object.keys(selectedItemStock).length > 0 && selectedItemStock?.item_stock_item_types.find((itemStockItemType) => itemStockItemType.item_type_id === item.item_type_id)">
                  noch {{ selectedItemStock?.item_stock_item_types.find((itemStockItemType) => itemStockItemType.item_type_id === item.item_type_id).current_amount }} im Lager
                </div>
                <div v-else>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-2">
          <div class="text-subtitle1 text-grey-5">
            <i>{{ item.item_category !== null && item.item_category_id > 0 ? item.item_category.name : '' }}</i>
          </div>
        </div>
        <div class="col-4">
          <EditSomethingButton text="Menü konfigurieren" v-if="item.menu"
                               @createSomethingNew="showConfigureMenuDialog(item)"/>
          <div class="row q-gutter-sm" v-else>
            <q-separator vertical/>
            <q-input v-model.number="item.amount"
                     outlined dense class="col-md-5 col-lg-4" type="number" min="0"/>
            <q-btn color="pink-5" label="+1" @click="addCustomAmountToItem(item, 1)"/>
            <q-btn color="green-5" label="+5" @click="addCustomAmountToItem(item, 5)"/>
            <q-btn color="light-blue-5" label="+10" @click="addCustomAmountToItem(item, 10)"/>
          </div>
        </div>
      </div>
    </div>
    <q-separator class="q-mt-sm q-mb-md"/>
    <div class="col">
      <q-input v-model="note" type="textarea" outlined v-if="canAddNote" counter
               clearable maxlength="500" autogrow label="Notizfeld"/>
    </div>
  </div>
</template>

<script lang="ts">
import IDiscount from 'src/misc/interfaces/Discount/IDiscount'
import { computed, defineComponent, onMounted, onUnmounted, ref, toRaw, watch } from 'vue'
import { api } from 'boot/axios'
import { companyStore } from 'stores/companyStore'
import { useUserStore } from 'stores/useUserStore'
import IItemStock from 'src/misc/interfaces/Item/IItemStock'
import laravelEcho from 'boot/laravelecho'
import { IItem } from 'src/misc/interfaces/Item/IItem'
import { ITransaction } from 'src/misc/interfaces/Transaction/ITransaction'
import TransactionType from 'src/misc/Enums/Transaction/TransactionType'
import ITransactionItem from 'src/misc/interfaces/Transaction/ITransactionItem'
import {
  IEncapsulatedIntermediateItemStockUpdated
} from 'src/misc/interfaces/Item/IEncapsulatedIntermediateItemStockUpdated'
import AssignPolicies from 'src/misc/functions/policies/Policies'
import EditSomethingButton from 'components/general/buttons/EditSomethingButton.vue'
import { useQuasar } from 'quasar'
import ConfigureMenuDialog from 'src/components/cashRegister/Dialogs/ConfigureMenuDialog.vue'
import IItemMenu from 'src/misc/interfaces/Item/IItemMenu'
import ICompanySantosPointsSettings from 'src/misc/interfaces/Company/IcompanySantosPointsSettings'
import SantosCardRetryDialog from 'components/cashRegister/Dialogs/SantosCardRetryDialog.vue'
import ConfirmationDialog from 'components/general/dialogs/ConfirmationDialog.vue'
import { cashRegisterStateStore } from 'stores/cashRegisterStore'
import IOldFoodCashRegisterState from 'src/misc/interfaces/WebWorker/IOldFoodCashRegisterState'
import FormatDateTime from '../../misc/functions/FormatDateTime'
import IGeneralReloadNotification from 'src/misc/interfaces/User/IGeneralReloadNotification'
import ReloadType from 'src/misc/Enums/Reload/ReloadType'
import ITransactionNumberInformation from 'src/misc/interfaces/Transaction/ITransactionNumberInformation'

export default defineComponent({
  name: 'oldFoodCashRegister',
  methods: { FormatDateTime },
  components: { EditSomethingButton },
  setup () {
    const $q = useQuasar()
    const availableDiscounts = ref<IDiscount[]>()
    const availableOptionDiscounts = ref<IDiscount[]>()
    const selectedDiscount = ref<IDiscount | null | undefined>(undefined)
    const keepDiscountSelected = ref<boolean>(false)
    const useDefaultItemStock = ref<boolean>(true)
    const availableItemStocks = ref<IItemStock[]>()
    const availableOptionItemStocks = ref<IItemStock[]>()
    const defaultItemStock = ref<IItemStock>()
    const selectedItemStock = ref<IItemStock>()
    const availableItems = ref<IItem[]>()
    const cStore = companyStore()
    const userStore = useUserStore()
    const useCashRegisterStateStore = cashRegisterStateStore()
    const userId = computed(() => userStore.userId)
    const companyId = computed(() => cStore.companyId)
    const canMakeCustomTaxation = ref<boolean>(false)
    const canAddNote = ref<boolean>(false)
    const canMakeEmployeeWithdrawal = ref<boolean>(false)
    const canSeeItemStock = ref<boolean>(false)
    const canSeeDiscounts = ref<boolean>(false)
    const amountGiven = ref<number>(0)
    const loadingPermissions = ref<boolean>(false)
    const loadingDefaultItemStock = ref<boolean>(false)
    const loadingItems = ref<boolean>(false)
    const note = ref<string>()
    const transactionNumber = ref<number>()
    const loadingTransactionNumber = ref<boolean>(false)
    const santosCardSettings = ref<ICompanySantosPointsSettings>()
    const santosCardCode = ref<number>()
    const disableTransactionButton = ref<boolean>(false)
    const total = computed(() => {
      let total = 0
      // sum the items
      availableItems.value?.forEach(item => {
        if (item.amount > 0 && item.discount_available && selectedDiscount.value !== null && selectedDiscount.value !== undefined) {
          // remove any discount if available
          total += item.amount * item.selling_price - ((item.amount * item.selling_price) * (selectedDiscount.value?.amount / 100))
        } else if (item.item_menus !== undefined && item.item_menus.length > 0 && item.discount_available && selectedDiscount.value !== null && selectedDiscount.value !== undefined) {
          total += item.item_menus?.length * item.selling_price - ((item.item_menus?.length * item.selling_price) * (selectedDiscount.value?.amount / 100))
        } else {
          if (item.item_menus !== undefined && item.item_menus.length > 0) {
            total += item.item_menus?.length * item.selling_price
          } else {
            total += item.amount * item.selling_price
          }
        }
      })
      return Math.round(total)
    })
    const lastStateSave = ref<string|undefined>(undefined)
    const worker = new Worker(new URL('../../misc/webworkers/cashRegister/oldFoodCashRegisterWebworker.ts', import.meta.url))
    const refreshCounterClickCount = ref<number>(0)
    watch(companyId, () => {
      // do this if the companyId changes
      getPermissions()
      checkForDefaultItemStock()
      getAllAvailableItems()
      // check the cash register store
      checkCashRegisterStore()
      getTransactionNumber()
      // join the channels
      joinChannels()
      getSantosCardSetting()
      joinSantosCardRetryChannel()
      // join the invoice number channel
      joinInvoiceNumberChannel()
    })
    onMounted(() => {
      // first get the permissions
      getPermissions()
      // then check for a default item stock
      checkForDefaultItemStock()
      // join the channels
      joinChannels()
      // join the reload channel
      joinReloadChannel()
      // get all available items
      getAllAvailableItems()
      // check the cash register store
      checkCashRegisterStore()
      // get the transaction number
      getTransactionNumber()
      // get santos card settings
      getSantosCardSetting()
      // join the santos card retry channel
      joinSantosCardRetryChannel()
      // join the invoice number channel
      joinInvoiceNumberChannel()
    })
    onUnmounted(() => {
      // stop listening to the change event
      laravelEcho.leave('user.reload.' + userId.value)
      // stop listening to the general itemStock change event
      laravelEcho.leave('itemStock.changed.' + companyId.value)
      // stop listening to the transaction number channel
      laravelEcho.leave('user.transaction.transactionNumber.' + userId.value)
      // stop listening to the santos card retry channel
      laravelEcho.leave('santoscard.retry.' + companyId.value + '.' + userId.value)
      // stop the worker
      worker.terminate()
    })
    function joinChannels () {
      if (companyId.value <= 0) { return }
      // listen to the general itemStock change event
      laravelEcho.join('itemStock.changed.' + companyId.value).listen('.company.itemStock.changed', (param: IEncapsulatedIntermediateItemStockUpdated) => {
        // check again for company
        if (param.intermediateItemStockUpdated?.company_id !== companyId.value) {
          return
        }
        // check if the itemStock is the currently selected one
        if (param.intermediateItemStockUpdated.itemStock_id !== selectedItemStock?.value?.id) {
          return
        }
        // check for anything else
        if (selectedItemStock.value === undefined || !canSeeItemStock.value) {
          return
        }
        // update the changed items
        if (param.intermediateItemStockUpdated?.itemStockItems !== undefined && param.intermediateItemStockUpdated.itemStockItems?.length > 0) {
          for (let i = 0; i < selectedItemStock?.value?.item_stock_items?.length; i++) {
            const itemStockItemToUpdate = selectedItemStock?.value?.item_stock_items?.find((itemStockItem) => itemStockItem.item_id === param.intermediateItemStockUpdated?.itemStockItems?.[i].item_id)
            if (itemStockItemToUpdate !== undefined) {
              itemStockItemToUpdate.current_amount = +param.intermediateItemStockUpdated?.itemStockItems?.[i]?.current_amount
            }
          }
        }
        // update the changed itemTypes
        if (param.intermediateItemStockUpdated?.itemStockItemTypes !== undefined && param.intermediateItemStockUpdated.itemStockItemTypes?.length > 0) {
          for (let i = 0; i < selectedItemStock?.value?.item_stock_item_types?.length; i++) {
            const itemStockItemTypeToUpdate = selectedItemStock?.value?.item_stock_item_types?.find((itemStockItemType) => itemStockItemType.item_type_id === param.intermediateItemStockUpdated?.itemStockItemTypes?.[i].item_type_id)
            if (itemStockItemTypeToUpdate !== undefined) {
              itemStockItemTypeToUpdate.current_amount = +param.intermediateItemStockUpdated?.itemStockItemTypes?.[i]?.current_amount
            }
          }
        }
      })
    }
    function joinSantosCardRetryChannel () {
      if (userId.value <= 0 || companyId.value <= 0) return
      laravelEcho.private('santoscard.retry.' + companyId.value + '.' + userId.value).listen('.company.santoscard.retry', (retryToken: { retryToken: string }) => {
        $q.dialog({
          component: SantosCardRetryDialog,
          componentProps: {
            token: retryToken.retryToken,
            companyId: companyId.value
          }
        })
      })
    }
    function joinReloadChannel () {
      if (userId.value <= 0) { return }
      // listen to the change event
      laravelEcho.private('user.reload.' + userId.value)
        .listen('.user.reload', (cb: IGeneralReloadNotification) => {
          disableTransactionButton.value = false
          // reset everything
          if (cb.userNotification.type === ReloadType.Success.valueOf()) {
            resetStuffAfterTransaction()
          }
        })
    }
    function joinInvoiceNumberChannel () {
      if (userId.value <= 0) return
      laravelEcho.private('user.transaction.transactionNumber.' + userId.value)
        .listen('.user.transaction.transactionNumber', (tn: { transactionNumberInformation: ITransactionNumberInformation }) => {
          // check for the company and user that and only do something if it's the same
          if (tn.transactionNumberInformation.userId !== userId.value || tn.transactionNumberInformation.companyId !== companyId.value) return
          transactionNumber.value = tn.transactionNumberInformation.transactionNumber
          loadingTransactionNumber.value = false
        })
    }
    function getPermissions () {
      loadingPermissions.value = true
      if (companyId.value <= 0) { return }
      api.get('/api/policies/cashRegister/oldFoodCashRegister/' + companyId.value)
        .then((res) => {
          AssignPolicies([
            { policyName: 'CashRegister_Discounts', policyToAssign: canSeeDiscounts },
            { policyName: 'CashRegister_Item_Stocks', policyToAssign: canSeeItemStock },
            { policyName: 'CashRegister_Withdraw', policyToAssign: canMakeEmployeeWithdrawal },
            { policyName: 'CashRegister_Note', policyToAssign: canAddNote }
          ], res.data.cashRegisterPolicies)
          loadingPermissions.value = false
        })
        .catch((error) => {
          console.error(error)
        })
    }
    function checkCashRegisterStore () {
      if (companyId.value <= 0) return
      // try to load from the store
      useCashRegisterStateStore.getStoreFromLocalStorage(companyId.value)
      // check if store is currently set
      if (useCashRegisterStateStore.companyId !== undefined && useCashRegisterStateStore.companyId > 0) {
        // set the store values
        loadCashRegisterStore()
      } else if (companyId.value !== undefined && companyId.value > 0) {
        // create the new store basics
        useCashRegisterStateStore.createBasicStore(companyId.value)
        loadCashRegisterStore()
      }
      registerCashRegisterStoreWebWorker()
    }
    function registerCashRegisterStoreWebWorker () {
      worker.onmessage = (event: MessageEvent<{ date: string, updatedState: IOldFoodCashRegisterState }>) => {
        lastStateSave.value = event.data.date
        useCashRegisterStateStore.updateStore(companyId.value, event.data.updatedState)
      }
      const interval = 1500
      // create the interval
      setInterval(() => {
        // check that the last state save really is the timeout time ago
        if (lastStateSave.value !== undefined) {
          const lastStateSaveDate = new Date(lastStateSave.value)
          const now = new Date()
          const diff = now.getTime() - lastStateSaveDate.getTime()
          if (diff > interval) {
            worker.postMessage({
              state: {
                companyId: toRaw(companyId.value ?? undefined),
                selectedDiscount: toRaw(selectedDiscount.value ?? undefined),
                keepDiscountSelected: toRaw(keepDiscountSelected.value ?? undefined),
                selectedItemStock: toRaw(selectedItemStock.value ?? undefined),
                useDefaultItemStock: toRaw(useDefaultItemStock.value ?? undefined),
                amountGiven: toRaw(amountGiven.value ?? undefined),
                note: toRaw(note.value ?? undefined),
                santosCardCode: toRaw(santosCardCode.value ?? undefined),
                availableItems: toRaw(availableItems.value ?? undefined)
              },
              companyId: toRaw(companyId.value)
            })
          }
        } else {
          worker.postMessage({
            state: {
              companyId: toRaw(companyId.value ?? undefined),
              selectedDiscount: toRaw(selectedDiscount.value ?? undefined),
              keepDiscountSelected: toRaw(keepDiscountSelected.value ?? undefined),
              selectedItemStock: toRaw(selectedItemStock.value ?? undefined),
              useDefaultItemStock: toRaw(useDefaultItemStock.value ?? undefined),
              amountGiven: toRaw(amountGiven.value ?? undefined),
              note: toRaw(note.value ?? undefined),
              santosCardCode: toRaw(santosCardCode.value ?? undefined),
              availableItems: toRaw(availableItems.value ?? undefined)
            },
            companyId: toRaw(companyId.value)
          })
        }
      }, interval)
    }
    function loadCashRegisterStore () {
      // check if store has values that can be loaded
      if (useCashRegisterStateStore.companyId === companyId.value) {
        // load the values
        // check for the discount
        if (useCashRegisterStateStore.selectedItemStock !== undefined && Object.keys(useCashRegisterStateStore.selectedItemStock).length > 0) {
          selectedItemStock.value = useCashRegisterStateStore.selectedItemStock
        }
        // check for the discount keep flag
        if (useCashRegisterStateStore.keepDiscountSelected) {
          keepDiscountSelected.value = useCashRegisterStateStore.keepDiscountSelected
        }
        // check for the discount
        if (useCashRegisterStateStore.selectedDiscount !== undefined) {
          selectedDiscount.value = useCashRegisterStateStore.selectedDiscount
        }
        // check for the amount given
        if (useCashRegisterStateStore.amountGiven !== undefined) {
          amountGiven.value = useCashRegisterStateStore.amountGiven
        }
        // check for the note
        if (useCashRegisterStateStore.note !== undefined) {
          note.value = useCashRegisterStateStore.note
        }
        // check for the santos card code
        if (useCashRegisterStateStore.santosCardCode !== undefined) {
          santosCardCode.value = useCashRegisterStateStore.santosCardCode
        }
      }
    }
    function checkForDefaultItemStock () {
      loadingDefaultItemStock.value = true
      if (companyId.value <= 0) {
        return
      }
      // check if we need to get the default itemStock
      if ((useCashRegisterStateStore && useCashRegisterStateStore.companyId === companyId.value) && useCashRegisterStateStore.selectedItemStock !== undefined && Object.keys(useCashRegisterStateStore.selectedItemStock).length > 0) {
        // set the default itemStock from the store
        if (Object.keys(useCashRegisterStateStore.selectedItemStock).length === 0) {
          defaultItemStock.value = undefined
          selectedItemStock.value = undefined
        } else {
          defaultItemStock.value = useCashRegisterStateStore.selectedItemStock
          selectedItemStock.value = useCashRegisterStateStore.selectedItemStock
        }
        useDefaultItemStock.value = useCashRegisterStateStore.useDefaultItemStock ?? true
        loadingDefaultItemStock.value = false
        return
      }
      api.get('/api/itemStocks/reducedForDefault/' + companyId.value)
        .then((response) => {
          if (response.data !== null) {
            defaultItemStock.value = response.data
            selectedItemStock.value = defaultItemStock.value
            useDefaultItemStock.value = true
            useCashRegisterStateStore.selectedItemStock = defaultItemStock.value
            useCashRegisterStateStore.useDefaultItemStock = true
          }
          loadingDefaultItemStock.value = false
        })
        .catch((error) => {
          console.error(error)
        })
    }
    function getAllAvailableItems () {
      loadingItems.value = true
      if (companyId.value <= 0) {
        return
      }
      api.get('/api/items/reducedForOldFoodCashRegister/' + companyId.value)
        .then((res) => {
          if (res.data !== null) {
            availableItems.value = res.data
            // set the default item Amount to 0
            const cashRegisterStoreSet = useCashRegisterStateStore.availableItems !== undefined &&
              useCashRegisterStateStore.availableItems.length > 0
            availableItems.value?.forEach((item : IItem) => {
              if (cashRegisterStoreSet) {
                // check if the item is in the store
                const itemInStore: IItem | undefined = useCashRegisterStateStore.availableItems?.find((itemInStore: IItem) => itemInStore.id === item.id)
                if (itemInStore !== undefined && !item.menu) {
                  item.amount = +itemInStore.amount
                } else if (itemInStore !== undefined && item.menu) {
                  item.item_menus = itemInStore.item_menus
                } else {
                  item.amount = 0
                }
              } else {
                item.amount = 0
              }
              if (item.item_menu_categories !== undefined) {
                item.item_menu_categories.forEach((itemMenuCategory) => {
                  itemMenuCategory.item_category?.items?.forEach((item) => {
                    if (cashRegisterStoreSet) {
                      // check if the item is in the store
                      const itemInStore = useCashRegisterStateStore.availableItems?.find((itemInStore) => itemInStore.id === item.id)
                      if (itemInStore !== undefined) {
                        item.amount = +itemInStore.amount
                      } else {
                        item.amount = 0
                      }
                    } else {
                      item.amount = 0
                    }
                  })
                })
              }
            })
            // sort the items by the order_number field
            availableItems.value?.sort((a, b) => {
              if (a.order_number === undefined || b.order_number === undefined) {
                return 0
              }
              return a.order_number - b.order_number
            })
          }
          loadingItems.value = false
        })
        .catch((error) => {
          console.error(error)
        })
    }
    function getTransactionNumber () {
      loadingTransactionNumber.value = true
      if (companyId.value <= 0) {
        return
      }
      api.get('/api/invoice-number/self/' + companyId.value)
        .then((res) => {
          transactionNumber.value = res.data
          loadingTransactionNumber.value = false
        })
        .catch((error) => {
          console.error(error)
          loadingTransactionNumber.value = false
        })
    }
    function filterDiscounts (val: string, update: (val: () => void) => void) {
      if (availableDiscounts.value !== undefined) {
        update(() => {
          const needle = val.toLowerCase()
          availableOptionDiscounts.value =
            availableDiscounts.value?.filter((discount) => discount.name.toLowerCase().indexOf(needle) > -1)
        })
        return
      }
      api.get('/api/discounts/reducedForCashRegister/' + companyId.value)
        .then((response) => {
          availableDiscounts.value = response.data
          const needle = val.toLowerCase()
          availableOptionDiscounts.value =
            availableDiscounts.value?.filter((discount) => discount.name.toLowerCase().indexOf(needle) > -1)
        })
        .catch((error) => {
          console.error(error)
        })
    }
    function filterItemStocks (val: string, update: (val: () => void) => void) {
      if (availableItemStocks.value !== undefined) {
        update(() => {
          const needle = val.toLowerCase()
          availableOptionItemStocks.value =
            availableItemStocks.value?.filter((itemStock: IItemStock) => itemStock.name.toLowerCase().indexOf(needle) > -1)
        })
        return
      }
      api.get('/api/itemStocks/reducedForCashRegister/' + companyId.value)
        .then((response) => {
          availableItemStocks.value = response.data.itemStocks
          const needle = val.toLowerCase()
          availableOptionItemStocks.value =
            availableItemStocks.value?.filter((itemStock: IItemStock) => itemStock.name.toLowerCase().indexOf(needle) > -1)
        })
        .catch((error) => {
          console.error(error)
        })
    }
    function getNewTransactionNumber () {
      loadingTransactionNumber.value = true
      api.get('/api/invoice-number/regen/' + companyId.value + '?explicitNewNumber=true')
        .catch((error) => {
          console.error(error)
          loadingTransactionNumber.value = false
        })
    }
    function getSantosCardSetting () {
      if (companyId.value <= 0) return
      api.get('/api/santosCard/cashRegister/' + companyId.value)
        .then((res) => {
          santosCardSettings.value = res.data
        }).catch((error) => {
          console.error(error)
        })
    }
    function addCustomAmountToItem (item: IItem, amount: number) {
      item.amount += amount
    }
    function setGivenToTotal () {
      amountGiven.value = total.value
    }
    function createTransaction () {
      if (companyId.value <= 0) return
      if (santosCardSettings.value && santosCardSettings.value?.enabled) {
        if (santosCardCode.value !== undefined && (santosCardCode.value < 100000 || santosCardCode.value > 999999)) {
          $q.notify({
            type: 'negative',
            message: 'Der Santos Card Code muss mindestens 6 Zeichen lang sein',
            position: 'center'
          })
          return
        }
      }
      // check if santos card and total is the same
      if (santosCardCode.value !== undefined && santosCardCode.value === total.value) {
        // ask the user if he really wants to do this
        $q.dialog({
          component: ConfirmationDialog,
          componentProps: {
            title: 'Santos Card Code und Gesamt sind gleich',
            message: 'Mit ist aufgefallen, dass der Santos Card Code und die Gesamt Summe gleich sind. Möchtest du wirklich fortfahren?',
            confirmLabel: 'Ja',
            cancelLabel: 'Upsi, ne lieber nicht'
          }
        }).onOk(() => {
          sendTransactionToBackend()
        })
      }
      sendTransactionToBackend()
    }
    function sendTransactionToBackend () {
      // first create the items array
      const transactionItems: ITransactionItem[] = []
      transactionItems.push(...availableItems.value?.filter((item: IItem) => item.amount > 0 && !item.is_menu).map((item: IItem) => {
        return {
          item_id: item.id,
          amount: item.amount
        }
      }) ?? [])
      // then add the menu items
      transactionItems.push(...availableItems.value?.filter((item: IItem) => item.menu && (item.item_menus?.length ?? -1 > 0)).map((item: IItem) => {
        return {
          item_id: item.id,
          amount: item.item_menus?.length ?? 0,
          item_menus: item.item_menus,
          menu: true
        }
      }) ?? [])

      // then create the transaction object
      const transaction: ITransaction = {
        item_stock_id: selectedItemStock.value?.id,
        discount_id: selectedDiscount.value?.id,
        items: transactionItems,
        amount_given: +amountGiven.value,
        notes: note.value?.length ?? -1 > 0 ? note.value : null,
        type: TransactionType.Sale,
        santos_card_code: santosCardCode.value
      }
      disableTransactionButton.value = true
      api.post('/api/transaction/create/foodCashRegister/' + companyId.value, {
        ...transaction
      })
        .catch((error) => {
          console.error(error)
          disableTransactionButton.value = false
        })
    }
    function createUserWithdraw () {
      if (companyId.value <= 0) return
      // first create the items array
      const transactionItems: ITransactionItem[] = []
      transactionItems.push(...availableItems.value?.filter((item: IItem) => item.amount > 0 && !item.is_menu).map((item: IItem) => {
        return {
          item_id: item.id,
          amount: item.amount
        }
      }) ?? [])
      // then add the menu items
      transactionItems.push(...availableItems.value?.filter((item: IItem) => item.menu && (item.item_menus?.length ?? -1 > 0)).map((item: IItem) => {
        return {
          item_id: item.id,
          amount: item.item_menus?.length ?? 0,
          item_menus: item.item_menus,
          menu: true
        }
      }) ?? [])

      // then create the transaction object
      const transaction = {
        item_stock_id: selectedItemStock.value?.id,
        items: transactionItems,
        notes: note.value,
        type: TransactionType.UserWithdrawal
      }
      api.post('/api/transaction/create/employeeWithdraw/' + companyId.value, {
        ...transaction
      })
        .catch((error) => {
          console.error(error)
        })
    }
    function resetItemAmount () {
      availableItems.value?.forEach((item: IItem) => {
        item.amount = 0
      })
      resetMenus()
    }
    function resetDiscount () {
      if (!keepDiscountSelected.value) {
        selectedDiscount.value = undefined
      }
    }
    function resetAll () {
      // reset the item amount
      resetItemAmount()
      // reset the discount
      keepDiscountSelected.value = false
      selectedDiscount.value = undefined
      // reset the money
      resetMoney()
      // reset the menus
      resetMenus()
      // reset the state
      useCashRegisterStateStore.clearStore(companyId.value)
      // reset the santos card code
      resetSantosCard()
      // reset the note
      resetNote()
      disableTransactionButton.value = false
    }
    function resetMoney () {
      amountGiven.value = 0
    }
    function resetMenus () {
      availableItems.value?.forEach((item: IItem) => {
        item.item_menus = undefined
      })
    }
    function resetSantosCard () {
      santosCardCode.value = undefined
    }
    function resetNote () {
      note.value = undefined
    }
    function resetStuffAfterTransaction () {
      // reset the item amount
      resetItemAmount()
      // reset the discount
      resetDiscount()
      // reset the money
      resetMoney()
      // reset the menus
      resetMenus()
      // reset the santos card code
      resetSantosCard()
      // get the new transaction number
      getTransactionNumber()
      // reset the note
      resetNote()
      // reset the state
      useCashRegisterStateStore.clearStore(companyId.value)
      disableTransactionButton.value = false
    }
    function getCurrentSelectedItemStockAmounts () {
      if (selectedItemStock.value !== undefined && selectedItemStock.value?.id > 0 && canSeeItemStock) {
        api.post('/api/itemStocks/reducedWithContentForCashRegister/' + companyId.value, {
          item_stock_id: selectedItemStock.value.id
        })
          .then((res) => {
            if (res.data.item_stock !== null && res.data.item_stock !== undefined && selectedItemStock.value?.id === res.data.item_stock.id) {
              selectedItemStock.value = res.data.item_stock
            }
          })
          .catch((error) => {
            console.error(error)
          })
      }
    }
    function calculateProductTotal (item: IItem): number {
      if (item.discount_available && selectedDiscount.value !== undefined && selectedDiscount.value !== null) {
        return Math.round(item.amount * item.selling_price - ((item.amount * item.selling_price) * (selectedDiscount.value?.amount / 100)))
      }
      return item.amount * item.selling_price
    }
    function showConfigureMenuDialog (currentItem: IItem) {
      $q.dialog({
        component: ConfigureMenuDialog,
        componentProps: {
          item: currentItem
        }
      })
        .onOk((itemMenu) => {
          // add the menu to the item
          if (currentItem.item_menus === undefined) {
            currentItem.item_menus = []
          }
          currentItem.item_menus?.push(itemMenu)
        })
    }
    function removeMenuFormItemMenu (item: IItem, itemMenu: IItemMenu) {
      item.item_menus?.splice(item.item_menus?.indexOf(itemMenu), 1)
    }
    function editMenuFormItemMenu (itm: IItem, itmMenu: IItemMenu) {
      $q.dialog({
        component: ConfigureMenuDialog,
        componentProps: {
          item: itm,
          itemMenu: itmMenu,
          editing: true
        }
      })
        .onOk((itemMenu) => {
          // apply the changes
          if (itm.item_menus !== undefined) {
            const index = itm.item_menus?.indexOf(itemMenu)
            itm.item_menus[index] = itemMenu
          }
        })
    }
    watch(() => selectedItemStock.value?.id, () => {
      getCurrentSelectedItemStockAmounts()
    })
    return {
      availableDiscounts,
      availableOptionDiscounts,
      selectedDiscount,
      keepDiscountSelected,
      selectedItemStock,
      filterDiscounts,
      filterItemStocks,
      canMakeCustomTaxation,
      canAddNote,
      canMakeEmployeeWithdrawal,
      canSeeDiscounts,
      total,
      amountGiven,
      availableItemStocks,
      availableOptionItemStocks,
      useDefaultItemStock,
      loadingPermissions,
      loadingDefaultItemStock,
      note,
      availableItems,
      loadingItems,
      addCustomAmountToItem,
      setGivenToTotal,
      defaultItemStock,
      transactionNumber,
      loadingTransactionNumber,
      getNewTransactionNumber,
      createTransaction,
      resetItemAmount,
      canSeeItemStock,
      calculateProductTotal,
      showConfigureMenuDialog,
      removeMenuFormItemMenu,
      editMenuFormItemMenu,
      santosCardSettings,
      santosCardCode,
      lastStateSave,
      refreshCounterClickCount,
      resetAll,
      disableTransactionButton,
      createUserWithdraw
    }
  }
})
</script>

<style scoped>
.article-container-base {
  border-radius: 0.3rem;
  border: 1px solid #ffffff1e;
  color: #e7e7e7;
}
</style>
