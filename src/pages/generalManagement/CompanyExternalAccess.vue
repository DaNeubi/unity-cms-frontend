<template>
  <q-table class="cms-sticky-header-table default-table-height" :columns="columns" :rows="externalAccess"
           row-key="id" :rows-per-page-options="[0]" virtual-scroll :pagination="{ rowsPerPage: 0 }"
           :virtual-scroll-item-size="30" :virtual-scroll-sticky-size-start="30" :loading="loading"
           @virtual-scroll="onScroll">
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td v-for="headerVal in columns" :key="headerVal.name" :props="props">
          <div v-if="headerVal.name === 'requested_by_id'">
            {{ props.row.requested_by.first_name }} {{ props.row.requested_by.last_name }}
          </div>
          <div v-else-if="headerVal.name === 'granted_by_id'">
            {{ props.row?.granted_by?.first_name }} {{ props.row?.granted_by?.last_name }}
          </div>
          <div v-else-if="headerVal.name === 'area'">
            {{ formatExternalAccessToGerman(props.row[headerVal.name]) }}
          </div>
          <div v-else-if="headerVal.name === 'status'">
            <q-chip label="Warte auf Rückmeldung..." :ripple="false" v-if="props.row[headerVal.name] === ExternalAccessRequestStatus.Pending"
                    color="warning"/>
            <q-chip label="Angenommen" :ripple="false" v-if="props.row[headerVal.name] === ExternalAccessRequestStatus.Accepted"
                    color="positive"/>
            <q-chip label="Zurückgezogen" :ripple="false" v-if="props.row[headerVal.name] === ExternalAccessRequestStatus.Canceled"
                    color="negative"/>
            <q-chip label="Abgelehnt" :ripple="false" v-if="props.row[headerVal.name] === ExternalAccessRequestStatus.Rejected"
                    color="negative"/>
          </div>
          <div v-else-if="headerVal.name === 'created_at'">
            {{ FormatDateTime(props.row[headerVal.name]) }}
          </div>
          <div v-else-if="headerVal.name === 'updated_at'">
            {{ FormatDateTime(props.row[headerVal.name]) }}
          </div>
          <div v-else-if="headerVal.name === 'action'">
            <div class="row items-center q-gutter-md justify-center">
              <create-something-new-button text="Freigeben" v-if="canAcceptOrDecline" color="positive"
                                           :disable="props.row.status !== ExternalAccessRequestStatus.Pending"
                                           @create-something-new="showAcceptDialog(props.row.id)"/>
              <create-something-new-button text="Ablehnen" v-if="canAcceptOrDecline" color="negative"
                                           @create-something-new="showRejectDialog(props.row.id)"
                                           :disable="props.row.status !== ExternalAccessRequestStatus.Pending"/>
            </div>
          </div>
          <div v-else>
            {{ props.row[headerVal.name] }}
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { companyStore } from 'stores/companyStore'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useUserStore } from 'stores/useUserStore'
import { api } from 'boot/axios'
import AssignPolicies from 'src/misc/functions/policies/Policies'
import ICompanyExternalAccess from 'src/misc/interfaces/Company/ICompanyExternalAccess'
import formatExternalAccessToGerman from 'src/misc/functions/externalAccess/FormatExternalAccessToGerman'
import ExternalAccessRequestStatus from 'src/misc/Enums/ExternalAccess/ExternalAccessRequestStatus'
import FormatDateTime from '../../misc/functions/FormatDateTime'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import { useQuasar } from 'quasar'
import handleExternalAccessDialog from 'components/government/dialog/handleExternalAcessDialog.vue'
import laravelEcho from 'boot/laravelecho'

const company = companyStore()
const companyId = computed(() => company.companyId)
const userStore = useUserStore()
const userId = computed(() => userStore.userId)
const canViewHistory = ref<boolean>(false)
const canAcceptOrDecline = ref<boolean>(false)
const externalAccess = ref<ICompanyExternalAccess[]>([])
const columns = [
  { name: 'requested_by_id', label: 'Angefragt von', field: 'requested_by_id' },
  { name: 'granted_by_id', label: 'Bearbeitet von', field: 'granted_by_id' },
  { name: 'area', label: 'Bereich', field: 'area' },
  { name: 'note', label: 'Notiz/Hinweis', field: 'note' },
  { name: 'status', label: 'Status', field: 'status' },
  { name: 'expires_at', label: 'Gültig bis', field: 'expires_at' },
  { name: 'created_at', label: 'Angefordert am', field: 'created_at' },
  { name: 'updated_at', label: 'Aktualisiert am', field: 'updated_at' },
  { name: 'action', label: 'Aktion', field: 'action' }
]
const nextPage = ref(-1)
const loading = ref(false)
const lastPage = computed(() => Math.ceil(externalAccess.value?.length / 30))
const $q = useQuasar()

onMounted(() => {
  // get all permissions
  getPermissions()
  // join the reload channel
  joinReloadChannel()
})
onUnmounted(() => {
  // stop listening to the change event
  laravelEcho.leave('user.reload.' + userId.value)
})
watch(companyId, () => {
  // get all permissions
  getPermissions()
})
watch(userId, () => {
  // join the reload channel
  // stop listening to the change event
  laravelEcho.leave('user.reload.' + userId.value)
  joinReloadChannel()
})
function joinReloadChannel () {
  if (userId.value <= 0) { return }
  // listen to the change event
  laravelEcho.private('user.reload.' + userId.value)
    .listen('.user.reload', () => {
      // just reload
      externalAccess.value = []
      loading.value = false
      nextPage.value = -1
      onScroll({ to: 0, form: 0, index: 0 })
    })
}
function getPermissions () {
  if (companyId.value <= 0) return
  api.get('/api/policies/externalAccess/' + companyId.value)
    .then((response) => {
      AssignPolicies([
        { policyName: 'GeneralManagement_ExternalAccess_View_All', policyToAssign: canViewHistory },
        { policyName: 'GeneralManagement_ExternalAccess_Edit', policyToAssign: canAcceptOrDecline }
      ], response.data)
    })
    .catch((error) => {
      console.error(error)
    })
}
function onScroll (obj: { to: number, form: number, index: number }) {
  if (companyId.value <= 0) return
  const lastIndex = externalAccess.value?.length - 1
  if (!loading.value && nextPage.value < lastPage.value && obj.to === lastIndex) {
    loading.value = true
    api.get('/api/externalAccess/all/' + companyId.value + '?offset=' + externalAccess.value.length ?? 0)
      .then((res) => {
        externalAccess.value?.push(...res.data)
        loading.value = false
        nextPage.value++
      })
      .catch((error) => {
        console.error(error)
      })
  }
}
function showAcceptDialog (requestId: number) {
  $q.dialog({
    component: handleExternalAccessDialog,
    componentProps: {
      accept: true
    }
  })
    .onOk((duration: number) => {
      permitAccessRequest(requestId, duration)
    })
}
function permitAccessRequest (requestId: number, expiryDuration: number) {
  if (companyId.value <= 0) return
  api.patch('/api/externalAccess/permit/' + companyId.value, {
    access_id: requestId,
    duration: expiryDuration
  })
    .then(() => {
      // just reload
      externalAccess.value = []
      loading.value = false
      nextPage.value = -1
      onScroll({ to: 0, form: 0, index: 0 })
    })
    .catch((error) => {
      console.error(error)
    })
}
function showRejectDialog (requestId: number) {
  $q.dialog({
    title: 'Sicher, dass die Anfrage abgelehnt werden soll?',
    message: 'Die Anfrage wird abgelehnt, das kann nicht rückgängig gemacht werden. Sicher?',
    ok: {
      label: 'Ja, bin mir sicher',
      color: 'warning'
    },
    cancel: {
      label: 'Nein',
      color: 'negative'
    }
  }).onOk(() => {
    rejectAccessRequest(requestId)
  })
}
function rejectAccessRequest (requestId: number) {
  if (companyId.value <= 0) return
  api.patch('/api/externalAccess/reject/' + companyId.value, {
    access_id: requestId
  })
    .then(() => {
      // just reload
      externalAccess.value = []
      loading.value = false
      nextPage.value = -1
      onScroll({ to: 0, form: 0, index: 0 })
    })
    .catch((error) => {
      console.error(error)
    })
}
</script>

<style scoped>

</style>
