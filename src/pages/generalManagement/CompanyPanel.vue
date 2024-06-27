<template>
  <div class="column q-gutter-md">
    <q-card>
      <q-card-section>
        <div class="column">
          <h4 class="q-mb-sm q-mt-sm">Firmen Panel</h4>
          <span class="hint-text">
            Panels erleichtern es dir, Links nach extern für deine Mitarbeiter/innen Zentral und einfach zur Verfügung zu stellen.
          </span>
          <span class="hint-text">
            Du kannst ein Panel so einschränken, dass nur gewisse Ränge zugriff darauf haben. Sofern kein Rang konfiguriert ist, können alle das Pannel sehen, sofern Sie die Berechtigung haben.
          </span>
        </div>
        <CreateSomethingNewButton text="Neues Firmenpanel erstellen"
                                  class="q-mt-sm"
                                  @create-something-new="showCreateDialog()"
                                  v-if="canCreateNewCompanyPanel"/>
      </q-card-section>
    </q-card>
    <div v-if="loading">
      <q-skeleton class="q-mt-md" height="4rem"/>
      <q-skeleton class="q-mt-md" height="4rem"/>
      <q-skeleton class="q-mt-md" height="4rem"/>
    </div>
    <q-card v-else>
      <q-card-section>
        <div class="column q-gutter-md">
          <CompanyPanelComponent v-for="companyPanel in companyPanels"
                                 :key="companyPanel.name"
                                 :companyPanel="companyPanel"
                                 :can-edit="canEditCompanyPanelPermissions"
                                 :can-delete="canDeleteCompanyPanel"
                                 :company-id="companyId"
                                 :ranks="ranks"/>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import CompanyPanelComponent from 'components/generalManagement/CompanyPanel/CompanyPanelComponent.vue'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import CreateNewCompanyPanelDialog from 'components/generalManagement/Dialogs/CreateNewCompanyPanelDialog.vue'
import laravelEcho from 'boot/laravelecho'
import { useUserStore } from 'stores/useUserStore'
import { companyStore } from 'stores/companyStore'
import { ICompanyPanel } from 'src/misc/interfaces/CompanyPanel/ICompanyPanel'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import Rank from 'src/misc/classes/Rank/Rank'
import AssignPolicies from 'src/misc/functions/policies/Policies'

export default defineComponent({
  name: 'CompanyPanel',
  components: { CreateSomethingNewButton, CompanyPanelComponent },
  setup () {
    const $q = useQuasar()
    const userStore = useUserStore()
    const userId = computed(() => userStore.userId)
    const cStore = companyStore()
    const companyId = computed(() => cStore.companyId)
    const companyPanels = ref<ICompanyPanel[]>()
    const ranks = ref<Rank[]>()
    const canCreateNewCompanyPanel = ref<boolean>(false)
    const canUpdateCompanyPanel = ref<boolean>(false)
    const canDeleteCompanyPanel = ref<boolean>(false)
    const canEditCompanyPanelPermissions = ref<boolean>(false)
    const loading = ref<boolean>(true)
    watch(companyId, () => {
      getPermissions()
      getAllCompanyPanels()
    })
    onMounted(() => {
      joinReloadChannel()
      // get permissions
      getPermissions()
      getAllCompanyPanels()
    })
    onUnmounted(() => {
      // stop listening to the change event
      laravelEcho.leave('user.reload.' + userId.value)
    })
    watch(userId, () => {
      joinReloadChannel()
    })
    function joinReloadChannel () {
      if (userId.value <= 0) { return }
      // listen to the change event
      laravelEcho.private('user.reload.' + userId.value)
        .listen('.user.reload', () => {
          // just reload the companies
          loading.value = true
          getAllCompanyPanels()
        })
    }
    function getPermissions () {
      if (companyId.value <= 0) { return }
      api.get('/api/policies/generalManagement/companyPanels/' + companyId.value)
        .then((res) => {
          AssignPolicies([
            { policyName: 'GeneralManagement_CompanyPanel_Create', policyToAssign: canCreateNewCompanyPanel },
            { policyName: 'GeneralManagement_CompanyPanel_Update', policyToAssign: canUpdateCompanyPanel },
            { policyName: 'GeneralManagement_CompanyPanel_Delete', policyToAssign: canDeleteCompanyPanel },
            { policyName: 'GeneralManagement_CompanyPanel_Edit_Permissions', policyToAssign: canEditCompanyPanelPermissions }
          ], res.data.companyPanelPolicies)
        })
        .catch((err) => {
          console.error(err)
        })
    }
    function getAllCompanyPanels () {
      if (companyId.value <= 0) { return }
      api.get('/api/companyPanels/reduced/' + companyId.value)
        .then((res) => {
          companyPanels.value = res.data.companyPanels
          ranks.value = res.data.ranks
          loading.value = false
        })
        .catch((err) => {
          console.error(err)
        })
    }
    function showCreateDialog () {
      $q.dialog({
        component: CreateNewCompanyPanelDialog,
        ok: {
          push: true,
          label: 'Speichern'
        }
      })
        .onOk((data) => {
          createNewCompanyPanel(data as ICompanyPanel)
        })
    }
    function createNewCompanyPanel (newPanel: ICompanyPanel) {
      api.post('/api/companyPanels/create/' + companyId.value, {
        name: newPanel.name,
        url: newPanel.url
      })
        .then(() => {
          getAllCompanyPanels()
        })
        .catch((err) => {
          console.error(err)
        })
    }
    return {
      companyPanels,
      showCreateDialog,
      canCreateNewCompanyPanel,
      canUpdateCompanyPanel,
      canDeleteCompanyPanel,
      canEditCompanyPanelPermissions,
      loading,
      companyId,
      ranks
    }
  }
})
</script>
