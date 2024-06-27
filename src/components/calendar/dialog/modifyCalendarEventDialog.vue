<template>
  <q-dialog ref="dialogRef"
            transition-show="scale"
            transition-hide="scale"
            :persistent="true">
    <q-card>
      <q-card-section>
        <div class="text-h3">
          {{ props.creating ? 'Neuer Termin erstellen' : 'Termin bearbeiten' }}
        </div>
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div class="col items-center q-gutter-md">
            <q-input label="Titel" v-model="title" outlined counter maxlength="128" :rules="[val => val.length > 0 || 'Das brauch ich schon...']"/>
            <q-input label="Details" v-model="details" outlined type="textarea" counter maxlength="2048"
                     :disable="shortDetailsDetails"/>
            <q-input label="Ort" v-model="location" outlined counter maxlength="128"
                     reactive-rules :rules="[val => val.length > 0 || 'Pflichtfeld!']"/>
            <q-input label="Kurzbeschreibung" v-model="shortDetails" type="textarea" autogrow
                     outlined counter maxlength="512"/>
            <q-checkbox v-model="shortDetailsDetails" label="Kurzbeschreibung statt Details verwenden?"/>
            <q-input outlined v-model="startDate" label="Startdatum">
              <template v-slot:prepend>
                <q-icon name="mdi-calendar" class="cursor-pointer" color="secondary">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="startDate" mask="YYYY-MM-DD HH:mm">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Schließen" color="primary" flat>
                        </q-btn>
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
              <template v-slot:append>
                <q-icon name="mdi-clock" class="cursor-pointer" color="secondary">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-time v-model="startDate" mask="YYYY-MM-DD HH:mm" format24h now-btn>
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Schließen" color="primary" flat>
                        </q-btn>
                      </div>
                    </q-time>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <q-input outlined v-model="endDate" label="Enddatum" :rules="[val => checkEndDateAfterStartDate() || 'Das Enddatum kann nicht vor dem Startdatum sein.']">
              <template v-slot:prepend>
                <q-icon name="mdi-calendar" class="cursor-pointer" color="secondary">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="endDate" mask="YYYY-MM-DD HH:mm">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Schließen" color="primary" flat>
                        </q-btn>
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
              <template v-slot:append>
                <q-icon name="mdi-clock" class="cursor-pointer" color="secondary">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-time v-model="endDate" mask="YYYY-MM-DD HH:mm" format24h now-btn>
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Schließen" color="primary" flat>
                        </q-btn>
                      </div>
                    </q-time>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <q-input outlined v-model="backgroundColor" label="Hintergrund Farbe" clearable>
              <template v-slot:append>
                <q-icon name="mdi-eyedropper-variant"
                        :style="`${backgroundColor.length > 0 ? 'color: ' + backgroundColor : ''}`"
                        class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-color v-model="backgroundColor" flat format-model="hexa"/>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <q-input outlined v-model="textColor" label="Text Farbe" clearable>
              <template v-slot:append>
                <q-icon name="mdi-eyedropper-variant"
                        :style="`${textColor.length > 0 ? 'color: ' + textColor : ''}`"
                        class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-color v-model="textColor" flat format-model="hexa"/>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>
      <q-card-section v-if="!creating && calendarEvent !== undefined">
        <div class="row">
          <div class="col-12">
            Erstellt am: {{ formatDateToGerman(calendarEvent?.created_at) }}
          </div>
          <div class="col-12">
            Zuletzt bearbeitet am: {{ formatDateToGerman(calendarEvent?.updated_at) }}
          </div>
        </div>
      </q-card-section>
      <q-card-section>
        Preview:
        <div class="row" :style="'background-color: ' + backgroundColor + ';' + 'color: ' + textColor + ';'">
          {{ title }}
        </div>
      </q-card-section>
      <q-card-section v-if="!notAllProvided" class="text-red-6 text-bold text-h5">
        Da fehlt noch was, so kann das Event nicht gespeichert werden.
      </q-card-section>
      <q-card-actions>
        <dialog-action-component @dialog-save-button="sendBackChanges()">
        </dialog-action-component>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent, date } from 'quasar'
import { computed, onMounted, ref } from 'vue'
import DialogActionComponent from 'components/general/dialogs/DialogActionComponent.vue'
import ICalendarEvent from 'src/misc/interfaces/Calendar/ICalendarEvent'

defineEmits([
  ...useDialogPluginComponent.emits
])
const props = defineProps({
  companyId: Number,
  calendarEvent: {
    type: Object as () => ICalendarEvent,
    required: true,
    default: undefined
  },
  creating: {
    type: Boolean,
    required: true,
    default: false
  },
  hasExtendedInformation: {
    type: Boolean,
    required: false,
    default: false
  }
})
const { dialogRef, onDialogOK } = useDialogPluginComponent()
const title = ref<string>(props.calendarEvent?.title ?? '')
const details = ref<string>(props.calendarEvent?.tooltip ?? '')
const startDate = ref<string>(date.formatDate(props.calendarEvent?.startDate, 'YYYY-MM-DD HH:mm') ?? date.formatDate(new Date(), 'YYYY-MM-DD HH:mm'))
const backgroundColor = ref<string>(props.calendarEvent?.bgColor ?? '')
const textColor = ref<string>(props.calendarEvent?.textColor ?? '')
const endDate = ref<string>(date.formatDate(new Date(), 'YYYY-MM-DD HH:mm'))
const id = ref<number>(props.calendarEvent?.id ?? Math.random())
const location = ref<string>(props.calendarEvent?.location ?? '')
const shortDetails = ref<string>(props.calendarEvent?.shortDetails ?? '')
const shortDetailsDetails = ref<boolean>(props.calendarEvent?.shortDetailsDetails ?? false)
const notAllProvided = computed(() => {
  return title.value.length > 1 && checkEndDateAfterStartDate() && location.value.length > 1
})

onMounted(() => {
  if (props.creating) return
  if (props.calendarEvent === undefined) return
  if (props.calendarEvent.endDate !== null) {
    endDate.value = date.formatDate(props.calendarEvent.endDate, 'YYYY-MM-DD HH:mm').toString()
  }
})

function sendBackChanges () {
  if (!notAllProvided.value) {
    return
  }
  if (shortDetailsDetails.value && shortDetails.value.length < 1) {
    return
  }
  onDialogOK({
    id: id.value,
    title: title.value,
    details: details.value,
    date: startDate.value,
    bgColor: backgroundColor.value,
    textColor: textColor.value,
    endDate: endDate.value,
    location: location.value,
    shortDetails: shortDetails.value,
    shortDetailsDetails: shortDetailsDetails.value
  })
}
function checkEndDateAfterStartDate () {
  return date.getDateDiff(startDate.value, endDate.value, 'minutes') < 0
}
function formatDateToGerman (startDate: string) {
  return date.formatDate(startDate, 'DD.MM.YYYY HH:mm')
}
</script>

<style scoped>

</style>
