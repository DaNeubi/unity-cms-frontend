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
              <create-something-new-button text="Freigeben" color="positive"
                                           :disable="props.row.status !== ExternalAccessRequestStatus.Pending"
                                           @create-something-new="showAcceptDialog(props.row.id, props.row.company_id)"/>
              <create-something-new-button text="Ablehnen" color="negative"
                                           @create-something-new="showRejectDialog(props.row.id, props.row.company_id)"
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
import ExternalAccessRequestStatus from 'src/misc/Enums/ExternalAccess/ExternalAccessRequestStatus'
import formatExternalAccessToGerman from 'src/misc/functions/externalAccess/FormatExternalAccessToGerman'
import FormatDateTime from 'src/misc/functions/FormatDateTime'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import { useUserStore } from 'stores/useUserStore'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import ICompanyExternalAccess from 'src/misc/interfaces/Company/ICompanyExternalAccess'
import laravelEcho from 'boot/laravelecho'
import { api } from 'boot/axios'
import handleExternalAccessDialog from 'components/government/dialog/handleExternalAcessDialog.vue'
import { useQuasar } from 'quasar'

const userStore = useUserStore()
const userId = computed(() => userStore.userId)
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
  // join the reload channel
  joinReloadChannel()
})
onUnmounted(() => {
  // stop listening to the change event
  laravelEcho.leave('user.reload.' + userId.value)
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
function onScroll (obj: { to: number, form: number, index: number }) {
  const lastIndex = externalAccess.value?.length - 1
  if (!loading.value && nextPage.value < lastPage.value && obj.to === lastIndex) {
    loading.value = true
    api.get('/api/externalAccess/all?offset=' + externalAccess.value.length ?? 0)
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
function showAcceptDialog (requestId: number, companyId: number) {
  $q.dialog({
    component: handleExternalAccessDialog,
    componentProps: {
      accept: true
    }
  })
    .onOk((duration: number) => {
      permitAccessRequest(requestId, duration, companyId)
    })
}
function permitAccessRequest (requestId: number, expiryDuration: number, companyId: number) {
  api.patch('/api/externalAccess/accept', {
    access_id: requestId,
    duration: expiryDuration,
    company_id: companyId
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
function showRejectDialog (requestId: number, companyId: number) {
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
    rejectAccessRequest(requestId, companyId)
  })
}
function rejectAccessRequest (requestId: number, companyId: number) {
  api.patch('/api/externalAccess/decline', {
    access_id: requestId,
    company_id: companyId
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
