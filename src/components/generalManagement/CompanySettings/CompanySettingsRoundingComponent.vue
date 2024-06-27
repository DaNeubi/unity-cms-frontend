<template>
  <q-card>
    <q-card-section>
      <div class="col">
        <div class="text-h5 q-mb-sm">
          Aufrunden des Betrages bei Buchungen
        </div>
        <div v-if="loading">
          <div class="row q-mb-sm"
               v-for="n in 3"
               :key="n">
            <q-skeleton type="QToggle"
                        class="q-mr-sm"/>
            <q-skeleton width="8em"/>
          </div>
        </div>
        <div v-else>
          <div class="col" v-if="companySetting !== undefined">
            <div>
              <q-btn color="primary"
                     label="Speichern"
                     :disable="!canEditCashRegisterRounding"
                     @click="updateCompanyRoundingSetting()"/>
            </div>
            <div>
              <q-toggle
                v-model="companySetting.cash_register_rounding"
                :true-value="1"
                :false-value="0"
                :disable="!canEditCashRegisterRounding"
                color="primary"
                :label="`Aufrunden in den Kasse`"
                label-position="left"/>
            </div>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">

import { ICompanySetting } from 'src/misc/interfaces/CompanySetting/ICompanySetting'
import { defineComponent, onMounted, ref } from 'vue'
import { api } from 'boot/axios'

export default defineComponent({
  name: 'CompanySettingsRoundingComponent',
  components: {},
  props: {
    companyId: {
      type: Number,
      required: true
    },
    canEditCashRegisterRounding: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  setup (props) {
    const companySetting = ref<ICompanySetting>()
    const loading = ref<boolean>(true)
    onMounted(async () => {
      getCompanyRounding()
    })
    function getCompanyRounding () {
      loading.value = true
      if (props.companyId <= 0) { return }
      api.get('/api/companySettings/rounding/' + props.companyId)
        .then((res) => {
          companySetting.value = res.data.companySetting
          loading.value = false
        })
        .catch((err) => {
          console.error(err)
        })
    }
    function updateCompanyRoundingSetting () {
      api.patch('/api/companySettings/rounding/update/' + props.companyId, {
        setting_id: companySetting.value?.id,
        cash_register_rounding: companySetting.value?.cash_register_rounding
      })
        .catch((err) => {
          console.error(err)
        })
    }
    return {
      companySetting,
      loading,
      updateCompanyRoundingSetting
    }
  }
})
</script>

<style scoped>

</style>
