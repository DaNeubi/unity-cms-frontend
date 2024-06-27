<template>
  <div class="row q-gutter-md">
    <q-select v-model="selectedContract"
              :options="availableContracts"
              outlined
              class="col-sm-12 col-md-10 col-lg-8"
              :option-value="(opt) => opt.id"
              :option-label="(contract) => (contract.b2b === 1 ? contract.customer_company.name + '🏢' : contract.customer) + ' | ' + contract.name"
              label="Vertrag auswählen"
              clearable/>
    <div class="col-sm-0 col-md-2 col-lg-4"></div>
    <div class="row col-12 q-gutter-md">
      <create-something-new-button text="Buchen"
                                   class="col-sm-2 col-md-auto col-lg-auto"
                                   :disable="bookButtonState"
                                   @create-something-new="createTransaction()"
                                   con="mdi-clipboard-plus"/>
      <q-select v-model="selectedItemStock" :options="availableItemStocks" outlined
                class="col-sm-10 col-md-7 col-lg-7" clearable label="Lager, aus dem genommen werden soll"
                :option-value="(opt) => opt.id" :option-label="(opt) => `${ opt.name } ${ opt.is_default ? '(Standard)' : '' }`"
                :disable="selectedContract === null"
                hint="Wenn nichts aus einem Lager genommen werden soll, einfach leer lassen 🙂">
      </q-select>
    </div>
    <div class="col-12" v-if="(selectedContract !== null) && selectedContract?.contract_items === undefined">
      <q-skeleton class="q-mb-md q-mt-md" height="50px" width="100%"/>
    </div>
    <q-table v-if="selectedContract?.contract_items !== undefined"
             :columns="columns"
             class="col-12 cms-sticky-header-table"
             :pagination="{ rowsPerPage: 30 }"
             :rows="selectedContract?.contract_items">
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td v-for="headerVal in columns"
                :key="headerVal.name" :props="props">
            <div v-if="headerVal.name === 'item'">
              {{ props.row.item.name }}
            </div>
            <div v-else-if="headerVal.name === 'amount'" class="cursor-pointer">
              <span :class="(props.row.min_active ? props.row.amount < props.row.min_amount ? 'text-red-5' : '' : '') || (props.row.max_active ? props.row.amount > props.row.max_amount ? 'text-red-5' : '' : '')">
                {{ props.row[headerVal.name] }}
              </span>
              <q-popup-edit v-model="props.row[headerVal.name]"
                            v-slot="scope"
                            buttons label-set="Aktualisieren"
                            @save="(val) => props.row[headerVal.name] = val"
                            label-cancel="Abbrechen">
                <q-input v-model.number="scope.value"
                         outlined label="Anzahl" type="number"
                         :rules="[val => (props.row.min_active ? val >= props.row.min_amount : true) || 'Es wurde ein Minimum angegeben', val => (props.row.max_active ? val <= props.row.max_amount : true) || 'Es wurde ein Maximum angegeben']"
                         :max="props.row.max_active ? props.row.max_amount : null"
                         reactive-rules
                         :min="props.row.min_active ? props.row.min_amount : 0"/>
              </q-popup-edit>
            </div>
            <div v-else-if="headerVal.name === 'max_active'">
              {{ props.row[headerVal.name] === 0 ? 'Nein' : props.row.max_amount }}
            </div>
            <div v-else-if="headerVal.name === 'min_active'">
              {{ props.row[headerVal.name] === 0 ? 'Nein' : props.row.min_amount }}
            </div>
            <div v-else>
              {{ props.row[headerVal.name] }}
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <q-input type="textarea"
             label="Notiz"
             outlined
             counter
             maxlength="500"
             class="col-12"
             :disable="selectedContract === null"
             v-model="note"/>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import { api } from 'boot/axios'
import IItemStock from '../../misc/interfaces/Item/IItemStock'
import IContract from '../../misc/interfaces/Contract/IContract'

const selectedContract = ref<IContract | null>(null)
const availableContracts = ref<IContract[]>()
const selectedItemStock = ref<IItemStock>()
const availableItemStocks = ref<IItemStock[]>()
const bookButtonState = computed(() => {
  if (selectedContract.value === null) return true
  // check if all items amount is lower than the max_amount if max_active is true
  return selectedContract.value?.contract_items?.some((item) => item.max_active && item.amount > item.max_amount) ||
    // check if all items amount is higher than the min_amount if min_active is true
    selectedContract.value?.contract_items?.some((item) => item.min_active && item.amount < item.min_amount) ||
    // check if all items amount is 0
    selectedContract.value?.contract_items?.every((item) => +item.amount === 0)
})
const note = ref<string>()
const columns = [{ name: 'item', field: 'item', label: 'Artikel' },
  { name: 'amount', field: 'amount', label: 'Anzahl' },
  { name: 'max_active', field: 'max_active', label: 'Maximal' },
  { name: 'min_active', field: 'min_active', label: 'Minimal' }]

const props = defineProps({
  companyId: {
    type: Number,
    required: true
  }
})

onMounted(() => {
  getContracts()
  getItemStocks()
})

watch(selectedContract, () => {
  if (selectedContract.value === null) return
  loadContractInformation()
})

defineExpose({
  resetOnTransaction
})

function getContracts () {
  if (props.companyId <= 0) return
  api.get('/api/contract/reducedForContractList/' + props.companyId)
    .then((res) => {
      availableContracts.value = res.data
    })
    .catch((error) => {
      console.error(error)
    })
}
function getItemStocks () {
  if (props.companyId <= 0) return
  api.get('/api/itemStocks/reducedForCashRegister/' + props.companyId)
    .then((res) => {
      availableItemStocks.value = res.data.itemStocks

      // check if a default item stock is available
      if (availableItemStocks.value?.some((itemStock: IItemStock) => itemStock.is_default)) {
        const defaultItemStock = availableItemStocks.value?.find((itemStock: IItemStock) => itemStock.is_default)
        if (defaultItemStock !== undefined) {
          selectedItemStock.value = defaultItemStock
        }
      }
    })
    .catch((error) => {
      console.error(error)
    })
}
function loadContractInformation () {
  if (props.companyId <= 0 || selectedContract.value === null) return
  api.get('/api/contract/details/' + props.companyId + '?contract_id=' + selectedContract.value?.id)
    .then((res) => {
      if (selectedContract.value !== null && selectedContract.value !== undefined) {
        selectedContract.value.contract_items = res.data.contractItems
        selectedContract.value.contract_setting = res.data.contractSetting
      }
    })
    .catch((error) => {
      console.error(error)
    })
}
function createTransaction () {
  if (selectedContract.value === null || props.companyId <= 0) return
  api.post('/api/contract/book/' + props.companyId, {
    contract_id: selectedContract.value?.id,
    note: note.value,
    items: selectedContract.value?.contract_items?.filter((item) => item.amount > 0).map((item) => {
      return {
        item_id: item.item_id,
        amount: item.amount
      }
    }),
    item_stock_id: selectedItemStock.value?.id
  })
    .catch((error) => {
      console.error(error)
    })
}

function resetOnTransaction () {
  note.value = ''
  selectedContract.value = null
}

</script>

<style scoped>

</style>
