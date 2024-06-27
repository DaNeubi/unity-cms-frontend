<template>
  <q-card>
    <q-card-section>
      <div class="column q-gutter-sm">
        <div class="text-h4">
          Aktive/Wartende Freigaben
        </div>
        <div class="row q-gutter-md q-mt-sm">
          <q-card v-for="company in companiesWithAccess" :key="company.id"
                  :class="`col-auto ${ company.resolution === 1 || company.resolution ? 'resolution-bg' : ''} ${ (company.status === ExternalAccessRequestStatus.Canceled || company.status === ExternalAccessRequestStatus.Rejected) ? 'dimmed cursor-not-allowed' : ''}`">
            <q-card-section>
              <div class="row items-center q-gutter-md">
                <q-avatar rounded
                          :style="`background-color: ${ company?.company?.company_settings?.primary_color !== null &&
                        company?.company?.company_settings?.primary_color?.length > 0 ? company?.company?.company_settings?.primary_color : 'var(--q-secondary)'};`">
                  {{ company.company?.name?.charAt(0) }}
                </q-avatar>
                <div class="column">
                  <div class="text-h6">
                    {{ company.company?.name }}
                    <q-icon name="mdi-scale-balance" v-if="company.resolution" color="red-13"/>
                  </div>
                  <div class="text-body2 text-italic">
                    Anfrage gestellt um {{ FormatDateTime(company.created_at.toString()) }}
                  </div>
                </div>
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div v-if="company.note !== null && company.note?.length > 0">
                Notiz: {{ company.note }}
              </div>
              <div v-else>
                Keine Notiz beigefügt.
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div class="column q-gutter-md">
                <div class="row items-center">
                  <div>
                    Status:
                  </div>
                  <q-chip label="Warte auf Rückmeldung..." color="warning" class="col-auto" :ripple="false"
                          v-if="company.status === ExternalAccessRequestStatus.Pending" text-color="black"/>
                  <q-chip label="Angenommen" color="positive" class="col-auto" :ripple="false"
                          v-else-if="company.status === ExternalAccessRequestStatus.Accepted" text-color="black"/>
                  <q-chip label="Abgelehnt" color="negative" class="col-auto" :ripple="false"
                          v-else-if="company.status === ExternalAccessRequestStatus.Rejected" text-color="black"/>
                  <q-chip label="Zurückgezogen" color="negative" class="col-auto" :ripple="false"
                          v-else-if="company.status === ExternalAccessRequestStatus.Canceled" text-color="black"/>
                </div>
                <div class="row" v-if="company.status === ExternalAccessRequestStatus.Accepted">
                  <create-something-new-button text="Zur Übersicht" icon="mdi-domain" color="positive"
                                               @create-something-new="$emit('goToSelectedCompany', company.company_id)"/>
                </div>
              </div>
            </q-card-section>
            <q-separator v-if="company.status === ExternalAccessRequestStatus.Accepted && company.granted_by_id !== undefined"/>
            <q-card-section v-if="company.status === ExternalAccessRequestStatus.Accepted && company.granted_by_id !== undefined">
              <div class="column q-gutter-sm">
                <div>
                  Angenommen von: <q-chip :label="company.granted_by.first_name + ' ' + company.granted_by.last_name"
                                          color="primary" :ripple="false"/>
                </div>
                <div class="text-italic text-body2">
                  Angenommen um {{ FormatDateTime(company.updated_at.toString()) }}
                </div>
              </div>
            </q-card-section>
            <q-separator v-if="company.expires_at !== null"/>
            <q-card-section v-if="company.expires_at !== null">
              <div class="text-body1">
                Gültig bis: {{ FormatDateTime(company.expires_at.toString()) }}
              </div>
              <div v-if="company.timeRemaining === null">
                ~{{ calculateTimeRemaining(company.expires_at) }}
              </div>
              <div v-else :class="company.timeRemaining?.toString().includes('-') ? 'text-red-5' : 'text-green-6'">
                ~{{ company.timeRemaining }}
              </div>
            </q-card-section>
            <q-separator v-if="company.requested_by_id === userId"/>
            <q-card-section>
              <delete-something-button class="col-auto" text="Anfrage zurückziehen" icon="mdi-cloud-cancel-outline"
                                       @create-something-new="$emit('cancelRequest', company.id)"
                                       :disable="company.status === ExternalAccessRequestStatus.Accepted || company.status === ExternalAccessRequestStatus.Canceled || company.status === ExternalAccessRequestStatus.Rejected"/>
            </q-card-section>
            <q-separator v-if="company.resolution"/>
            <q-card-section v-if="company.resolution">
              <div class="text-body1">
                Diese Anfrage wurde mit einem Richterlichen Beschluss gestellt.
              </div>
            </q-card-section>
            <q-separator v-if="company.status === ExternalAccessRequestStatus.Canceled"/>
            <q-card-section v-if="company.status === ExternalAccessRequestStatus.Canceled">
              Abgebrochen am: {{ FormatDateTime(company.updated_at.toString()) }}
            </q-card-section>
            <q-separator v-if="company.status === ExternalAccessRequestStatus.Rejected"/>
            <q-card-section v-if="company.status === ExternalAccessRequestStatus.Rejected">
              Abgelehnt am: {{ FormatDateTime(company.updated_at.toString()) }}
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-card-section>
    <q-separator />
    <q-card-section>
      <div class="column q-gutter-sm">
        <div class="row items-center">
          <create-something-new-button text="Neue Zugriffsanfrage stellen" class="col-auto" icon="mdi-cloud-key-outline"
                                       :disable="selectedCompany === undefined || selectedCompany === null"
                                       @create-something-new="$emit('createAccessRequest', selectedCompany, resolution, note)"/>
          <q-checkbox v-model="resolution" label="Mit Richterlichem Beschluss?" class="col-auto"/>
          <div class="col-auto text-body2 q-ml-md text-red-5" v-if="resolution">
            Wenn Sie einen Richterlichen Beschluss haben, fügen Sie diesen bitte den Notizen an. Ihre Anfrage wird dann direkt an die Connect Internet Company geleitet.
          </div>
        </div>
        <q-select v-model="selectedCompany" :options="availableCompaniesWithoutAccess" clearable
                  :option-label="opt => opt.name" :option-value="opt => opt.id" use-input
                  label="Neue Zugriffsanfrage an ein Gewerbe stellen" outlined/>
        <q-input type="textarea" v-model="note" label="Notiz/Begründung (Kann auch leer gelassen werden)"
                 outlined counter maxlength="512"/>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, PropType, ref } from 'vue'
import ICompany from 'src/misc/interfaces/Company/ICompany'
import ICompanyExternalAccess from 'src/misc/interfaces/Company/ICompanyExternalAccess'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import FormatDateTime from '../../misc/functions/FormatDateTime'
import ExternalAccessRequestStatus from 'src/misc/Enums/ExternalAccess/ExternalAccessRequestStatus'
import DeleteSomethingButton from 'components/general/buttons/DeleteSomethingButton.vue'
import { date } from 'quasar'

const props = defineProps({
  companies: {
    type: Array as PropType<ICompany[]>,
    required: true
  },
  companiesWithAccess: {
    type: Array as PropType<ICompanyExternalAccess[]>,
    required: true
  },
  userId: {
    type: Number,
    required: true
  }
})

const availableCompaniesWithoutAccess = computed(() => {
  // return companies that have not a request pending with the status 1
  return props.companies.filter((company: ICompany) => {
    return !props.companiesWithAccess.some((access: ICompanyExternalAccess) => {
      return access.company_id === company.id && access.status === ExternalAccessRequestStatus.Pending
    })
  })
})
const selectedCompany = ref<ICompany>()
const resolution = ref<boolean>(false)
const note = ref<string|null>(null)
const availableCompaniesWithAccess = ref<ICompanyExternalAccess[]>(props.companiesWithAccess)
const timeout = ref()

defineEmits({
  createAccessRequest: (company: ICompany | undefined, resolution: boolean, note?: string | null) => {
    return {
      company,
      resolution,
      note
    }
  },
  cancelRequest: (accessRequestId: number) => accessRequestId,
  goToSelectedCompany: (companyId: number) => companyId
})

onMounted(() => {
  // calculate time remaining
  loopCalculateTimeRemaining()
})
onUnmounted(() => {
  clearInterval(timeout.value)
})
function loopCalculateTimeRemaining () {
  if (props.companiesWithAccess === null || props.companiesWithAccess.length === 0) return
  // check fir initial run
  if (availableCompaniesWithAccess.value !== null && availableCompaniesWithAccess.value?.length > 0) {
    availableCompaniesWithAccess.value.forEach((company: ICompanyExternalAccess) => {
      if (company.expires_at === null || company.expires_at === undefined) return
      company.timeRemaining = calculateTimeRemaining(company.expires_at)
    })
  }
  timeout.value = setInterval(() => {
    availableCompaniesWithAccess.value.forEach((company: ICompanyExternalAccess) => {
      if (company.expires_at === null || company.expires_at === undefined) return
      company.timeRemaining = calculateTimeRemaining(company.expires_at)
    })
  }, 30000)
}
function calculateTimeRemaining (expiresAt: string) {
  const now = new Date()
  const expires = new Date(expiresAt)
  const hourDiff = date.getDateDiff(expires, now, 'hours')
  if (hourDiff > 0) {
    return hourDiff + ' Stunden'
  }
  const minuteDiff = date.getDateDiff(expires, now, 'minutes')
  if (minuteDiff > 0) {
    return minuteDiff + ' Minuten'
  } else if (minuteDiff > -60 && hourDiff === -1) {
    return minuteDiff + ' Minuten'
  } else if (minuteDiff <= -60 && hourDiff < 0) {
    return hourDiff + ' Stunden'
  } else {
    return 'Abgelaufen'
  }
}
</script>

<style scoped>
.resolution-bg {
  background: -webkit-linear-gradient(#0A427288, #B3183688);
}
</style>
