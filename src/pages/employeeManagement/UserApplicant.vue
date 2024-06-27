<template>
  <div class="column">
    <div class="row q-gutter-md">
      <CreateSomethingNewButton text="Neuen Bewerber hinzufügen"
                                @create-something-new="showCreateDialog()"/>
      <q-btn color="primary"
             label="Änderungen übernehmen"
             icon="mdi-content-save-plus"
             :disable="!changedApplicants?.length > 0"
             @click="updateApplicants()"/>
      <q-btn color="primary"
             label="Markierte verstecken"
             icon="mdi-content-save-plus"
             :disable="!selectedApplicants?.length > 0"
             @click="setGivenApplicantsAsHidden()"/>
    </div>
    <q-table class="default-table-height q-mt-md full-width cms-sticky-header-table"
             virtual-scroll
             v-model:pagination="pagination"
             title="Aktive Bewerberliste"
             :columns="columns"
             :rows="availableApplicants"
             row-key="id"
             no-data-label="Keine Daten vorhanden"
             :selection="canEditApplicants ? 'multiple' : 'none'"
             v-model:selected="selectedApplicants"
             :loading="loading">
      <template v-slot:loading>
        <q-inner-loading showing color="primary"/>
      </template>
      <template v-slot:no-data="{ message }">
        <div class="full-width row q-gutter-sm items-center">
          <q-icon size="2em" name="mdi-alert"/>
          <span>{{ message }}</span>
        </div>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props" v-if="availableApplicants?.length > 0">
          <q-td v-if="canEditApplicants">
            <q-checkbox color="accent"
                        v-model="props.selected"/>
          </q-td>
          <q-td v-for="headerVal in columns"
                :key="headerVal.name"
                :props="props">
            <div v-if="headerVal.name === 'first_name'"
                 class="cursor-pointer row full-height full-width items-center justify-end">
              {{ props.row[headerVal.name] }}
              <q-popup-edit :model-value="props.row[headerVal.name]"
                            v-slot="scope"
                            buttons
                            label-set="Übernehmen"
                            label-cancel="Abbrechen"
                            @save="(val) => editApplicant(val, props.row, headerVal.name)">
                <q-input v-model="scope.value"
                         outlined
                         label="Vorname"
                         maxlength="48"
                         counter/>
              </q-popup-edit>
            </div>
            <div v-if="headerVal.name === 'last_name'"
                 class="cursor-pointer row full-height full-width items-center justify-end">
              {{ props.row[headerVal.name] }}
              <q-popup-edit :model-value="props.row[headerVal.name]"
                            v-slot="scope"
                            buttons
                            label-set="Übernehmen"
                            label-cancel="Abbrechen"
                            @save="(val) => editApplicant(val, props.row, headerVal.name)">
                <q-input v-model="scope.value"
                         outlined
                         label="Nachname"
                         maxlength="48"
                         counter/>
              </q-popup-edit>
            </div>
            <div v-if="headerVal.name === 'phone_number'"
                 class="cursor-pointer row full-height full-width items-center justify-end">
              {{ props.row[headerVal.name] }}
              <q-popup-edit :model-value="props.row[headerVal.name]"
                            v-slot="scope"
                            buttons
                            label-set="Übernehmen"
                            label-cancel="Abbrechen"
                            @save="(val) => editApplicant(val, props.row, headerVal.name)">
                <q-input v-model="scope.value"
                         outlined
                         label="Telefon"
                         maxlength="16"
                         counter/>
              </q-popup-edit>
            </div>
            <div v-if="headerVal.name === 'custom_field_1' && columnsCustoms.custom_field_1 !== null"
                 class="cursor-pointer row full-height full-width items-center justify-end">
              {{ props.row[headerVal.name] }}
              <q-popup-edit :model-value="props.row[headerVal.name]"
                            v-slot="scope"
                            buttons
                            label-set="Übernehmen"
                            label-cancel="Abbrechen"
                            @save="(val) => editApplicant(val, props.row, headerVal.name)">
                <q-input v-model="scope.value"
                         outlined
                         :label="columnsCustoms.custom_field_1"
                         maxlength="250"
                         counter/>
              </q-popup-edit>
            </div>
            <div v-if="headerVal.name === 'custom_field_2' && columnsCustoms.custom_field_2 !== null"
                 class="cursor-pointer row full-height full-width items-center justify-end">
              {{ props.row[headerVal.name] }}
              <q-popup-edit :model-value="props.row[headerVal.name]"
                            v-slot="scope"
                            buttons
                            label-set="Übernehmen"
                            label-cancel="Abbrechen"
                            @save="(val) => editApplicant(val, props.row, headerVal.name)">
                <q-input v-model="scope.value"
                         outlined
                         :label="columnsCustoms.custom_field_2"
                         maxlength="250"
                         counter/>
              </q-popup-edit>
            </div>
            <div v-if="headerVal.name === 'custom_field_3' && columnsCustoms.custom_field_3 !== null"
                 class="cursor-pointer row full-height full-width items-center justify-end">
              {{ props.row[headerVal.name] }}
              <q-popup-edit :model-value="props.row[headerVal.name]"
                            v-slot="scope"
                            buttons
                            label-set="Übernehmen"
                            label-cancel="Abbrechen"
                            @save="(val) => editApplicant(val, props.row, headerVal.name)">
                <q-input v-model="scope.value"
                         outlined
                         :label="columnsCustoms.custom_field_3"
                         maxlength="128"
                         counter/>
              </q-popup-edit>
            </div>
            <div v-if="headerVal.name === 'custom_field_4' && columnsCustoms.custom_field_4 !== null"
                 class="cursor-pointer row full-height full-width items-center justify-end">
              {{ props.row[headerVal.name] ? 'Ja' : props.row[headerVal.name] === null ? '-' : 'Nein' }}
              <q-popup-edit :model-value="props.row[headerVal.name]"
                            v-slot="scope"
                            buttons
                            label-set="Übernehmen"
                            label-cancel="Abbrechen"
                            @save="(val) => editApplicant(val, props.row, headerVal.name)">
                <q-checkbox v-model="scope.value"
                            :label="scope.value ? 'Ja' : 'Nein'"
                            :true-value="1"
                            :false-value="0"
                            color="accent"/>
              </q-popup-edit>
            </div>
            <div v-if="headerVal.name === 'custom_field_5' && columnsCustoms.custom_field_5 !== null"
                 class="cursor-pointer row full-height full-width items-center justify-end">
              {{ props.row[headerVal.name] ? 'Ja' : props.row[headerVal.name] === null ? '-' : 'Nein' }}
              <q-popup-edit :model-value="props.row[headerVal.name]"
                            v-slot="scope"
                            buttons
                            label-set="Übernehmen"
                            label-cancel="Abbrechen"
                            @save="(val) => editApplicant(val, props.row, headerVal.name)">
                <q-checkbox v-model="scope.value"
                            :label="columnsCustoms.custom_field_5"
                            :true-value="1"
                            :false-value="0"
                            color="accent"/>
              </q-popup-edit>
            </div>
            <div v-if="headerVal.name === 'custom_field_6' && columnsCustoms.custom_field_6 !== null"
                 class="cursor-pointer row full-height full-width items-center justify-end">
              {{ props.row[headerVal.name] ? 'Ja' : props.row[headerVal.name] === null ? '-' : 'Nein' }}
              <q-popup-edit :model-value="props.row[headerVal.name]"
                            v-slot="scope"
                            buttons
                            label-set="Übernehmen"
                            label-cancel="Abbrechen"
                            @save="(val) => editApplicant(val, props.row, headerVal.name)">
                <q-checkbox v-model="scope.value"
                            :label="scope.value ? 'Ja' : 'Nein'"
                            :true-value="1"
                            :false-value="0"
                            color="accent"/>
              </q-popup-edit>
            </div>
            <div v-if="headerVal.name === 'employment_start'"
                 class="cursor-pointer row full-height full-width items-center justify-end">
              muss noch
            </div>
            <div v-if="headerVal.name === 'created_by'">
              {{ props.row.user.first_name }} {{ props.row.user.last_name }}
            </div>
            <div v-if="headerVal.name === 'created_at'">
              {{ FormatDateTime(props.row[headerVal.name]) }}
            </div>
            <div v-if="headerVal.name === 'updated_at'">
              {{ FormatDateTime(props.row[headerVal.name]) }}
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import CreateNewApplicantDialogComponent from 'components/userManagement/dialogs/CreateNewApplicantDialogComponent.vue'
import { api } from 'src/boot/axios'
import { companyStore } from 'stores/companyStore'
import { useQuasar } from 'quasar'
import IApplicant from 'src/misc/interfaces/Applicant/IApplicant'
import laravelEcho from 'boot/laravelecho'
import { useUserStore } from 'stores/useUserStore'
import IApplicantCustomFields from 'src/misc/interfaces/Applicant/IApplicantCustomFields'
import FormatDateTime from '../../misc/functions/FormatDateTime'
import AssignPolicies from 'src/misc/functions/policies/Policies'

export default defineComponent({
  name: 'UserApplicant',
  methods: { FormatDateTime },
  components: { CreateSomethingNewButton },
  setup () {
    const $q = useQuasar()
    const columns = ref([
      { name: 'first_name', label: 'Vorname', field: 'first_name' },
      { name: 'last_name', label: 'Nachname', field: 'last_name' },
      { name: 'phone_number', label: 'Telefon', field: 'phone_number' },
      { name: 'custom_field_1', label: 'Feld 1', field: 'custom_field_1' },
      { name: 'custom_field_2', label: 'Feld 2', field: 'custom_field_2' },
      { name: 'custom_field_3', label: 'Feld 3', field: 'custom_field_3' },
      { name: 'custom_field_4', label: 'Feld 4', field: 'custom_field_4' },
      { name: 'custom_field_5', label: 'Feld 5', field: 'custom_field_5' },
      { name: 'custom_field_6', label: 'Feld 6', field: 'custom_field_6' },
      { name: 'employment_start', label: 'Eingestellt am', field: 'employment_start' },
      { name: 'created_by', label: 'Erstellt von', field: 'created_by' },
      { name: 'created_at', label: 'Erstellt am', field: 'created_at' },
      { name: 'updated_at', label: 'Aktualisiert am', field: 'updated_at' }
    ])
    const columnsCustoms = ref<IApplicantCustomFields>()
    const columnsCustomsHidden = ref<IApplicantCustomFields>()
    const availableApplicants = ref<IApplicant[]>([])
    const availableHiddenApplicants = ref<IApplicant[]>([])
    const loading = ref(true)
    const cStore = companyStore()
    const companyId = computed(() => cStore.companyId)
    const userStore = useUserStore()
    const userId = computed(() => userStore.userId)
    const canViewAllApplicants = ref<boolean>(false)
    const canEditApplicants = ref<boolean>(false)
    const canCreateNewApplicant = ref<boolean>(false)
    const changedApplicants = ref<IApplicant[]>()
    const selectedApplicants = ref<IApplicant[]>()
    watch(companyId, () => {
      // get permissions
      getPermissions()
      // get non hidden applicants
      getNonHiddenApplicants()
      // get hidden applicants
      getHiddenApplicants()
    })
    watch(userId, () => {
      joinReloadChannel()
    })
    watch(canViewAllApplicants, () => {
      // get non hidden applicants
      getNonHiddenApplicants()
      // get hidden applicants
      getHiddenApplicants()
    })
    onMounted(async () => {
      // get permissions
      getPermissions()
      joinReloadChannel()
      // get non hidden applicants
      getNonHiddenApplicants()
      // get hidden applicants
      getHiddenApplicants()
    })
    onUnmounted(() => {
      laravelEcho.leave('user.reload.' + userId.value)
    })
    function joinReloadChannel () {
      if (userId.value <= 0) { return }
      // listen to the change event
      laravelEcho.private('user.reload.' + userId.value)
        .listen('.user.reload', () => {
          loading.value = true
          getNonHiddenApplicants()
        })
    }
    function getPermissions () {
      if (companyId.value <= 0) { return }
      api.get('/api/policies/userManagement/applicants/' + companyId.value)
        .then((res) => {
          AssignPolicies([
            { policyName: 'UserManagement_Applicants_View_All', policyToAssign: canViewAllApplicants },
            { policyName: 'UserManagement_Applicants_Edit', policyToAssign: canEditApplicants },
            { policyName: 'UserManagement_Applicants_Add_New', policyToAssign: canCreateNewApplicant }
          ], res.data.userManagementPolicies)
        })
        .catch((error) => {
          console.error(error)
        })
    }
    function getNonHiddenApplicants () {
      if (companyId.value <= 0) { return }
      loading.value = true
      api.get('/api/companyApplicants/reduced/' + companyId.value)
        .then((res) => {
          availableApplicants.value = res.data.applicants
          columnsCustoms.value = res.data.applicantCustomNames[0]
          updateColumns()
          loading.value = false
        })
        .catch((error) => {
          console.error(error)
        })
    }
    function getHiddenApplicants () {
      if (companyId.value <= 0) { return }
      loading.value = true
      api.get('/api/companyApplicants/hiddenReduced/' + companyId.value)
        .then((res) => {
          availableHiddenApplicants.value = res.data.applicants
          columnsCustomsHidden.value = res.data.applicantCustomNames[0]
          updateColumns()
          loading.value = false
        })
        .catch((error) => {
          console.error(error)
        })
    }
    function updateColumns () {
      if (columnsCustoms.value !== undefined) {
        // check every value if set or not
        if (columnsCustoms.value?.custom_field_1 !== null) {
          const columnToChange = columns.value.find((column) => column.name === 'custom_field_1')
          if (columnToChange !== undefined && columnToChange !== null) {
            columnToChange.label = columnsCustoms.value?.custom_field_1
          }
        }
        if (columnsCustoms.value?.custom_field_2 !== null) {
          const columnToChange = columns.value.find((column) => column.name === 'custom_field_2')
          if (columnToChange !== undefined && columnToChange !== null) {
            columnToChange.label = columnsCustoms.value?.custom_field_2
          }
        }
        if (columnsCustoms.value?.custom_field_3 !== null) {
          const columnToChange = columns.value.find((column) => column.name === 'custom_field_3')
          if (columnToChange !== undefined && columnToChange !== null) {
            columnToChange.label = columnsCustoms.value?.custom_field_3
          }
        }
        if (columnsCustoms.value?.custom_field_4 !== null) {
          const columnToChange = columns.value.find((column) => column.name === 'custom_field_4')
          if (columnToChange !== undefined && columnToChange !== null) {
            columnToChange.label = columnsCustoms.value?.custom_field_4
          }
        }
        if (columnsCustoms.value?.custom_field_5 !== null) {
          const columnToChange = columns.value.find((column) => column.name === 'custom_field_5')
          if (columnToChange !== undefined && columnToChange !== null) {
            columnToChange.label = columnsCustoms.value?.custom_field_5
          }
        }
        if (columnsCustoms.value?.custom_field_6 !== null) {
          const columnToChange = columns.value.find((column) => column.name === 'custom_field_6')
          if (columnToChange !== undefined && columnToChange !== null) {
            columnToChange.label = columnsCustoms.value?.custom_field_6
          }
        }
      }
    }
    function showCreateDialog () {
      $q.dialog({
        component: CreateNewApplicantDialogComponent,
        componentProps: {
          companyId: companyId.value,
          customFields: columnsCustoms.value
        },
        ok: {
          push: true,
          label: 'Speichern'
        }
      })
        .onOk(() => {
          getNonHiddenApplicants()
        })
    }
    function editApplicant (newVal: string | boolean, applicant: IApplicant, columnName: string) {
      applicant[columnName] = newVal
      if (changedApplicants.value === undefined) {
        changedApplicants.value = []
      }
      if (!changedApplicants.value.includes(applicant)) {
        changedApplicants.value.push(applicant)
      }
    }
    function updateApplicants () {
      api.patch('/api/companyApplicants/update/' + companyId.value, {
        applicants: changedApplicants.value
      })
        .then(() => {
          changedApplicants.value = []
          getNonHiddenApplicants()
        })
        .catch((error) => {
          console.error(error)
        })
    }
    function setGivenApplicantsAsHidden () {
      const applicantsToSubmit = selectedApplicants.value
      api.patch('/api/companyApplicants/hide/' + companyId.value, {
        applicants: applicantsToSubmit
      })
        .then(() => {
          selectedApplicants.value = []
          getNonHiddenApplicants()
          getHiddenApplicants()
        })
        .catch((error) => {
          console.error(error)
        })
    }
    return {
      columns,
      loading,
      pagination: ref({
        rowsPerPage: 0
      }),
      showCreateDialog,
      availableApplicants,
      availableHiddenApplicants,
      columnsCustoms,
      canEditApplicants,
      canViewAllApplicants,
      canCreateNewApplicant,
      columnsCustomsHidden,
      editApplicant,
      updateApplicants,
      selectedApplicants,
      setGivenApplicantsAsHidden,
      changedApplicants
    }
  }
})
</script>

<style scoped>

</style>
