<template>
  <q-card>
    <q-card-section>
      <div class="column">
        <q-table class="default-table-height full-width cms-sticky-header-table"
                 title="Gehälter für Mitarbeiter/innen"
                 no-data-label="Keine Daten vorhanden"
                 loading-label="Daten werden abgerufen..."
                 :loading="loading"
                 :pagination="{ rowsPerPage: 20 }"
                 :rows="userPayouts"
                 :columns="columns">
          <template v-slot:body="props">
            <q-tr :props="props" v-if="columns?.length > 0">
              <q-td v-for="headerVal in columns"
                    :key="headerVal.name"
                    :props="props">
                <div v-if="headerVal.name === 'user'">
                  {{ props.row.user?.first_name }} {{ props.row.user?.last_name }}
                </div>
                <div v-else-if="headerVal.name === 'bank_account_number'">
                  {{ props.row.user?.bank_account_number ?? '-Nicht Angegeben-' }}
                </div>
                <div v-else-if="headerVal.name === 'salary'"
                     class="text-red-6">
                  ${{ props.row.current_tip + props.row.current_share + props.row.manually_added_tip + props.row.manually_added_share + props.row.cash_payment_sum }}
                </div>
                <div v-else-if="headerVal.name === 'user_share'">
                  ${{ props.row.current_share + props.row.manually_added_share }}
                </div>
                <div v-else-if="headerVal.name === 'tip'">
                  ${{ props.row.current_tip + props.row.manually_added_tip }}
                </div>
                <div v-else-if="headerVal.name === 'payout'">
                  <EditSomethingButton text="Auszahlen"
                                       icon="mdi-contactless-payment-circle-outline"
                                       @create-something-new="showUserPayoutDialog(props.row)"
                                       button-color="secondary"/>
                </div>
                <div v-else-if="headerVal.name === 'revert'">
                  <EditSomethingButton text="Auszahlung Rückgängig machen"
                                       icon="mdi-cash-sync"
                                       @create-something-new="showDeleteConfirmDialog(props.row)"
                                       button-color="secondary"/>
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
import IUserBalanceCurrent from 'src/misc/interfaces/User/IUserBalanceCurrent'
import { defineComponent, onMounted, ref, watch } from 'vue'
import EditSomethingButton from 'components/general/buttons/EditSomethingButton.vue'
import { useQuasar } from 'quasar'
import PayoutUserDialog from 'components/balanceView/Payment/Dialogs/PayoutUserDialog.vue'

export default defineComponent({
  name: 'UserPayoutComponent',
  components: { EditSomethingButton },
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
    }
  },
  setup (props) {
    const $q = useQuasar()
    const loading = ref(true)
    const userPayouts = ref<IUserBalanceCurrent[]>([])
    const columns = [
      { name: 'user', label: 'Mitarbeiter/in', field: 'user', sortable: true },
      { name: 'bank_account_number', label: 'Kontonummer', field: 'bank_account_number' },
      { name: 'salary', label: 'Komplettes Gehalt', field: 'salary' },
      { name: 'user_share', label: 'Anteil der Verkäufe', field: 'user_share' },
      { name: 'tip', label: 'Trinkgeld', field: 'tip' },
      { name: 'payout', label: 'Auszahlen', field: 'payout' },
      { name: 'revert', label: 'Fuck ich hab verkackt', field: 'revert' }
    ]
    watch(() => props.companyId, () => {
      getAllEmployeeSalaries()
    })
    onMounted(() => {
      getAllEmployeeSalaries()
    })
    watch(() => props.reloadInt, () => {
      getAllEmployeeSalaries()
    })
    function getAllEmployeeSalaries () {
      if (props.companyId <= 0) return
      loading.value = true
      api.get('/api/balanceView/all/salary/' + props.companyId)
        .then((response) => {
          userPayouts.value = []
          userPayouts.value = response.data.user_balance_currents
          loading.value = false
        })
        .catch((error) => {
          console.error(error)
        })
    }
    function showUserPayoutDialog (userBalance: IUserBalanceCurrent) {
      $q.dialog({
        component: PayoutUserDialog,
        componentProps: {
          userBalanceCurrent: userBalance,
          companyId: props.companyId
        },
        ok: {
          push: true
        }
      })
    }
    function showDeleteConfirmDialog (userBalance: IUserBalanceCurrent) {
      $q.dialog({
        message: 'Möchtest du wirklich die letzte Auszahlung rückgängig machen?. Das kann nicht rückgängig gemacht werden. (Höh)',
        title: 'Auszahlung rückgängig machen',
        persistent: true,
        ok: {
          push: true,
          color: 'positive',
          label: 'Ja'
        },
        cancel: {
          push: true,
          color: 'negative',
          label: 'Nein'
        }
      }).onOk(() => {
        api.post('/api/payout/revert/' + props.companyId, {
          receiver_user: userBalance.user_id
        })
          .catch((error) => {
            console.error(error)
          })
      })
    }
    return {
      loading,
      columns,
      userPayouts,
      showUserPayoutDialog,
      showDeleteConfirmDialog
    }
  }
})
</script>

<style scoped>

</style>
