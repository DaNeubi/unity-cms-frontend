<template>
  <div class="column">
    <q-card>
      <q-card-section>
        <div class="text-h4">
          Hier kannst du Nachrichten an alle Benutzer senden.
        </div>
        <q-separator/>
        <div>
          <q-input label="Nachricht an die User"
                   outlined
                   v-model="message"
                   class="q-mt-md"
                   type="textarea"/>
        </div>
      </q-card-section>
      <q-card-section>
        <q-select outlined
                  v-model="notificationType"
                  :options="notificationTypes"
                  label="Typ">
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-italic text-grey">
                Bitte was auswählen
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </q-card-section>
      <q-card-section>
        <q-btn color="primary"
               label="Nachricht abschicken"
               @click="sendNotification"/>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import NotificationType from '../../misc/Enums/Notification/NotificationType'

export default defineComponent({
  name: 'AdministrationNotification',
  setup () {
    const $q = useQuasar()
    const message = ref('')
    const notificationType = ref(null)
    const notificationTypes = ref([
      { label: 'Info', value: NotificationType.Info },
      { label: 'Warnung', value: NotificationType.Warning },
      { label: 'Fehler', value: NotificationType.Error },
      { label: 'Erfolg', value: NotificationType.Success }
    ])
    function sendNotification () {
      api.post('api/admin/global-notification', {
        message: message.value,
        type: notificationType.value.value
      }).then(() => {
        $q.notify({
          message: 'Nachricht wurde erfolgreich versendet',
          color: 'positive',
          position: 'top-right'
        })
        resetAfterSuccess()
      }).catch(() => {
        $q.notify({
          message: 'Nachricht konnte nicht versendet werden',
          color: 'negative',
          position: 'top-right'
        })
      })
    }
    function resetAfterSuccess () {
      message.value = ''
      notificationType.value = null
    }
    return {
      message,
      sendNotification,
      notificationType,
      notificationTypes
    }
  }
})
</script>

<style scoped>

</style>
