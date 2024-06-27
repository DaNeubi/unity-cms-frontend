<template>
  <q-card>
    <q-card-section>
      <div class="row q-mb-md">
        <edit-something-button class="col-auto" text="Zurück zur Auswahl" icon="mdi-arrow-left-bold"
                               button-color="secondary" @create-something-new="$emit('goBack')"/>
      </div>
    </q-card-section>
    <q-card-section>
      <div class="text-h3">
        Konto Transaktionen für {{ companyName }}
      </div>
    </q-card-section>
    <q-card-section>
      <CompanyBalanceManualTransactionHistoryComponent :company-id="companyId" :reload-int="0" :from-external="true"/>
    </q-card-section>
    <q-separator/>
    <q-card-section>
      <UserPayoutHistoryComponent :company-id="companyId" :reload-int="0" :from-external="true"/>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import EditSomethingButton from 'components/general/buttons/EditSomethingButton.vue'
import CompanyBalanceManualTransactionHistoryComponent
  from 'components/balanceView/CompanyBalance/CompanyBalanceManualTransactionHistoryComponent.vue'
import UserPayoutHistoryComponent from 'components/balanceView/Payment/UserPayoutHistoryComponent.vue'

defineProps({
  companyId: {
    type: Number,
    required: true
  },
  companyName: {
    type: String,
    required: true,
    default: 'Nicht angegeben'
  }
})
defineEmits(['goBack'])
</script>

<style scoped>

</style>
