<template>
  <div class="row q-gutter-md content-center">
    <q-select v-model="selectedContract" :options="availableContracts" outlined
              :option-label="contract => (contract.b2b === 1 ? contract.customer_company.name + '🏢' : contract.customer) + ' | ' + contract.name + ' | ($' + contract?.stale_money + ')'"
              label="Vertrag auswählen" class="col-7" @clear="clearSelectedContract()" clearable/>
    <div class="hint-text col-12">
      Hinweis: Trinkgeld gibt es nicht. Verträge können nur 1:1 abgerechnet werden
    </div>
    <div v-if="availableContracts?.length > 0" class="text-h6 text-orange-5 col-auto">
      Gesamt offen: ${{ availableContracts?.reduce((acc, contract) => acc + (contract === undefined ? 0 : contract.stale_money ?? 0 ) ?? 0, 0) }}
    </div>
    <div class="col-12">
      <div class="row items-center q-gutter-md">
        <create-something-new-button text="ABRECHNEN" icon="mdi-cash-register" v-if="canCreate"
                                     @create-something-new="createBilling()"
                                     :disable="billingButtonState" class="col-auto"/>
        <div class="col-auto text-h6" v-if="canCreate">
          Gesamt: ${{ total }}
        </div>
        <q-checkbox v-model="customBillingDate" v-if="canCreate"
                    label="Heutigen Tag als Abrechnungstag setzen"/>
        <delete-something-button text="Ausgewählte löschen" :disable="billingButtonState"
                                 v-if="canDelete" @create-something-new="deleteTransactions" class="col-auto"/>
      </div>
    </div>
    <q-table class="default-table-height col-12 cms-sticky-header-table"
             title="Buchungen in diesem Vertrag" virtual-scroll
             :columns="columns" :pagination="{ rowsPerPage: 30 }" :selection="(canDelete || canCreate) ? 'multiple' : 'none'"
             :rows="selectedContract?.contract_transactions" row-key="id"
             v-if="selectedContract?.contract_transactions !== undefined"
             v-model:selected="selectedTransactions">
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td v-if="(canDelete || canCreate)">
            <q-checkbox color="accent" v-model="props.selected"/>
          </q-td>
          <q-td v-for="headerVal in columns" :key="headerVal.name" :props="props">
            <div v-if="headerVal.name === 'created_at'">
              {{ FormatDateTime(props.row[headerVal.name]) }}
            </div>
            <div v-else-if="headerVal.name === 'items'">
              <q-chip v-for="item in props.row.contract_on_hold_transaction_items"
                      :key="item.id" color="secondary" text-color="white" icon="mdi-baguette">
                {{ item.amount }}x {{ item.item.name }}
              </q-chip>
            </div>
            <div v-else-if="headerVal.name === 'user_id'">
              {{ props.row.user?.first_name + ' ' + props.row.user?.last_name }}
            </div>
            <div v-else-if="headerVal.name === 'total'">
              ${{ props.row[headerVal.name] }}
            </div>
            <div v-else-if="headerVal.name === 'discount_amount'">
              {{ props.row[headerVal.name] }}%
            </div>
            <div v-else>
              {{ props.row[headerVal.name] }}
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <q-skeleton v-if="(selectedContract !== null || selectedContract !== undefined) && selectedContract?.contract_transactions === undefined"
                class="col-12"/>
    <ContractBillingTipComponent :selected-transactions="selectedTransactions" class="col-12"
                                 v-if="hasTipModule && (selectedContract !== null || selectedContract !== undefined) && selectedTransactions !== undefined"/>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import IContract from '../../misc/interfaces/Contract/IContract'
import IContractOnHoldTransaction from '../../misc/interfaces/Contract/IContractOnHoldTransaction'
import { api } from 'boot/axios'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import FormatDateTime from '../../misc/functions/FormatDateTime'
import DeleteSomethingButton from 'components/general/buttons/DeleteSomethingButton.vue'
import ContractBillingTipComponent from 'components/contracts/ContractBillingTipComponent.vue'

const selectedContract = ref<IContract>()
const availableContracts = ref<IContract[]>([])
const billingButtonState = computed(() => {
  if (selectedContract.value !== null && selectedContract.value !== undefined) {
    if (selectedTransactions.value === null || selectedTransactions.value === undefined) return true
    return selectedTransactions.value.length <= 0
  }
  return true
})
const total = computed(() => {
  if (selectedContract.value === null || selectedContract.value === undefined || selectedTransactions.value === undefined) return 0
  let total = 0
  selectedTransactions.value?.forEach((transaction) => {
    total += transaction.total
  })
  return total
})
const customBillingDate = ref(false)
const selectedTransactions = ref<IContractOnHoldTransaction[]>()
const columns = [
  { name: 'total', label: 'Preis', field: 'total' },
  { name: 'items', label: 'Produkte', field: 'items' },
  { name: 'created_at', label: 'Datum der Buchung', field: 'created_at' },
  { name: 'discount_amount', label: 'Prozente', field: 'discount_amount' },
  { name: 'note', label: 'Notiz', field: 'note' },
  { name: 'user_id', label: 'Gebucht von', field: 'user_id' }
]

const props = defineProps({
  companyId: {
    type: Number,
    required: true
  },
  canDelete: {
    type: Boolean,
    required: false,
    default: false
  },
  canCreate: {
    type: Boolean,
    required: false,
    default: false
  },
  hasTipModule: {
    type: Boolean,
    required: false,
    default: false
  }
})

onMounted(() => {
  getAllContracts()
})

watch(selectedContract, () => {
  getContractTransactions()
})

watch(() => props.companyId, () => {
  getAllContracts()
})

defineExpose({
  resetTransactions
})

function getAllContracts () {
  if (props.companyId <= 0) return
  api.get('/api/contract/reducedForContractBilling/' + props.companyId)
    .then((res) => {
      availableContracts.value = res.data
    }).catch((err) => {
      console.error(err)
    })
}

function getContractTransactions () {
  if (selectedContract.value === null || selectedContract.value === undefined) return
  api.get('/api/contract/transactionsForBilling/' + props.companyId + '?contract_id=' + selectedContract.value?.id)
    .then((res) => {
      if (selectedContract.value === null || selectedContract.value === undefined) return
      selectedContract.value.contract_transactions = res.data
    })
    .catch((err) => {
      console.error(err)
    })
}

function clearSelectedContract () {
  selectedContract.value = null
  selectedTransactions.value = undefined
}

function createBilling () {
  if (selectedContract.value === null || selectedContract.value === undefined) return
  if (props.companyId <= 0) return
  const returnTransactions = selectedTransactions.value?.map((transaction) => {
    return {
      id: transaction.id
    }
  })
  api.post('/api/contract/createTransaction/' + props.companyId, {
    contract_id: selectedContract.value?.id,
    custom_date: customBillingDate.value,
    on_hold_transactions: returnTransactions
  }).catch((err) => {
    console.error(err)
  })
}

function resetTransactions () {
  selectedTransactions.value = undefined
  if (selectedContract.value === null || selectedContract.value === undefined) return
  selectedContract.value.contract_transactions = undefined
  // get the remaining transactions if any
  getContractTransactions()
}

function deleteTransactions () {
  if (selectedContract.value === null || selectedContract.value === undefined) return
  if (props.companyId <= 0) return
  const returnTransactions = selectedTransactions.value?.map((transaction) => {
    return {
      id: transaction.id
    }
  })
  api.post('/api/contract/deleteTransaction/' + props.companyId, {
    contract_id: selectedContract.value?.id,
    on_hold_transactions: returnTransactions
  })
    .catch((err) => {
      console.error(err)
    })
}

</script>

<style scoped>

</style>
