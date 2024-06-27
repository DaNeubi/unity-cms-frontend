<template>
  <div class="row">
    <div class="col-12">
      <CreateSomethingNewButton text="Neuen Vertrag erstellen"
                                icon="mdi-note-plus" v-if="canCreate"
                                @create-something-new="$emit('contract-create-new')"/>
    </div>
    <div class="col-12">
      <q-table class="full-width default-table-height q-mt-md"
               virtual-scroll
               no-data-label="Keine Daten vorhanden"
               loading-label="Daten werden abgerufen..."
               :rows="contracts"
               grid
               :pagination="{ rowsPerPage: 30 }"
               :filter="filter"
               row-key="id"
               hide-header>
        <template v-slot:top-right>
          <q-input outlined debounce="300" v-model="filter" placeholder="Suchen">
            <template v-slot:append>
              <q-icon name="mdi-magnify"/>
            </template>
          </q-input>
        </template>
        <template v-slot:item="props">
          <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3 grid-style-transition">
            <q-card bordered flat>
              <q-card-section>
                <div class="row q-gutter-md">
                  <edit-something-button text="Bearbeiten" :disable="!canEdit || props.selected"
                                         @create-something-new="$emit('contract-modify-existing', props.row)"/>
                  <delete-something-button text="Löschen" :disable="!canDelete"
                                           @create-something-new="deleteContract(props.row)"/>
                </div>
              </q-card-section>
              <q-card-section>
                <div class="row q-gutter-sm ">
                  <div class="col-12 items-center justify-start">
                    <div class="row items-center justify-start">
                      <q-icon name="mdi-file-document-edit-outline" size="md"/>
                      <q-icon name="mdi-domain" v-if="props.row.b2b" class="q-ml-sm" color="light-blue-5" size="md">
                        <q-tooltip>
                          Business to Business Vertrag mit {{ props.row.customer_company?.name }}
                        </q-tooltip>
                      </q-icon>
                      <span class="text-h6 q-ml-sm">Nummer: {{ props.row.number }}</span>
                    </div>
                  </div>
                  <div class="col-12">
                    <div class="row items-center justify-start q-gutter-sm">
                      <div class="col-11 text-subtitle1">{{ props.row.name }}</div>
                      <q-separator class="col-11" size="0.1em"/>
                      <div class="col-11 text-body2">{{ props.row.description }}</div>
                    </div>
                  </div>
                  <div class="col-12">
                    <q-separator class="col-10 q-mb-sm" size="0.1em"/>
                    <q-expansion-item switch-toggle-side>
                      <template v-slot:header>
                        <q-item-section>
                          <div>
                            Nächste Abrechnung fällig in: {{ calculateNextContractBillingDate(props.row.billing_start_date, props.row.billing_duration) }}
                          </div>
                        </q-item-section>
                      </template>
                      <div class="row q-gutter-sm">
                        <q-separator class="col-11 q-mb-sm" size="0.1em"/>
                        <div class="col-12">
                          <div class="row items-center justify-start">
                            <div v-if="props.row.discount_amount > 0" class="col-12">
                              <q-icon name="mdi-sale-outline"/>
                              {{ props.row.discount_amount }}% Rabatt
                            </div>
                            <div v-else>
                              Kein Rabatt
                            </div>
                            <div class="col-12">
                              Mitarbeiter Anteil: {{ props.row.contract_setting?.user_share ? 'Ja' : 'Nein' }}
                            </div>
                            <div class="col-12">
                              Artikel Nachträglich hinzufügen: {{ props.row.contract_setting?.items_addable ? 'Ja' : 'Nein' }}
                            </div>
                            <div class="col-12" v-if="props.row.customer_company">
                              B2B Gewerbe: {{ props.row.customer_company?.name }}
                            </div>
                          </div>
                        </div>
                        <div class="col-12">
                          <div class="row items-center justify-start">
                            <div class="col-12">
                              <q-icon name="mdi-timer-play-outline" class="col-auto"/>
                              Start Datum: <b>{{ formatDateTimeToDate(props.row.start_date) }}</b>
                            </div>
                            <div class="col-12">
                              <q-icon name="mdi-cash-plus" class="col-auto"/>
                              Rechnungs Start Datum: <b>{{ formatDateTimeToDate(props.row.billing_start_date) }}</b>
                            </div>
                            <div class="col-12">
                              <q-icon name="mdi-cash-sync" class="col-auto"/>
                              Abrechnungs Intervall: <b>{{ props.row.billing_duration / 1440 }}Tag(e)</b>
                            </div>
                          </div>
                        </div>
                        <div class="col-12 text-italic">
                          <div class="row items-center justify-start">
                            <div class="col-12">
                              Erstellt von: {{ props.row.user ? props.row.user?.first_name + ' ' + props.row.user?.last_name : 'Nicht gefunden' }}
                            </div>
                            <div class="col-12">
                              Erstellt am: {{ formatDateTimeToGerman(props.row.created_at) }}
                            </div>
                            <div class="col-12">
                              Zuletzt geändert am: {{ formatDateTimeToGerman(props.row.updated_at) }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </q-expansion-item>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import { onMounted, ref, watch } from 'vue'
import IContract from '../../misc/interfaces/Contract/IContract'
import { date, useQuasar } from 'quasar'
import { api } from 'boot/axios'
import EditSomethingButton from 'components/general/buttons/EditSomethingButton.vue'
import DeleteSomethingButton from 'components/general/buttons/DeleteSomethingButton.vue'

defineEmits([
  'contract-create-new',
  'contract-modify-existing'
])

const props = defineProps({
  companyId: {
    type: Number,
    required: true
  },
  canEdit: {
    type: Boolean,
    required: false,
    default: false
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
  }
})

const contracts = ref<IContract[]>([])
const filter = ref('')
const $q = useQuasar()

onMounted(() => {
  getAllContracts()
})

watch(() => props.companyId, () => {
  getAllContracts()
})

function formatDateTimeToDate (dateToFormat: string) : string {
  return date.formatDate(dateToFormat, 'DD.MM.YYYY')
}

function formatDateTimeToGerman (dateToFormat: string) : string {
  return date.formatDate(dateToFormat, 'DD.MM.YYYY HH:mm:ss')
}

function calculateNextContractBillingDate (startDate: string, duration: number) {
  // check how many days the duration is
  const days = duration / 1440
  // check how many days between the start date and now
  const daysBetween = date.getDateDiff(date.formatDate(new Date(), 'YYYY-MM-DD'), startDate, 'days')
  // check how many times the days fit into the days between
  const times = Math.floor(daysBetween / days)
  // check how many days are left until the next billing date
  const daysLeft = days - ((daysBetween - days * times) % days)
  return `${daysLeft} Tag${daysLeft > 1 ? 'en' : ''}`
}

function getAllContracts () {
  if (props.companyId <= 0) return
  api.get('/api/contract/reduced/' + props.companyId)
    .then((response) => {
      contracts.value = response.data
    })
    .catch((error) => {
      console.error(error)
    })
}

function deleteContract (selectedContract: IContract) {
  $q.dialog({
    title: 'Vertrag löschen',
    message: 'Möchten Sie den Vertrag wirklich löschen?',
    ok: {
      push: true,
      color: 'warning',
      label: 'Ja'
    },
    cancel: {
      push: true,
      color: 'negative',
      label: 'Nein'
    }
  }).onOk(() => {
    if (props.companyId <= 0) return
    api.post('/api/contract/delete/' + props.companyId, selectedContract)
      .then(() => {
        contracts.value = contracts.value?.filter((contract) => contract.id !== selectedContract.id)
      })
      .catch((error) => {
        console.error(error)
      })
  })
}

</script>

<style scoped>

</style>
