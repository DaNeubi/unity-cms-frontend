<template>
  <q-dialog transition-show="scale"
            transition-hide="scale"
            persistent
            ref="dialogRef">
    <q-card class="q-pa-lg dialog-size">
      <q-card-section>
        <div class="column">
          <div class="text-h5 q-mb-md">Neuen Bewerber hinzufügen</div>
          <div>
            <q-input v-model="firstName"
                     outlined
                     counter
                     hint="*Pflichtfeld"
                     maxlength="48"
                     label="Vorname"
                     class="q-mt-md"/>
            <q-input v-model="lastName"
                     outlined
                     counter
                     hint="*Pflichtfeld"
                     maxlength="48"
                     label="Nachname"
                     class="q-mt-sm"/>
            <q-input v-model="phoneNumber"
                     outlined
                     counter
                     hint="*Pflichtfeld"
                     maxlength="16"
                     label="Telefonnummer"
                     class="q-mt-sm"/>
          </div>
          <q-separator class="q-mt-sm"/>
          <div class="column q-mt-md">
            <span class="text-h6">Benutzerdefinierte Felder:</span>
            <q-input outlined
                     v-if="customFields.custom_field_1 !== null"
                     v-model="field1Value"
                     counter maxlength="250"
                     :label="customFields.custom_field_1"/>
            <q-input outlined
                     v-if="customFields.custom_field_2 !== null"
                     v-model="field2Value"
                     class="q-mt-md"
                     counter maxlength="250"
                     :label="customFields.custom_field_2"/>
            <q-input outlined
                     v-if="customFields.custom_field_3 !== null"
                     v-model="field3Value"
                     class="q-mt-md"
                     counter maxlength="128"
                     :label="customFields.custom_field_3"/>
            <q-checkbox v-model="field4Value" :label="customFields.custom_field_4" class="q-mt-md" :false-value="0"
                        :indeterminate-value="null" v-if="customFields.custom_field_4 !== null" :true-value="1" />
            <q-checkbox v-model="field5Value" :label="customFields.custom_field_5" class="q-mt-md" :false-value="0"
                        :indeterminate-value="null" v-if="customFields.custom_field_5 !== null" :true-value="1" />
            <q-checkbox v-model="field6Value" :label="customFields.custom_field_6" class="q-mt-md" :false-value="0"
                        :indeterminate-value="null" v-if="customFields.custom_field_6 !== null" :true-value="1" />
          </div>
        </div>
      </q-card-section>
      <q-card-actions>
        <DialogActionComponent @dialog-save-button="createNewApplicant()"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import DialogActionComponent from 'components/general/dialogs/DialogActionComponent.vue'
import IApplicantCustomFields from 'src/misc/interfaces/Applicant/IApplicantCustomFields'
import { api } from 'boot/axios'
import { useDialogPluginComponent } from 'quasar'

export default defineComponent({
  name: 'CreateNewApplicantDialogComponent',
  components: { DialogActionComponent },
  emits: [
    ...useDialogPluginComponent.emits
  ],
  props: {
    customFields: {
      type: Object as () => IApplicantCustomFields,
      required: true
    },
    companyId: {
      type: Number,
      required: true
    }
  },
  setup (props) {
    const firstName = ref<string>()
    const lastName = ref<string>()
    const phoneNumber = ref<string>()
    const field1Value = ref<string | null>(null)
    const field2Value = ref<string | null>(null)
    const field3Value = ref<string | null>(null)
    const field4Value = ref<number | null>(null)
    const field5Value = ref<number | null>(null)
    const field6Value = ref<number | null>(null)
    const { dialogRef, onDialogOK } = useDialogPluginComponent()

    function createNewApplicant () {
      if (firstName.value === undefined || lastName.value === undefined || phoneNumber.value === undefined) {
        return
      }
      api.post('/api/companyApplicants/create/' + props.companyId, {
        first_name: firstName.value,
        last_name: lastName.value,
        phone_number: phoneNumber.value,
        custom_field_1: field1Value.value,
        custom_field_2: field2Value.value,
        custom_field_3: field3Value.value,
        custom_field_4: field4Value.value,
        custom_field_5: field5Value.value,
        custom_field_6: field6Value.value
      })
        .then(() => {
          onDialogOK()
        })
        .catch((error) => {
          console.error(error)
        })
    }
    return {
      firstName,
      lastName,
      phoneNumber,
      field1Value,
      field2Value,
      field3Value,
      field4Value,
      field5Value,
      field6Value,
      createNewApplicant,
      dialogRef
    }
  }
})
</script>

<style scoped>
.dialog-size {
  width: 50rem;
}
</style>
