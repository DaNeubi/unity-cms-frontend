<template>
  <div class="row q-gutter-md">
    <q-table class="col-12 cms-sticky-header-table" flat
             title="B2B Anfragen"
             row-key="id" bordered
             :pagination="{ rowsPerPage: 10 }"
             :rows="allB2bRequests"
             :columns="requestColumns">
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th auto-width />
          <q-th
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td auto-width>
            <q-btn size="sm" color="accent" round dense
                   @click="props.expand = !props.expand"
                   :icon="`mdi-${props.expand ? 'arrow-collapse' : 'arrow-expand'}`"/>
          </q-td>
          <q-td v-for="headerVal in props.cols"
                :key="headerVal.name" :props="props">
            <div v-if="headerVal.name === 'requesting_company'">
              {{ props.row.contract?.company?.name }}
            </div>
            <div v-else-if="headerVal.name === 'status'">
              <q-chip :label="convertB2BStatus(props.row.status)" :color="getStatusColor(props.row.status)"/>
            </div>
            <div v-else-if="headerVal.name === 'requesting_user'">
              {{ props.row.user?.first_name }} {{ props.row.user?.last_name }}
            </div>
            <div v-else-if="headerVal.name === 'status_changed'">
              {{ FormatDateTime(props.row.updated_at) }}
            </div>
            <div v-else-if="headerVal.name === 'responding_user'">
              {{ props.row.respondedUser?.first_name }} {{ props.row.respondedUser?.last_name }}
            </div>
            <div v-else>
              {{ FormatDateTime(props.row[headerVal.field]) }}
            </div>
          </q-td>
        </q-tr>
        <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%">
            <div class="row q-gutter-sm items-center">
              <q-chip class="col-auto" :label="`Name: ` + props.row.contract?.name" color="accent"/>
              <q-chip class="col-auto" :label="`Beschreibung: ` + props.row.contract?.description ?? '-Leer-'" color="accent"/>
              <q-chip class="col-auto" :label="`Start Datum: ` + FormatDateTime(props.row.contract?.start_date, true)" color="accent"/>
              <q-chip class="col-auto" :label="`Zahlungs Start Datum: ` + FormatDateTime(props.row.contract?.billing_start_date, true)" color="accent"/>
              <q-chip class="col-auto" :label="`Zahlungs Periode: ` + props.row.contract?.billing_duration / 1440 + ` Tag(e)`" color="accent"/>
              <q-chip class="col-auto" :label="`Rabatt: ` + Math.floor(parseFloat(props.row.contract?.discount_amount)) + `%`" color="accent"/>
              <edit-something-button class="col-auto" v-if="props.row.status === 1"
                                     @create-something-new="updateB2BRequestStatus(props.row, 2)"
                                     text="Annehmen" icon="mdi-check-bold"/>
              <delete-something-button class="col-auto" v-if="props.row.status === 1"
                                       @create-something-new="updateB2BRequestStatus(props.row, 3)"
                                       text="Ablehnen" icon="mdi-close-thick"/>
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <q-table class="col-12 cms-sticky-header-table" flat
             title="B2B Historie"
             :pagination="{ rowsPerPage: 10 }"
             :columns="requestColumns"
             :rows="previousB2bRequests"
             bordered>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td v-for="headerVal in props.cols"
                :key="headerVal.name" :props="props">
            <div v-if="headerVal.name === 'requesting_company'">
              {{ props.row.contract?.company?.name }}
            </div>
            <div v-else-if="headerVal.name === 'status'">
              <q-chip :label="convertB2BStatus(props.row.status)" :color="getStatusColor(props.row.status)"/>
            </div>
            <div v-else-if="headerVal.name === 'requested_company'">
              {{ props.row.customer_company?.name }}
            </div>
            <div v-else-if="headerVal.name === 'requesting_user'">
              {{ props.row.user?.first_name }} {{ props.row.user?.last_name }}
            </div>
            <div v-else-if="headerVal.name === 'status_changed'">
              {{ FormatDateTime(props.row.updated_at) }}
            </div>
            <div v-else-if="headerVal.name === 'responding_user'">
              {{ props.row.responded_user?.first_name }} {{ props.row.responded_user?.last_name }}
            </div>
            <div v-else>
              {{ FormatDateTime(props.row[headerVal.field]) }}
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">

import { api } from 'boot/axios'
import IContractB2BRequest from 'src/misc/interfaces/Contract/IContractB2BRequest'
import { onMounted, ref, watch } from 'vue'
import ContractB2BRequestStatus from 'src/misc/Enums/Contract/ContractB2BRequestStatus'
import FormatDateTime from '../../misc/functions/FormatDateTime'
import EditSomethingButton from 'components/general/buttons/EditSomethingButton.vue'
import DeleteSomethingButton from 'components/general/buttons/DeleteSomethingButton.vue'

const props = defineProps({
  companyId: {
    type: Number,
    required: true
  }
})

const allB2bRequests = ref<IContractB2BRequest[]>([])
const previousB2bRequests = ref<IContractB2BRequest[]>([])
const requestColumns = [{ name: 'requesting_company', field: 'requesting_company', label: 'Angefragt von Gewerbe' },
  { name: 'status', field: 'status', label: 'Status' },
  { name: 'requested_company', field: 'requested_company', label: 'Angefragtes Gewerbe' },
  { name: 'requesting_user', field: 'requesting_user', label: 'Angefragt von' },
  { name: 'status_changed', field: 'status_changed', label: 'Status geändert am' },
  { name: 'responding_user', field: 'responding_user', label: 'Beantwortet von' },
  { name: 'created_at', field: 'created_at', label: 'Angefragt am' }]

onMounted(() => {
  getB2bRequests()
  getPreviousB2bRequests()
})

watch(() => props.companyId, () => {
  getB2bRequests()
  getPreviousB2bRequests()
})

function getB2bRequests () {
  if (props.companyId <= 0) return
  allB2bRequests.value = []
  api.get('/api/contract/b2bRequests/' + props.companyId)
    .then((res) => {
      allB2bRequests.value?.push(...res.data)
    })
    .catch((error) => {
      console.error(error)
    })
}

function getPreviousB2bRequests () {
  if (props.companyId <= 0) return
  previousB2bRequests.value = []
  api.get('/api/contract/b2bRequests/previous/' + props.companyId)
    .then((res) => {
      previousB2bRequests.value?.push(...res.data)
    })
    .catch((error) => {
      console.error(error)
    })
}

function convertB2BStatus (status: number) : string {
  return ContractB2BRequestStatus[status]
}

function getStatusColor (status: number): string {
  switch (status) {
    case ContractB2BRequestStatus.Abgelehnt:
      return 'error'
    case ContractB2BRequestStatus['Warte auf Rückmeldung']:
      return 'info'
    case ContractB2BRequestStatus.Angenommen:
      return 'positive'
    case ContractB2BRequestStatus.Storniert:
      return 'warning'
    default:
      return 'info'
  }
}

function updateB2BRequestStatus (contract: IContractB2BRequest, newStatus: number) {
  if (props.companyId <= 0) return
  api.post('/api/contract/b2bRequests/update/' + props.companyId, {
    contract_b2b_request_id: contract.id,
    status: newStatus
  })
    .then(() => {
      getB2bRequests()
      getPreviousB2bRequests()
    })
    .catch((error) => {
      console.error(error)
    })
}

</script>

<style scoped>

</style>
