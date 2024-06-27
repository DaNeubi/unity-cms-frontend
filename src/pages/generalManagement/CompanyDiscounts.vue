<template>
  <div class="column">
    <div class="row">
      <CreateSomethingNewButton
        icon="mdi-brightness-percent"
        text="Neuer Rabatt"
        v-if="canCreateDiscounts"
        @create-something-new="showCreateDialog()"/>
      <CreateSomethingNewButton icon="mdi-delete-forever"
                                class="q-ml-md"
                                text="Ausgewählte(n) Rabatt(e) löschen"
                                :disable="deleteButtonDisabled" v-if="canDeleteDiscounts"
                                @create-something-new="deleteDiscountConfirm()"/>
    </div>
    <div class="row">
      <q-table
        class="default-table-height q-mt-md full-width cms-sticky-header-table"
        virtual-scroll
        title="Alle Rabatte"
        no-data-label="Keine Daten vorhanden"
        :columns="columns"
        :rows="rows"
        :loading="loading"
        :pagination="{ rowsPerPage: 0 }"
        loading-label="Daten werden abgerufen..."
        :selection="canDeleteDiscounts ? 'multiple' : 'none'"
        v-model:selected="selectedDiscounts"
        @selection="(state) => state.added ? deleteButtonDisabled = false : deleteButtonDisabled = true">
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
          <q-tr :props="props" v-if="columns?.length > 0">
            <q-td v-if="canDeleteDiscounts">
              <q-checkbox color="accent" v-model="props.selected"/>
            </q-td>
            <q-td v-for="headerVal in columns"
                  :key="headerVal.name"
                  :props="props">
              <div v-if="headerVal.name === 'name'" class="discount-table-cursor">
                {{ props.row[headerVal.name] }}
                <q-popup-edit :model-value="props.row[headerVal.name]"
                              v-slot="scope"
                              buttons
                              label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => editDiscount(val, props.row, headerVal.name)" v-if="canEditDiscounts">
                  <q-input v-model="scope.value"
                           outlined
                           dense
                           autofocus
                           type="text"
                           maxlength="200"/>
                </q-popup-edit>
              </div>
              <div v-else-if="headerVal.name === 'description'" class="discount-table-cursor full-width full-height">
                {{ props.row[headerVal.name] }}
                <q-popup-edit :model-value="props.row[headerVal.name]"
                              v-slot="scope"
                              buttons
                              label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => editDiscount(val, props.row, headerVal.name)" v-if="canEditDiscounts">
                  <q-input v-model="scope.value"
                           outlined
                           dense
                           autofocus
                           type="text"
                           maxlength="200"/>
                </q-popup-edit>
              </div>
              <div v-else-if="headerVal.name === 'amount'" class="discount-table-cursor">
                {{ parseFloat(props.row[headerVal.name]).toFixed(2) }}%
                <q-popup-edit :model-value="props.row[headerVal.name]"
                              v-slot="scope"
                              buttons
                              label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => editDiscount(val, props.row, headerVal.name)" v-if="canEditDiscounts">
                  <q-input v-model.number="scope.value"
                           outlined
                           dense
                           autofocus
                           type="number"
                           :min="0"
                           :max="100"/>
                </q-popup-edit>
              </div>
              <div v-if="headerVal.name === 'active'" class="discount-table-cursor">
                {{ props.row[headerVal.name] === 1 ? 'Ja' : 'Nein' }}
                <q-popup-edit :model-value="props.row[headerVal.name]"
                              v-slot="scope"
                              buttons
                              label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => editDiscount(val, props.row, headerVal.name)" v-if="canEditDiscounts">
                  <q-checkbox :label="scope.value === 1 ? 'Aktiv: Ja' : 'Aktiv: Nein'"
                              :true-value="1"
                              :false-value="0"
                              v-model="scope.value"/>
                </q-popup-edit>
              </div>
              <div v-if="headerVal.name === 'created_by'">
                {{ props.row.user.first_name + ' ' + props.row.user.last_name }}
              </div>
              <div v-if="headerVal.name === 'updated_at'">
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
import { computed, defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import CreateNewDiscountDialog from 'components/generalManagement/Dialogs/CreateNewDiscountDialog.vue'
import { api } from 'src/boot/axios'
import { companyStore } from 'stores/companyStore'
import { useQuasar } from 'quasar'
import laravelEcho from 'boot/laravelecho'
import { useUserStore } from 'stores/useUserStore'
import FormatDateTime from '../../misc/functions/FormatDateTime'
import IDiscount from 'src/misc/interfaces/Discount/IDiscount'
import AssignPolicies from 'src/misc/functions/policies/Policies'

export default defineComponent({
  name: 'CompanyDiscounts',
  methods: { FormatDateTime },
  components: { CreateSomethingNewButton },
  setup () {
    const $q = useQuasar()
    const rows = ref<IDiscount[] | undefined>([])
    const loading = ref(true)
    const company = companyStore()
    const companyId = computed(() => company.companyId)
    const canCreateDiscounts = ref<boolean>(false)
    const canEditDiscounts = ref<boolean>(false)
    const canDeleteDiscounts = ref<boolean>(false)
    const selectedDiscounts = ref<IDiscount[] | undefined>([])
    const deleteButtonDisabled = ref(true)
    const userStore = useUserStore()
    const userId = computed(() => userStore.userId)
    watch(companyId, () => {
      getPermissions()
      getDiscounts()
    })
    const columns = [
      { name: 'name', label: 'Name', field: 'name', sortable: true },
      { name: 'description', label: 'Beschreibung', field: 'description' },
      { name: 'amount', label: 'Rabatt %', field: 'amount' },
      { name: 'active', label: 'Aktiv', field: 'active' },
      { name: 'created_by', label: 'Erstellt von', field: 'created_by' },
      { name: 'updated_at', label: 'Aktualisiert am', field: 'updated_at' }
    ]
    onMounted(() => {
      joinReloadChannel()
      // load permissions
      getPermissions()
      getDiscounts()
    })
    watch(userId, () => {
      joinReloadChannel()
    })
    onUnmounted(() => {
      // stop listening to the change event
      laravelEcho.leave('user.reload.' + userId.value)
    })
    function joinReloadChannel () {
      if (userId.value <= 0) { return }
      // listen to the change event
      laravelEcho.private('user.reload.' + userId.value)
        .listen('.user.reload', () => {
          // just reload the discounts
          getDiscounts()
        })
    }
    function getPermissions () {
      if (companyId.value <= 0) { return }
      api.get('/api/policies/generalManagement/discounts/' + companyId.value)
        .then((response) => {
          AssignPolicies([
            { policyName: 'GeneralManagement_Discounts_Create', policyToAssign: canCreateDiscounts },
            { policyName: 'GeneralManagement_Discounts_Edit', policyToAssign: canEditDiscounts },
            { policyName: 'GeneralManagement_Discounts_Delete', policyToAssign: canDeleteDiscounts }
          ], response.data.discountPolicies)
        })
        .catch((error) => {
          console.error(error)
        })
    }
    function getDiscounts () {
      if (companyId.value <= 0) { return }
      loading.value = true
      api.get('/api/discounts/reduced/' + companyId.value)
        .then((res) => {
          rows.value = res.data
          loading.value = false
        })
        .catch((err) => {
          console.error(err)
          loading.value = false
        })
    }
    function editDiscount (newValue: string, discount: IDiscount, valueThatChanged: string) {
      discount[valueThatChanged] = newValue
      api.patch('/api/discounts/edit/' + companyId.value, {
        id: discount.id,
        name: discount.name,
        description: discount.description,
        amount: discount.amount,
        active: discount.active
      })
        .then(() => {
          // reload the discounts
          getDiscounts()
        })
        .catch((err) => {
          console.error(err)
        })
    }
    function deleteDiscount () {
      selectedDiscounts.value?.forEach((discount: IDiscount) => {
        api.post('/api/discounts/delete/' + companyId.value, {
          discount_id: discount.id
        })
          .then(() => {
            const index = rows.value?.indexOf(discount)
            if (index !== undefined && index > -1) {
              rows.value?.splice(index, 1)
            }
          })
          .catch((err) => {
            console.error(err)
          })
      })
    }
    function showCreateDialog () {
      $q.dialog({
        component: CreateNewDiscountDialog,
        ok: {
          push: true,
          label: 'Erstellen'
        }
      })
        .onOk((discount: IDiscount) => {
          api.post('/api/discounts/create/' + companyId.value, {
            name: discount.name,
            description: discount.description.length === 0 ? null : discount.description,
            amount: discount.amount,
            active: discount.active
          })
            .then(() => {
              // reload the discounts
              getDiscounts()
            })
            .catch((e) => {
              console.error(e)
            })
        })
    }
    function deleteDiscountConfirm () {
      $q.dialog({
        title: 'Rabatt löschen',
        message: 'Möchtest du den/die ausgewählten Rabatt(e) wirklich löschen?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        deleteDiscount()
      })
    }
    return {
      rows,
      loading,
      columns,
      showCreateDialog,
      canCreateDiscounts,
      canEditDiscounts,
      canDeleteDiscounts,
      editDiscount,
      deleteDiscountConfirm,
      deleteButtonDisabled,
      selectedDiscounts
    }
  }
})
</script>

<style scoped>
.discount-table-cursor {
  cursor: pointer;
}
</style>
