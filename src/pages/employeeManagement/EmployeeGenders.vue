<template>
  <div class="column">
    <div class="row">
      <CreateSomethingNewButton icon="mdi-human-pregnant" text="Neues Geschlecht erstellen"
                                @create-something-new="showCreateDialog()"
                                v-if="canCreateNewGender"/>
      <CreateSomethingNewButton icon="mdi-delete-forever"
                                class="q-ml-md"
                                text="Ausgewähltes Geschlecht löschen"
                                :disable="deleteButtonDisabled"
                                @create-something-new="deleteGenderConfirm()"
                                v-if="canDeleteGenders"/>
    </div>
    <div class="row">
      <q-table
        class="default-table-height q-mt-md full-width cms-sticky-header-table"
        virtual-scroll
        v-model:pagination="pagination"
        title="Geschlechter"
        :columns="columns"
        no-data-label="Keine Daten vorhanden"
        :loading="loading"
        :rows="rows"
        row-key="id"
        :selection="canDeleteGenders ? 'single' : 'none'"
        v-model:selected="selectedGender"
        loading-label="Daten werden abgerufen..."
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
            <q-td v-if="canDeleteGenders">
              <q-checkbox color="accent" v-model="props.selected"/>
            </q-td>
            <q-td v-for="headerVal in columns"
                  :key="headerVal.name"
                  :props="props">
              {{ props.row[headerVal.name] }}
              <q-popup-edit :model-value="props.row[headerVal.name]"
                            v-slot="scope"
                            buttons
                            label-set="Aktualisieren"
                            label-cancel="Abbrechen"
                            @save="(val) => updateGender(val, props.row)"
                            v-if="canEditGenders">
                <q-input v-model="scope.value"
                         outlined
                         dense
                         counter
                         autofocus
                         type="text"
                         maxlength="128"/>
              </q-popup-edit>
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
import CreateNewGenderDialogComponent from 'components/userManagement/dialogs/CreateNewGenderDialogComponent.vue'
import { api } from 'src/boot/axios'
import { companyStore } from 'stores/companyStore'
import Gender from 'src/misc/classes/Gender/Gender'
import laravelEcho from 'boot/laravelecho'
import { useUserStore } from 'stores/useUserStore'
import { useQuasar } from 'quasar'
import AssignPolicies from 'src/misc/functions/policies/Policies'

export default defineComponent({
  name: 'EmployeeGenders',
  components: { CreateSomethingNewButton },
  setup () {
    const $q = useQuasar()
    const loading = ref(true)
    const columns = [
      {
        name: 'name',
        label: 'Name',
        field: 'name',
        sortable: true
      }
    ]
    const rows = ref<Gender[]>([])
    const company = companyStore()
    const companyId = computed(() => company.companyId)
    const userStore = useUserStore()
    const userId = computed(() => userStore.userId)
    const selectedGender = ref<Gender[]>([])
    const canCreateNewGender = ref<boolean>(false)
    const canEditGenders = ref<boolean>(false)
    const canDeleteGenders = ref<boolean>(false)
    const canViewGenders = ref<boolean>(false)
    const deleteButtonDisabled = ref<boolean>(true)
    watch(companyId, () => {
      getPolicies()
      getAllGenders()
    })
    watch(userId, () => {
      joinReloadChannel()
    })
    onMounted(() => {
      // get permissions first
      getPolicies()
      joinReloadChannel()
      getAllGenders()
    })
    watch(canViewGenders, () => {
      getAllGenders()
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
          // just reload the companies
          loading.value = true
          selectedGender.value = []
          deleteButtonDisabled.value = true
          getAllGenders()
          rows.value = []
        })
    }
    function getPolicies () {
      if (companyId.value <= 0) { return }
      api.get('/api/policies/userManagement/genders/' + companyId.value)
        .then((res) => {
          AssignPolicies([
            { policyName: 'UserManagement_Gender_View_All', policyToAssign: canViewGenders },
            { policyName: 'UserManagement_Gender_Edit', policyToAssign: canEditGenders },
            { policyName: 'UserManagement_Gender_Create', policyToAssign: canCreateNewGender },
            { policyName: 'UserManagement_Gender_Delete', policyToAssign: canDeleteGenders }
          ], res.data.genderPolicies)
        })
    }
    function getAllGenders () {
      if (companyId.value <= 0) return
      if (!canViewGenders.value) return
      api.get('/api/genders/reduced/' + companyId.value)
        .then((response) => {
          rows.value = response.data.data
          loading.value = false
        })
        .catch((error) => {
          console.error(error)
        })
    }
    function deleteGenderConfirm () {
      $q.dialog({
        title: 'Geschlecht löschen',
        message: 'Möchtest du das ausgewählte Geschlecht wirklich löschen?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        deleteGender()
      })
    }
    function deleteGender () {
      selectedGender.value?.forEach((gender: Gender) => {
        api.post('/api/genders/delete/' + companyId.value, {
          gender_id: gender.id
        })
          .then(() => {
            const index = rows.value?.indexOf(gender)
            if (index !== undefined && index > -1) {
              rows.value?.splice(index, 1)
            }
            selectedGender.value = []
          })
          .catch((error) => {
            console.error(error)
          })
      })
    }
    function updateGender (newValue: string, gender: Gender) {
      api.patch('/api/genders/update/' + companyId.value, {
        name: newValue,
        gender_id: gender.id
      })
        .then(() => {
          getAllGenders()
        })
        .catch((error) => {
          console.error(error)
        })
    }
    return {
      pagination: ref({
        rowsPerPage: 0
      }),
      columns,
      loading,
      showCreateDialog: function () {
        $q.dialog({
          component: CreateNewGenderDialogComponent,
          ok: {
            push: true,
            label: 'Erstellen'
          }
        }).onOk((newGender: Gender) => {
          api.post('/api/genders/create/' + companyId.value, {
            name: newGender.name
          })
            .then(() => {
              getAllGenders()
            })
            .catch((e) => {
              console.error(e)
            })
        })
      },
      onMounted,
      rows,
      selectedGender,
      canCreateNewGender,
      canEditGenders,
      canDeleteGenders,
      deleteButtonDisabled,
      deleteGenderConfirm,
      updateGender
    }
  }
})
</script>

<style scoped>

</style>
