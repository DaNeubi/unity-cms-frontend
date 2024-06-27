<template>
  <q-card>
    <q-card-section v-if="canSeeCompanyTax">
      <div class="column items-center">
        <h4 class="q-mt-none q-mb-sm">Standard Steuersatz</h4>
      </div>
      <div>
        <span class="hint-text">
          Dieser Steuersatz zählt standardmäßig für alle Artikel.<br/>
          Es gibt die Möglichkeit pro Artikel einen eigenen Steuersatz zu definieren.
          Der Pro Artikel definierte Steuersatz wird immer dem Standardsteuersatz gegenüber vorgezogen.<br/>
          In der Kasse gibt es auch die Möglichkeit für die aktuelle Transaktion (den aktuellen Einkauf)
          einen Steuersatz zu definieren. Dieser Steuersatz überschreibt alle anderen
          Einstellungen für die aktuelle Transaktion.
        </span>
      </div>
      <div class="row q-mt-sm q-gutter-md">
        <q-btn label="Aktualisieren"
               color="positive"
               icon="mdi-content-save"
               class="col-1"
               dense
                @click="updateCompanyTax"
               outline/>
        <q-skeleton width="20em" v-if="companyTax === undefined || loading"/>
        <div v-else>
          <q-input label="Standard Steuersatz in %"
                   v-model.number="companyTax.tax"
                   type="number"
                   class="col-6"
                   outlined
                   :disabled="!canEditCompanyTax"
                   :min="0"
                   :max="100"
                   suffix="%"/>
        </div>
      </div>
    </q-card-section>
    <q-card-section v-else>
      <div class="text-h3">
        Du hast keine Berechtigung um den Standard Steuersatz zu sehen.
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { api } from 'src/boot/axios'
import { ICompanyTax } from 'src/misc/interfaces/CompanyTax/ICompanyTax'
import { defineComponent, onMounted, ref, watch } from 'vue'

export default defineComponent({
  name: 'AccountingDefaultTaxationComponent',
  components: {},
  props: {
    canSeeCompanyTax: {
      type: Boolean,
      required: true,
      default: false
    },
    canEditCompanyTax: {
      type: Boolean,
      required: true,
      default: false
    },
    companyId: {
      type: Number,
      required: true
    },
    updateNumber: {
      type: Number,
      required: true
    }
  },
  setup (props) {
    const companyTax = ref<ICompanyTax | undefined>(undefined)
    const loading = ref<boolean>(false)
    watch(() => props.updateNumber, () => {
      getCompanyTax()
    })
    onMounted(async () => {
      getCompanyTax()
    })
    function getCompanyTax () {
      loading.value = true
      api.get('/api/companyTax/reduced/' + props.companyId)
        .then((res) => {
          companyTax.value = res.data.companyTaxes[0]
          loading.value = false
        })
        .catch((err) => {
          console.error(err)
        })
    }
    function updateCompanyTax () {
      api.patch('/api/companyTax/update/' + props.companyId, {
        tax_id: companyTax.value?.id,
        tax: companyTax.value?.tax
      })
        .then(() => {
          getCompanyTax()
        })
        .catch((err) => {
          console.error(err)
        })
    }
    return {
      companyTax,
      updateCompanyTax,
      loading
    }
  }
})
</script>

<style scoped>

</style>
