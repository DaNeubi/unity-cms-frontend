<template>
  <q-card>
    <q-card-section>
      <div class="row q-gutter-md">
        <div class="col-4"
             v-if="canEditCompanyLogo">
          <q-file v-model="newCompanyLogo"
                  outlined
                  use-chips
                  max-file-size="1048576"
                  label="Neues Logo auswählen"
                  @rejected="(rej) => showNewImageErrorNotification(rej[0].failedPropValidation)"
                  counter>
            <template v-slot:prepend>
              <q-icon name="mdi-cloud-upload"/>
            </template>
          </q-file>
          <q-btn color="primary"
                 label="Hochladen"
                 :disable="newCompanyLogo === null"
                 @click="uploadNewImage"/>
          <br/>
          <span class="hint-text">
            Die maximale Größe für Bilder beträgt 1 MiB. Optimal sind 512px x 512px.<br/>
            Akzeptierte Formate sind: jpg, jpeg, png, svg.
          </span>
        </div>
        <div class="col-6">
          <q-img
            :src="companyLogoUrl"
            style="width: 128px;"/>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { api } from 'src/boot/axios'
import { defineComponent, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'

export default defineComponent({
  name: 'CompanySettingsUpdateImageComponent',
  components: {},
  props: {
    companyId: {
      type: Number,
      required: true
    },
    canEditCompanyLogo: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  setup (props) {
    const $q = useQuasar()
    const baseUrl = process.env.BACKEND_SERVER
    const companyLogoUrl = ref<string>('https://wawi-unitymanage-filestorage-01.b-cdn.net/wawi-general/platzhalter.jpg?width=128&height=128')
    const newCompanyLogo = ref(null)
    onMounted(async () => {
      getCurrentLogo()
    })
    function getCurrentLogo () {
      if (props.companyId <= 0) { return }
      api.get('/api/companySettings/logo/reduced/' + props.companyId)
        .then((res) => {
          companyLogoUrl.value = baseUrl + '/' + res.data.company.logo
        })
        .catch((err) => {
          console.error(err)
        })
    }
    function uploadNewImage () {
      if (newCompanyLogo.value === null) return
      const formData = new FormData()
      formData.append('logo', newCompanyLogo.value)
      api.post('/api/companySettings/logo/upload/' + props.companyId, formData)
        .catch((err) => {
          console.error(err)
        })
      // reset file input
      newCompanyLogo.value = null
    }
    function showNewImageErrorNotification (type: string) {
      let message = 'Allgemeiner Fehler'
      switch (type) {
        case 'max-file-size':
          message = 'Deine Datei is einfach zu groß Meister🧐'
          break
      }
      $q.notify({
        message: 'Fehler bei deinem Bild: ' + message,
        color: 'warning',
        position: 'top-right',
        timeout: 5000,
        icon: 'mdi-alert-circle',
        progress: true
      })
    }
    return {
      companyLogoUrl,
      uploadNewImage,
      baseUrl,
      newCompanyLogo,
      showNewImageErrorNotification
    }
  }
})
</script>

<style scoped>

</style>
