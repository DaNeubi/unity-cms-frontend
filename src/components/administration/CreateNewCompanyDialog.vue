<template>
  <q-dialog ref="dialogRef" transition-show="scale" transition-hide="scale" persistent>
    <q-card class="q-pa-lg">
      <q-card-section>
        <div class="text-h5">Neues Gewerbe erstellen</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <div class="column">
          <q-input label="Name des neuen Gewerbes"
                   v-model="newCompany.name"
                   hint="Bis zu 150 Zeichen"
                   :error="!validateCompanyName"
                   error-message="Ich hab gesagt maximal 150 Zeichen 😠"
          />
          <q-input label="Kontonummer des neuen Gewerbes"
                   v-model="newCompany.bank_account_number"
                   hint="Format: LS12345678"
                   mask="AA########"
                   class="q-mt-sm"
                   :error="!validateCompanyBankAccountNumber"
                   error-message="Bitte auf das Format der Kontonummer achten!"
          />
          <q-input label="Leitstelle des neuen Gewerbes"
                   v-model="newCompany.phone_number"
                   hint="Bis zu 32 Zeichen"
                   class="q-mt-sm"
                   :error="!validateCompanyPhoneNumber"
                   error-message="Auf die Anzahl der Zeichen achten!"
          />
          <q-select label="Inhaber"
                    v-model="companyOwners"
                    multiple
                    use-chips
                    clearable
                    use-input
                    input-debounce="0"
                    :options="optionsUsers"
                    @filter="filterUser"
                    class="q-mt-sm">
            <template v-slot:option="{ itemProps, opt}">
              <q-item v-bind="itemProps">
                <q-item-section>{{ opt.first_name + ' ' + opt.last_name + ' - ' + opt.email }}</q-item-section>
              </q-item>
            </template>
            <template v-slot:selected-item="{ itemProps, opt }">
              <q-chip color="negative" v-bind="itemProps">
                {{ opt.first_name + ' ' + opt.last_name }}
              </q-chip>
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  Da hamma nix
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
      </q-card-section>
      <q-card-section>
        <div class="column">
          <q-checkbox v-model="availableModules.dms"
                      label="Dokumenten Management System"
                      color="pink-3">
            <q-tooltip>
              Erlaubt das erstellen, bearbeiten, löschen und teilen von Dokumenten.
            </q-tooltip>
          </q-checkbox>
          <q-checkbox v-model="availableModules.crm"
                      label="Customer Relashionship Management"
                      color="pink-3">
            <q-tooltip>
              Erlaubt das erstellen von Personen und zuweisen von Dokumenten, sofern das DMS Modul aktiviert ist.
            </q-tooltip>
          </q-checkbox>
          <q-checkbox v-model="availableModules.fms" keep-color
                      label="Fahrzeug Management System"
                      color="pink-3">
            <q-tooltip>
              Erlaubt das erstellen und Managen der eigenen Fahrzeugflotte.
            </q-tooltip>
          </q-checkbox>
          <q-checkbox v-model="availableModules.rtl" keep-color
                      label="Retail/Verkaufs Modul"
                      color="pink-3">
            <q-tooltip>
              Das Retail Modul ermöglicht das erstellen von Produkten und das verkaufen dieser.
            </q-tooltip>
          </q-checkbox>
          <q-checkbox v-model="availableModules.wms" keep-color
                      label="Waren/Lager Management System"
                      color="pink-3">
            <q-tooltip>
              Dieses Modul ergänzt das Retail Modul um ein Lager und Waren System.
            </q-tooltip>
          </q-checkbox>
          <q-checkbox v-model="availableModules.cms" keep-color
                      label="Vertrags Management System"
                      color="pink-3">
            <q-tooltip>
              Dieses Modul ermöglicht das erstellen von Verträgen und das verwalten dieser.
            </q-tooltip>
          </q-checkbox>
          <q-checkbox v-model="availableModules.cal"
                      label="Kalender Modul"
                      color="pink-3">
            <q-tooltip>
              Dieses Modul ermöglicht das erstellen von Terminen und das verwalten dieser.
            </q-tooltip>
          </q-checkbox>
        </div>
      </q-card-section>
      <q-card-actions>
        <DialogActionComponent @dialog-save-button="createNewCompany"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import DialogActionComponent from 'components/general/dialogs/DialogActionComponent.vue'
import { api } from 'boot/axios'
import { useQuasar, useDialogPluginComponent } from 'quasar'
import { AvailableUsersForCompany } from 'src/misc/classes/Administration/AvailableUsersForCompany'
import ICompanyModuleAccess from 'src/misc/interfaces/Company/ICompanyModuleAccess'

export default defineComponent({
  name: 'CreateNewCompanyDialog',
  components: { DialogActionComponent },
  emits: [
    ...useDialogPluginComponent.emits
  ],
  setup () {
    const $q = useQuasar()
    const newCompany = ref({
      name: '',
      bank_account_number: 'LS',
      logo: null,
      phone_number: ''
    })
    const availableUsers = ref<AvailableUsersForCompany[]>()
    const availableOptionsUsers = ref<AvailableUsersForCompany[]>()
    const optionsUsers = computed(() => availableOptionsUsers.value)
    const companyOwners = ref<AvailableUsersForCompany[]>()
    const availableModules = ref<ICompanyModuleAccess>({
      id: 0, company_id: 0, lst: false, elst: false, dms: false, crm: false, er: false, fms: true, rtl: true, wms: true, cms: true, cal: false, taxmax: false, statistics: false
    })
    const { dialogRef, onDialogOK } = useDialogPluginComponent()
    function filterUser (val: string, update: (val: () => void) => void) {
      if (availableUsers.value !== undefined) {
        update(() => {
          const needle = val.toLowerCase()
          availableOptionsUsers.value =
            availableUsers.value?.filter((v) => v.first_name.toLowerCase().indexOf(needle) > -1 ||
              v.last_name.toLowerCase().indexOf(needle) > -1 ||
              v.email.toLowerCase().indexOf(needle) > -1) || []
        })
      }
      api.get('/api/user/reduced-for-company-creation')
        .then((response) => {
          availableUsers.value = response.data.users
          update(() => {
            const needle = val.toLowerCase()
            availableOptionsUsers.value =
              availableUsers.value?.filter((v) => v.first_name.toLowerCase().indexOf(needle) > -1 ||
                v.last_name.toLowerCase().indexOf(needle) > -1 ||
                v.email.toLowerCase().indexOf(needle) > -1) || []
          })
        })
        .catch((error) => {
          $q.notify({
            color: 'negative',
            position: 'top-right',
            message: 'Benutzer konnten nicht abgerufen werden! ' + error,
            icon: 'mdi-alert-circle'
          })
        })
    }
    return {
      newCompany,
      createNewCompany () {
        const ownas: number[] = []
        companyOwners.value?.forEach((owner) => {
          ownas.push(owner.id)
        })
        api.post('/api/companies', {
          name: newCompany.value.name,
          bank_account_number: newCompany.value.bank_account_number,
          phone_number: newCompany.value.phone_number,
          owners: ownas,
          modules: availableModules.value
        })
          .catch((e) => {
            console.error(e)
          })
        onDialogOK()
      },
      validateCompanyName: computed(() => newCompany.value.name.length <= 150),
      validateCompanyBankAccountNumber: computed(() => newCompany.value.bank_account_number.startsWith('LS') &&
        newCompany.value.bank_account_number.length <= 32),
      validateCompanyPhoneNumber: computed(() => newCompany.value.phone_number.length <= 32 &&
        newCompany.value.phone_number.length > 0 ? /^\d+$/.test(newCompany.value.phone_number) : true),
      companyOwners,
      availableUsers,
      filterUser,
      optionsUsers,
      dialogRef,
      availableModules
    }
  }
})
</script>

<style scoped>

</style>
