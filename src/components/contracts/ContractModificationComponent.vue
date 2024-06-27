<template>
  <div class="row">
    <q-stepper v-model="step"
               class="full-width"
               header-nav
               done-icon="mdi-check-circle"
               active-icon="mdi-pencil"
               animated>
      <q-step :name="1" done-icon="mdi-check-circle" :done="step > 1"
              :error="name === '' || number === '' || description === '' || (b2b && selectedCompany === null)"
              title="Basis Informationen">
        <div class="row q-gutter-sm">
          <q-input v-model="name" class="col-5" outlined
                   label="Name*" counter maxlength="128"/>
          <div class="col-1"></div>
          <q-input v-model="customer" class="col-5" outlined :disable="b2b"
                   label="Kunde" counter maxlength="128"/>
          <q-input v-model="description" class="col-5" outlined label="Beschreibung*"
                   type="textarea" counter maxlength="256"/>
          <div class="col-1"></div>
          <q-input v-model.number="number" class="col-5" outlined label="Vertragsnummer*"
                   min="0" type="number" reactive-rules
                   :rules="[val => val < 16777214 || 'Die Vertragsnummer darf nicht größer gleich 16777214 sein!']"/>
          <q-input v-model.number="discountAmount" class="col-5" outlined label="Rabatt"
                   min="0" max="100" type="number" suffix="%"/>
          <div class="col-1"></div>
          <q-checkbox :disable="!canCreateB2B" v-model="b2b" label="Business to Business Vertrag" class="col-auto q-mt-md">
            <q-tooltip>
              <span v-if="canCreateB2B">Aktivieren um ein Gewerbe als Kunde auszuwählen.</span>
              <span v-else>Du hast nicht das Recht einen Business 2 Business Vertrag zu erstellen.</span>
            </q-tooltip>
          </q-checkbox>
          <q-select outlined v-model="selectedCompany" :disable="(!canCreateB2B || !b2b)" use-chips
                    label="Gewerbe auswählen" class="col-4 q-mt-md"
                    @filter="lazyLoadCompanies" :option-label="opt => opt.name"
                    :options="availableOptionCompanies">
            <template #selected-item="{ opt, removeAtIndex }">
              <q-chip dense @remove="removeAtIndex">
                {{ opt.name }}
              </q-chip>
            </template>
          </q-select>
          <div class="col-6"></div>
          <q-checkbox v-model="userShare" class="col-5"
                      label="Mitarbeiteranteil beim Buchen (Sofern für die hinterlegten Artikel vorhanden)"/>
          <q-checkbox v-model="itemsAddable" class="col-5"
                      label="Artikel können von den Mitarbeitern beim Buchen noch hinzugefügt werden"/>
          <div class="col-12"></div>
          <div class="row col-12 justify-around">
            <EditSomethingButton text="Abbrechen" icon="mdi-cancel"
                                 class="col-auto" @click="$emit('contract-creation-cancel')"/>
            <CreateSomethingNewButton text="Weiter"
                                      icon="mdi-arrow-right-thick" class="col-auto" @click="step = 2"/>
          </div>
        </div>
      </q-step>
      <q-step :name="2" :done="step > 2" done-icon="mdi-check-circle" icon="mdi-clock"
              :error="startDate === '' || billingStartDate === '' || billingDuration === undefined || billingDuration.toString() === ''"
              title="Zeiten">
        <div class="row q-gutter-sm">
          <div class="row col-5 justify-center">
            <div class="text-h6 q-mt-sm q-mb-sm">Start Datum</div>
            <q-date v-model="startDate" class="col-12" landscape mask="DD.MM.YYYY"/>
          </div>
          <div class="col-1"></div>
          <div class="row col-5 justify-center">
            <div class="text-h6 q-mt-sm q-mb-sm">Abrechnungs Start Datum</div>
            <q-date v-model="billingStartDate" class="col-12" landscape mask="DD.MM.YYYY"/>
          </div>
          <div class="col-5">
            <q-input label="Abrechnungs Intervall in Tagen"
                     class="col-12 q-mt-md" min="0" v-model.number="billingDuration" type="number"
                     outlined/>
          </div>
          <div class="row col-12 justify-around q-mt-md">
            <EditSomethingButton text="Zurück" icon="mdi-arrow-left-thick"
                                 class="col-auto" @click="step = 1"/>
            <CreateSomethingNewButton text="Weiter"
                                      icon="mdi-arrow-right-thick" class="col-auto" @click="step = 3"/>
          </div>
        </div>
      </q-step>
      <q-step :name="3" :done="step > 3" done-icon="mdi-check-circle" title="Produkte"
              :error="itemsForContract === undefined || itemsForContract.length <= 0"
              icon="mdi-cart-outline">
        <div class="row q-gutter-sm">
          <div class="col-12 text-h6 justify-center row">
            Artikel hinzufügen
          </div>
          <CreateSomethingNewButton text="Hinzufügen" icon="mdi-plus-circle"
                                    class="col-auto"
                                    @create-something-new="addSelectedItems()"/>
          <q-select outlined v-model="selectedItems" multiple use-chips label="Produkte Auswählen"
                    class="col-10" :options="availableOptionItems" @filter="lazyLoadItems"
                    :option-label="opt => opt.name"
                    options-selected-class="text-accent">
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>
                    {{ scope.opt.name }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:selected-item="scope">
              <q-chip removable dense @remove="scope.removeAtIndex(scope.index)" color="primary">
                {{ scope.opt.name }}
              </q-chip>
            </template>
          </q-select>
          <q-table class="col-12 q-mt-lg" :columns="itemColumns" title="Produkte im Vertrag"
                   :rows="itemsForContract">
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td v-for="headerVal in itemColumns"
                      :key="headerVal.name"
                      :props="props">
                  <div v-if="headerVal.name === 'amount'" class="cursor-pointer">
                    {{ props.row[headerVal.name] }}
                    <q-popup-edit :model-value="props.row[headerVal.name]"
                                  v-slot="scope" buttons
                                  label-cancel="Abbrechen" label-set="Übernehmen"
                                  @save="(val) => props.row[headerVal.name] = val">
                      <q-input v-model.number="scope.value" outlined label="Anzahl"
                               type="number" min="0"/>
                    </q-popup-edit>
                  </div>
                  <div v-else-if="headerVal.name === 'min_active' || headerVal.name === 'max_active' || headerVal.name === 'editable'"
                       class="cursor-pointer">
                    {{ props.row[headerVal.name] ? 'Ja' : 'Nein' }}
                    <q-popup-edit :model-value="props.row[headerVal.name]"
                                  v-slot="scope" buttons
                                  label-cancel="Abbrechen" label-set="Übernehmen"
                                  @save="(val) => editMinMax(val, props.row, headerVal.name)">
                      <q-checkbox v-model="scope.value" :false-value="0" :true-value="1" :label="`Aktiv: ${ scope.value ? 'Ja' : 'Nein' }`"/>
                    </q-popup-edit>
                  </div>
                  <div v-else-if="headerVal.name === 'max_amount' || headerVal.name === 'min_amount'"
                       class="cursor-pointer">
                    {{ props.row[headerVal.name] }}
                    <q-popup-edit :model-value="props.row[headerVal.name]"
                                  v-slot="scope" buttons
                                  label-cancel="Abbrechen" label-set="Übernehmen"
                                  @save="(val) => props.row[headerVal.name] = val">
                      <q-input v-model.number="scope.value" outlined :label="headerVal.label"
                               type="number" min="0"/>
                    </q-popup-edit>
                  </div>
                  <div v-else-if="headerVal.name === 'action'">
                    <delete-something-button text="Entfernen" @create-something-new="removeGivenItem(props.row)"/>
                  </div>
                  <div v-else>
                    {{ props.row[headerVal.name] }}
                  </div>
                </q-td>
              </q-tr>
            </template>
          </q-table>
          <div class="row col-12 justify-around q-mt-md">
            <EditSomethingButton text="Zurück" icon="mdi-arrow-left-thick"
                                 class="col-auto" @click="step = 2"/>
            <CreateSomethingNewButton text="Weiter"
                                      icon="mdi-arrow-right-thick" class="col-auto" @click="step = 4"/>
          </div>
        </div>
      </q-step>
      <q-step :name="4"
              :done="step > 4"
              done-icon="mdi-check-circle"
              title="Zusammenfassung"
              icon="mdi-clipboard-list-outline">
        <div class="row">
          <div class="col-6">
            <div class="row">
              <div class="col-12">
                Name: {{ name }}
              </div>
              <div class="col-12">
                Beschreibung: {{ description }}
              </div>
              <div class="col-12">
                Rabatt: {{ parseFloat(discountAmount.toString()) }}%
              </div>
              <div class="col-12">
                Kunde: {{ b2b ? selectedCompany?.name : customer }}
              </div>
              <div class="col-12">
                B2B Vertrag: {{ b2b ? 'Ja' : 'Nein' }}
              </div>
              <div class="col-12">
                Vertragsnummer: {{ number }}
              </div>
              <div class="col-12">
                Start Datum: {{ startDate }}
              </div>
              <div class="col-12">
                Mitarbeiteranteile beim Buchen: {{ userShare ? 'Ja' : 'Nein' }}
              </div>
              <div class="col-12">
                Abrechnungs Start Datum: {{ billingStartDate }}
              </div>
              <div class="col-12">
                Abrechnungs Intervall in Tagen: {{ billingDuration }} Tag(e)
              </div>
            </div>
          </div>
          <div class="col-6">
            <div class="row">
              <div class="col-12">
                <q-table class="col-12 q-mt-lg" :columns="itemSummaryColumns" title="Produkte im Vertrag"
                         :rows="itemsForContract">
                  <template v-slot:body="props">
                    <q-tr :props="props">
                      <q-td v-for="headerVal in itemSummaryColumns"
                            :key="headerVal.name"
                            :props="props">
                        <div v-if="headerVal.name === 'amount'">
                          {{ props.row[headerVal.name] }}
                        </div>
                        <div v-else-if="headerVal.name === 'min_active' || headerVal.name === 'max_active' || headerVal.name === 'editable'">
                          {{ props.row[headerVal.name] ? 'Ja' : 'Nein' }}
                        </div>
                        <div v-else-if="headerVal.name === 'max_amount' || headerVal.name === 'min_amount'">
                          {{ props.row[headerVal.name] }}
                        </div>
                        <div v-else>
                          {{ props.row[headerVal.name] }}
                        </div>
                      </q-td>
                    </q-tr>
                  </template>
                </q-table>
              </div>
            </div>
          </div>
          <div class="row col-12 justify-around q-mt-md">
            <EditSomethingButton text="Zurück" icon="mdi-arrow-left-thick"
                                 class="col-auto" @click="step = 3"/>
            <CreateSomethingNewButton text="Speichern"
                                      icon="mdi-content-save" :disable="disableSubmitButton" class="col-auto" @click="handleContractInteraction()"/>
          </div>
        </div>
      </q-step>
    </q-stepper>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import ICompany from 'src/misc/interfaces/Company/ICompany'
import { api } from 'boot/axios'
import { date } from 'quasar'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import EditSomethingButton from 'components/general/buttons/EditSomethingButton.vue'
import { IItem } from 'src/misc/interfaces/Item/IItem'
import IContractItem from 'src/misc/interfaces/Contract/IContractItem'
import DeleteSomethingButton from 'components/general/buttons/DeleteSomethingButton.vue'
import IContract from 'src/misc/interfaces/Contract/IContract'

const props = defineProps({
  companyId: {
    type: Number,
    required: true,
    default: 0
  },
  canCreateB2B: {
    type: Boolean,
    required: false,
    default: false
  },
  contract: {
    type: Object as () => IContract|undefined,
    required: false,
    default: undefined
  }
})

const emit = defineEmits([
  'contract-creation-cancel'
])

const step = ref<number>(1)
const name = ref<string>(props.contract?.name ?? '')
const number = ref<string>(props.contract?.number.toString() ?? '')
const customer = ref<string|null>(props.contract?.customer ?? '')
const description = ref<string|null>(props.contract?.description ?? '')
const discountAmount = ref<number>(props.contract?.discount_amount ?? 0)
const startDate = ref<string>(date.formatDate(props.contract?.start_date, 'DD.MM.YYYY') ?? date.formatDate(new Date(), 'DD.MM.YYYY'))
const billingStartDate = ref<string>(date.formatDate(props.contract?.billing_start_date, 'DD.MM.YYYY') ?? date.formatDate(new Date(), 'DD.MM.YYYY'))
const billingDuration = ref<number|undefined>(((props.contract?.billing_duration ?? 0) / 1440) ?? undefined)
const b2b = ref<boolean>(Boolean(props.contract?.b2b) ?? false)
const userShare = ref<boolean>(Boolean(props.contract?.contract_setting?.user_share) ?? false)
const itemsAddable = ref<boolean>(Boolean(props.contract?.contract_setting?.items_addable) ?? false)
const disableSubmitButton = computed(() => {
  return (name.value === undefined || name.value.length <= 0) ||
    (number.value === undefined || number.value.length <= 0) ||
    (b2b.value ? (selectedCompany.value === undefined || selectedCompany.value === null) : (customer.value === null || customer.value.length <= 0)) ||
    (startDate.value === undefined || startDate.value.length <= 0) ||
    (billingStartDate.value === undefined || billingStartDate.value.length <= 0) ||
    (billingDuration.value === undefined || billingDuration.value <= 0) ||
    (itemsForContract.value === undefined || itemsForContract.value.length <= 0)
})

const allCompanies = ref<ICompany[]>()
const availableOptionCompanies = ref<ICompany[]>()
const selectedCompany = ref<ICompany|null>(null)

const allItems = ref<IItem[]>()
const availableOptionItems = ref<IItem[]>()
const selectedItems = ref<IItem[]>()
const itemsForContract = ref<IContractItem[]>(props.contract?.contract_items ?? [])

const itemColumns = [{ name: 'name', field: 'name', label: 'Name' },
  { name: 'amount', field: 'amount', label: 'Amount' },
  { name: 'min_active', field: 'min_active', label: 'Minimum Aktiv' },
  { name: 'max_active', field: 'max_active', label: 'Maximum Aktiv' },
  { name: 'editable', field: 'editable', label: 'Beim Buchen bearbeitbar' },
  { name: 'max_amount', field: 'max_amount', label: 'Maximal Auswählbar' },
  { name: 'min_amount', field: 'min_amount', label: 'Minimal Auswählbar' },
  { name: 'action', field: 'action', label: 'Entfernen' }]
const itemSummaryColumns = [{ name: 'name', field: 'name', label: 'Name' },
  { name: 'amount', field: 'amount', label: 'Amount' },
  { name: 'min_active', field: 'min_active', label: 'Minimum Aktiv' },
  { name: 'max_active', field: 'max_active', label: 'Maximum Aktiv' },
  { name: 'editable', field: 'editable', label: 'Beim Buchen bearbeitbar' },
  { name: 'max_amount', field: 'max_amount', label: 'Maximal Auswählbar' },
  { name: 'min_amount', field: 'min_amount', label: 'Minimal Auswählbar' }]

onMounted(() => {
  setItemNameToGivenContractItems()
  setSelectedCompany()
})

// a way to reload the available companies without the need to cancel the whole creation process
watch(b2b, () => {
  if (b2b.value === false) {
    selectedCompany.value = null
    allCompanies.value = undefined
    availableOptionCompanies.value = undefined
  }
})

function setItemNameToGivenContractItems () {
  if (props.contract === undefined || props.contract.contract_items === undefined) return
  props.contract.contract_items.forEach((contractItem) => {
    contractItem.name = contractItem.item?.name
  })
}

function setSelectedCompany () {
  if (props.contract === undefined || !props.contract.b2b) return
  selectedCompany.value = props.contract.customer_company as ICompany | null
}

function lazyLoadCompanies (val: string, update: (val: () => void) => void) {
  if (allCompanies.value !== undefined) {
    update(() => {
      const needle = val.toLowerCase()
      availableOptionCompanies.value = allCompanies.value?.filter((v) => v.name.toLowerCase().indexOf(needle) > -1)
    })
    return
  }
  if (props.companyId <= 0) return
  api.get('/api/contract/companies/' + props.companyId)
    .then((res) => {
      allCompanies.value = res.data
      const needle = val.toLowerCase()
      availableOptionCompanies.value = allCompanies.value?.filter((v) => v.name.toLowerCase().indexOf(needle) > -1)
    })
    .catch((err) => {
      console.error(err)
    })
}
function lazyLoadItems (val: string, update: (val: () => void) => void) {
  if (allItems.value !== undefined) {
    update(() => {
      const needle = val.toLowerCase()
      availableOptionItems.value = availableOptionItems.value?.filter((v) => v.name.toLowerCase().indexOf(needle) > -1)
    })
    return
  }
  if (props.companyId <= 0) return
  api.get('/api/items/reducedForContract/' + props.companyId)
    .then((res) => {
      allItems.value = res.data
      const needle = val.toLowerCase()
      availableOptionItems.value = allItems.value?.filter((v) => v.name.toLowerCase().indexOf(needle) > -1)
    })
    .catch((err) => {
      console.error(err)
    })
}
function addSelectedItems () {
  if (selectedItems.value === undefined) return
  // check if the item is already in the itemsForContract
  selectedItems.value.forEach((item) => {
    const itemForContract = itemsForContract.value?.find((itemForContract) => itemForContract.item_id === item.id)
    if (itemForContract === undefined) {
      if (itemsForContract.value === undefined) itemsForContract.value = []
      itemsForContract.value?.push({
        amount: 0,
        min_active: false,
        max_active: false,
        editable: true,
        max_amount: 0,
        min_amount: 0,
        name: item.name,
        item_id: item.id,
        contract_id: props.contract?.id ?? Math.random(),
        id: Math.random()
      })
    }
  })
  selectedItems.value = []
  // remove the itemsForContract from the availableOptionItems
  availableOptionItems.value = availableOptionItems.value?.filter((item) => {
    const itemForContract = itemsForContract.value?.find((itemForContract) => itemForContract.item_id === item.id)
    if (itemForContract === undefined) return item
    else return undefined
  })
}
function removeGivenItem (contractItem: IContractItem) {
  // remove the item from the itemsForContract
  const index = itemsForContract.value?.findIndex((item) => item.id === contractItem.id)
  if (index !== undefined && index !== -1) {
    itemsForContract.value?.splice(index, 1)
  }
  // add the item to the availableOptionItems
  const itemToAdd = allItems.value?.find((item) => item.id === contractItem.item_id)
  if (itemToAdd !== undefined) availableOptionItems.value?.push(itemToAdd)
}

function handleContractInteraction () {
  if (props.contract === undefined) {
    createContract()
  } else {
    modifyContract()
  }
}

function createContract () {
  if (props.companyId <= 0) return
  api.post('/api/contract/create/' + props.companyId, {
    name: name.value,
    number: number.value,
    description: description.value,
    customer: b2b.value ? null : customer.value,
    discount_amount: discountAmount.value,
    start_date: startDate.value,
    billing_start_date: billingStartDate.value,
    billing_duration: (billingDuration.value ?? 0) * 1440,
    b2b: b2b.value,
    user_share: userShare.value,
    items_addable: itemsAddable.value,
    customer_company_id: selectedCompany.value?.id ?? null,
    items: itemsForContract.value
  })
    .then(() => {
      emit('contract-creation-cancel')
    })
    .catch((err) => {
      console.error(err)
    })
}

function modifyContract () {
  if (props.companyId <= 0) return
  api.patch('/api/contract/edit/' + props.companyId, {
    id: props.contract?.id,
    name: name.value,
    number: number.value,
    description: description.value,
    customer: b2b.value ? null : customer.value,
    discount_amount: discountAmount.value,
    start_date: startDate.value,
    billing_start_date: billingStartDate.value,
    billing_duration: (billingDuration.value ?? 0) * 1440,
    b2b: b2b.value,
    user_share: userShare.value,
    items_addable: itemsAddable.value,
    customer_company_id: selectedCompany.value?.id ?? null,
    items: itemsForContract.value
  })
    .then(() => {
      emit('contract-creation-cancel')
    })
    .catch((err) => {
      console.error(err)
    })
}

function editMinMax (newValue: number, item: IContractItem, valueChanged: string) {
  item[valueChanged] = newValue
  if (newValue === 1) {
    // set the corresponding value to 0 if disabled
    const otherValue = valueChanged.split('_')[0] + '_amount'
    // if available set the previous value
    if (item[otherValue + '_old'] !== undefined) {
      item[otherValue] = item[otherValue + '_old']
    } else {
      item[otherValue] = 1
    }
  } else if (newValue === 0) {
    // set the corresponding value to 0 if disabled
    const otherValue = valueChanged.split('_')[0] + '_amount'
    // save the old value for possible reactivation while editing
    item[otherValue + '_old'] = item[otherValue]
    // set the value to 0
    item[otherValue] = 0
  }
}

</script>

<style scoped>

</style>
