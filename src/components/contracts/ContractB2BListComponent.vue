<template>
  <div class="row">
    <q-table class="full-width default-table-height" grid title="Aktive B2B Verträge" :filter="filter"
             :columns="columns" :rows="contracts">
      <template v-slot:top-right>
        <q-input outlined debounce="300" v-model="filter" clearable placeholder="Suchen">
          <template v-slot:append>
            <q-icon name="mdi-magnify"/>
          </template>
        </q-input>
      </template>
      <template v-slot:item="props">
        <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3 grid-style-transition">
          <q-card bordered flat>
            <q-card-section>
              <div class="row q-gutter-sm">
                <div class="col-12">
                  <div class="column">
                    <div class="col-auto">
                      Vertragspartner:
                    </div>
                    <div class="col-auto text-body1 text-bold">
                      {{ props.row?.company?.name ?? 'Gewerbe konnte nicht gefunden werden.' }}
                    </div>
                    <div class="col-auto q-mt-md">
                      Vertragsname:
                    </div>
                    <div class="col-auto text-body1 text-bold">
                      {{ props.row?.name ?? 'Vertragsname konnte nicht gefunden werden.' }}
                    </div>
                  </div>
                </div>
                <div class="col-12 text-body2 text-orange">
                  Offener Betrag: ${{ calculateOpenAmount(props.row) }}
                </div>
                <div class="col-12">
                  <q-list bordered class="rounded-borders">
                    <q-expansion-item expand-separator label="Offene Buchungen" icon="mdi-format-list-bulleted">
                      <q-expansion-item expand-separator :label="`Buchung vom ${ FormatDateTime(transaction.created_at) }`"
                                        v-for="transaction in props.row?.contract_on_hold_transactions"
                                        :content-inset-level="1"
                                        :key="transaction.id" :header-inset-level="1" icon="mdi-format-list-checks">
                        <q-card>
                          <q-card-section>
                            <div class="row">
                              <q-chip color="accent" :label="`${ item.amount }x` + ' ' + `${ item.item?.name }`"
                                      icon="mdi-food" :key="item.id"
                                      v-for="item in transaction.contract_on_hold_transaction_items"/>
                            </div>
                          </q-card-section>
                        </q-card>
                      </q-expansion-item>
                    </q-expansion-item>
                  </q-list>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { api } from 'boot/axios'
import IContract from 'src/misc/interfaces/Contract/IContract'
import FormatDateTime from 'src/misc/functions/FormatDateTime'
import IContractOnHoldTransaction from 'src/misc/interfaces/Contract/IContractOnHoldTransaction'

const contracts = ref<IContract[]>([])
const filter = ref('')
const columns = [
  { name: 'name', label: 'Vertrags Name', field: 'name' },
  { name: 'start_date', label: 'Start Datum', field: 'start_date' }
]

const props = defineProps({
  companyId: {
    type: Number,
    required: true,
    default: 0
  }
})

onMounted(() => {
  getB2BContracts()
})

watch(() => props.companyId, () => {
  getB2BContracts()
})

function getB2BContracts () {
  if (props.companyId <= 0) return
  api.get('/api/contract/b2bContracts/' + props.companyId)
    .then((res) => {
      contracts.value = res.data
    })
    .catch((error) => {
      console.error(error)
    })
}
function calculateOpenAmount (contract: IContract) {
  let openAmount = 0
  contract.contract_on_hold_transactions?.forEach((transaction: IContractOnHoldTransaction) => {
    openAmount += transaction.total
  })
  return openAmount
}
</script>

<style scoped>

</style>
