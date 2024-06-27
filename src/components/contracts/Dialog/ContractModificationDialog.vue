<template>
  <q-dialog ref="dialogRef"
            transition-show="scale"
            transition-hide="scale"
            :persistent="false">
    <q-card>
      <q-card-section>
        <div class="text-h3">
          Aktuellen Vertrag bearbeiten
        </div>
      </q-card-section>
      <q-card-section>
        <q-scroll-area style="height: 70vh;">
          <div class="row q-gutter-sm justify-center q-pl-md q-pr-md">
            <q-input label="Name" class="col-12" v-model="name" outlined counter maxlength="128"/>
            <q-input label="Beschreibung" class="col-12" v-model="description" outlined type="textarea" counter maxlength="256"/>
            <q-input label="Kunde" :disable="b2b" class="col-12" v-model="customer"
                     hint="Bei einem B2B Vertrag muss das nicht ausgefüllt werden" outlined counter maxlength="128"/>
            <q-input label="Nummer" class="col-12" v-model.number="number" min="0" outlined type="number"/>
            <q-input label="Rabatt" class="col-12" v-model.number="discountAmount" min="0" max="100" outlined type="number" suffix="%"/>
            <div class="text-h6">Start Datum</div>
            <q-date v-model="startDate" class="col-12" landscape mask="DD.MM.YYYY"/>
            <div class="text-h6">Abrechnungs Start Datum</div>
            <q-date v-model="billingStartDate" class="col-12" landscape mask="DD.MM.YYYY"/>
            <q-input label="Abrechnungs Intervall in Tagen" class="col-12" min="0" v-model="billingDuration" type="number"
                     outlined/>
            <div class="col-12" v-if="b2b">
              {{ b2bCompany?.name }}
            </div>
          </div>
        </q-scroll-area>
      </q-card-section>
      <q-card-actions>
        <DialogActionComponent @dialog-save-button="contractInteractionReturn()"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">

import { date, useDialogPluginComponent } from 'quasar'
import IContract from 'src/misc/interfaces/Contract/IContract'
import { ref } from 'vue'
import ICompany from 'src/misc/interfaces/Company/ICompany'
import DialogActionComponent from 'components/general/dialogs/DialogActionComponent.vue'

defineEmits([
  ...useDialogPluginComponent.emits
])
const props = defineProps({
  contract: {
    type: Object as () => IContract,
    default: null,
    required: true
  }
})

const { dialogRef } = useDialogPluginComponent()
const name = ref<string>(props.contract?.name ?? '')
const number = ref<number>(props.contract?.number ?? 0)
const description = ref<string|null>(props.contract?.description ?? null)
const customer = ref<string|null>(props.contract?.customer ?? null)
const discountAmount = ref<number>(props.contract?.discount_amount ?? 0)
const startDate = ref<string>(date.formatDate(props.contract?.start_date, 'DD.MM.YYYY') ?? date.formatDate(new Date(), 'DD.MM.YYYY'))
const billingStartDate = ref<string>(date.formatDate(props.contract?.billing_start_date, 'DD.MM.YYYY') ?? date.formatDate(new Date(), 'DD.MM.YYYY'))
const billingDuration = ref<string>((parseInt(props.contract?.billing_duration.split(':')[0]) / 24).toString() ?? '')
const b2b = ref<boolean>(props.contract?.b2b ?? false)
const b2bCompany = ref<ICompany|null>(props.contract?.customer_company ?? null)

</script>

<style scoped>

</style>
