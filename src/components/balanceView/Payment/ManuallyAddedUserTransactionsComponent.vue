<template>
  <q-card>
    <q-card-section>
      <q-table class="default-table-height full-width cms-sticky-header-table"
               virtual-scroll
               title="Historie, der Manuell hinzugefügten/entfernten Mitarbeiteranteile oder Trinkgelder bei Mitarbeiter/innen"
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
              <div v-if="headerVal.name === 'tip'">
                ${{ props.row.tip }}
              </div>
              <div v-if="headerVal.name === 'user_share'">
                ${{ props.row.user_share }}
              </div>
              <div v-if="headerVal.name === 'note'">
                {{ props.row.note }}
              </div>
              <div v-if="headerVal.name === 'user_id'">
                {{ props.row.user?.first_name }} {{ props.row.user?.last_name }}
              </div>
              <div v-if="headerVal.name === 'receiving_user'">
                {{ props.row.receiving_user?.first_name }} {{ props.row.receiving_user?.last_name }}
              </div>
              <div v-if="headerVal.name === 'created_at'">
                {{ FormatDateTime(props.row.created_at) }}
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { api } from 'src/boot/axios'
import IUserManualAddRemove from 'src/misc/interfaces/User/IUserManualAddRemove'
import { defineComponent, onMounted, ref, watch } from 'vue'
import FormatDateTime from '../../../misc/functions/FormatDateTime'

export default defineComponent({
  name: 'ManuallyAddedUserTransactionsComponent',
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
    }
  },
  setup (props) {
    const loading = ref<boolean>(true)
    const userPayouts = ref<IUserManualAddRemove[]>([])
    const nextPage = ref<number>(0)
    const lastPage = ref<number>(Math.ceil(userPayouts.value?.length ?? 0 / 30))
    const columns = [
      { name: 'tip', label: 'Trinkgeld', field: 'tip', sortable: true },
      { name: 'user_share', label: 'Mitarbeiteranteil', field: 'user_share', sortable: true },
      { name: 'note', label: 'Notiz', field: 'note', sortable: true },
      { name: 'user_id', label: 'Getätigt von', field: 'user_id', sortable: true },
      { name: 'receiving_user', label: 'Getätigt an', field: 'receiving_user', sortable: true },
      { name: 'created_at', label: 'Datum', field: 'created_at', sortable: true }
    ]
    onMounted(() => {
      getInitialHistory()
    })
    watch(() => props.companyId, () => {
      getInitialHistory()
    })
    watch(() => props.reloadInt, () => {
      getInitialHistory()
    })
    function getInitialHistory () {
      if (props.companyId <= 0) return
      loading.value = true
      api.get('/api/balanceView/all/custom/' + props.companyId + '?skip=0' + '&take=30')
        .then((response) => {
          userPayouts.value = []
          userPayouts.value = response.data.manualTransactions
          loading.value = false
        })
        .catch((error) => {
          console.error(error)
        })
    }
    function onScroll (properties: { index: number, from: number, to: number, direction: string}) {
      const lastIndex = userPayouts.value?.length ?? 1 - 1
      if (!loading.value && nextPage.value < lastPage.value && properties.to === lastIndex) {
        loading.value = true
        api.get('/api/balanceView/all/custom/' + props.companyId + '?skip=' + nextPage.value + '&take=30')
          .then((response) => {
            if (userPayouts.value === undefined) {
              userPayouts.value = []
            }
            userPayouts.value?.push(response.data.manualTransactions)
            loading.value = false
          })
          .catch((error) => {
            console.error(error)
          })
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
