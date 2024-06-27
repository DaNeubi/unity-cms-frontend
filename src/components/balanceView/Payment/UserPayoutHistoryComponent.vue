<template>
  <q-card>
    <q-card-section>
      <div class="column">
        <q-table
          class="default-table-height full-width cms-sticky-header-table"
          virtual-scroll
          title="Auszahlungshistorie"
          no-data-label="Keine Daten vorhanden"
          loading-label="Daten werden abgerufen..."
          :loading="loading"
          :virtual-scroll-item-size="30"
          :virtual-scroll-sticky-size-start="30"
          :pagination="{ rowsPerPage: 30 }"
          :rows-per-page-options="[0]"
          @virtual-scroll="onScroll"
          :rows="userPayouts"
          :columns="columns">
          <template v-slot:body="props">
            <q-tr :props="props" v-if="columns?.length > 0">
              <q-td v-for="headerVal in columns"
                    :key="headerVal.name"
                    :props="props">
                <div v-if="headerVal.name === 'full_payment'">
                  ${{ props.row.payment_tip + props.row.payment_share + props.row.manually_added_payment_tip + props.row.manually_added_payment_share }}
                </div>
                <div v-if="headerVal.name === 'payment_share'">
                  ${{ props.row.payment_share + props.row.manually_added_payment_share }}
                </div>
                <div v-if="headerVal.name === 'payment_tip'">
                  ${{ props.row.payment_tip + props.row.manually_added_payment_tip }}
                </div>
                <div v-if="headerVal.name === 'making_user'">
                  {{ props.row.user_making?.first_name }} {{ props.row.user_making?.last_name }}
                </div>
                <div v-if="headerVal.name === 'receiving_user'">
                  {{ props.row.user_receiving?.first_name }} {{ props.row.user_receiving?.last_name }}
                </div>
                <div v-if="headerVal.name === 'created_at'">
                  {{ FormatDateTime(props.row.created_at) }}
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { api } from 'src/boot/axios'
import IUserPayment from 'src/misc/interfaces/User/IUserPayment'
import { defineComponent, onMounted, ref, watch } from 'vue'
import FormatDateTime from '../../../misc/functions/FormatDateTime'

export default defineComponent({
  name: 'UserPayoutHistoryComponent',
  methods: { FormatDateTime },
  components: {},
  props: {
    companyId: {
      type: Number,
      required: true,
      default: 0
    },
    reloadInt: {
      type: Number,
      required: false,
      default: 0
    },
    fromExternal: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  setup (props) {
    const loading = ref(true)
    const userPayouts = ref<IUserPayment[]>([])
    const nextPage = ref<number>(0)
    const lastPage = ref<number>(Math.ceil(userPayouts.value?.length ?? 0 / 30))
    const columns = [
      { name: 'full_payment', label: 'Komplettes Gehalt', field: 'full_payment' },
      { name: 'payment_share', label: 'Anteil der Verkäufe', field: 'payment_share' },
      { name: 'payment_tip', label: 'Trinkgeld', field: 'payment_tip' },
      { name: 'making_user', label: 'Getätigt von', field: 'making_user' },
      { name: 'receiving_user', label: 'Getätigt an', field: 'receiving_user' },
      { name: 'created_at', label: 'Ausgezahlt am', field: 'created_at' }
    ]
    onMounted(() => {
      getInitialPayments()
    })
    watch(() => props.companyId, () => {
      getInitialPayments()
    })
    watch(() => props.reloadInt, () => {
      getInitialPayments()
    })
    function getInitialPayments () {
      if (props.companyId <= 0) return
      loading.value = true
      if (props.fromExternal) {
        api.get('/api/government/companyPayouts?company_id=' + props.companyId + '&skip=0' + '&take=30')
          .then((response) => {
            userPayouts.value = []
            userPayouts.value = response.data.payouts
            loading.value = false
          })
          .catch((error) => {
            console.error(error)
          })
      } else {
        api.get('/api/payout/all/amount/' + props.companyId + '?skip=0' + '&take=30')
          .then((response) => {
            userPayouts.value = []
            userPayouts.value = response.data.payouts
            loading.value = false
          })
          .catch((error) => {
            console.error(error)
          })
      }
    }
    function onScroll (properties: { index: number, from: number, to: number, direction: string}) {
      const lastIndex = userPayouts.value?.length ?? 1 - 1
      if (!loading.value && nextPage.value < lastPage.value && properties.to === lastIndex) {
        loading.value = true
        if (props.fromExternal) {
          api.get('/api/government/companyPayouts?company_id=' + props.companyId + '&skip=' + nextPage.value + '&take=30')
            .then((response) => {
              if (userPayouts.value === undefined) {
                userPayouts.value = []
              }
              userPayouts.value?.push(response.data.payouts)
              loading.value = false
            })
            .catch((error) => {
              console.error(error)
            })
        } else {
          api.get('/api/payout/all/amount/' + props.companyId + '?skip=' + nextPage.value + '&take=30')
            .then((response) => {
              if (userPayouts.value === undefined) {
                userPayouts.value = []
              }
              userPayouts.value?.push(response.data.payouts)
              loading.value = false
            })
            .catch((error) => {
              console.error(error)
            })
        }
      }
    }
    return {
      loading,
      columns,
      onScroll,
      userPayouts
    }
  }
})
</script>

<style scoped>

</style>
