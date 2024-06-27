<template>
  <div class="column">
    <div class="row">
      <q-table
        class="default-table-height q-mt-md full-width cms-sticky-header-table"
        virtual-scroll
        v-model:pagination="pagination"
        title="Ausgeschiedene Mitarbeiter/innen"
        :columns="columns"
        :rows="firedUsers"
        no-data-label="Keine Daten vorhanden"
        :loading="loading"
        loading-label="Daten werden abgerufen..."
      >
        <template v-slot:no-data="{ message }">
          <div class="full-width row q-gutter-sm items-center">
            <q-icon size="2em" name="mdi-alert"/>
            <span>{{ message }}</span>
          </div>
        </template>
        <template v-slot:loading>
          <q-inner-loading showing color="primary"/>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props" v-if="firedUsers?.length > 0">
            <q-td v-for="headerVal in columns"
                  :key="headerVal.name"
                  :props="props">
              <div v-if="headerVal.name === 'name'">
                {{ props.row.fired_user?.first_name }} {{ props.row.fired_user?.last_name }}
              </div>
              <div v-if="headerVal.name === 'firedBy'">
                {{ props.row.fired_by_user?.first_name }} {{ props.row.fired_by_user?.last_name }}
              </div>
              <div v-if="headerVal.name === 'reason'">
                {{ props.row.reason }}
              </div>
              <div v-if="headerVal.name === 'created_at'">
                {{ FormatDateTime(props.row[headerVal.name]) }}
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script lang="ts">
import { api } from 'src/boot/axios'
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import { companyStore } from 'stores/companyStore'
import FiredUser from 'src/misc/classes/User/FiredUser'
import FormatDateTime from '../../misc/functions/FormatDateTime'

export default defineComponent({
  name: 'LeftEmployees',
  methods: { FormatDateTime },
  components: {},
  setup () {
    const loading = ref(true)
    const cStore = companyStore()
    const companyId = computed(() => cStore.companyId)
    const firedUsers = ref<FiredUser[]>([])
    watch(companyId, () => {
      getLeftUsers()
    })
    const columns = [
      { name: 'name', label: 'Name', field: 'name' },
      { name: 'firedBy', label: 'Gekündigt von', field: 'firedBy', sortable: true },
      { name: 'reason', label: 'Grund', field: 'reason' },
      { name: 'created_at', label: 'Gekündigt am', field: 'created_at', sortable: true }
    ]
    onMounted(() => {
      getLeftUsers()
    })
    function getLeftUsers () {
      if (companyId.value <= 0) { return }
      api.get('/api/companyLeftUsers/reduced/' + companyId.value).then((res) => {
        firedUsers.value = res.data.data
        loading.value = false
      }).catch((error) => {
        console.error(error)
      })
    }
    return {
      pagination: ref({
        rowsPerPage: 0
      }),
      columns,
      loading,
      firedUsers
    }
  }
})
</script>

<style scoped>

</style>
