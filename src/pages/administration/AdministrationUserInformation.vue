<template>
  <q-card>
    <q-card-section>
      <div class="row q-gutter-sm items-center">
        <create-something-new-button text="Feld hinzufügen" @click="addField()"/>
        <q-select v-model="selectedField" :options="availableFields" class="col-md-3 col-lg-2"
                  label="Feld auswählen" outlined :option-label="val => val.name" clearable/>
      </div>
    </q-card-section>
    <q-separator/>
    <q-card-section>
      <div class="text-h4">
        Hier sind alle verfügbaren Felder, welche von den Usern ausgefüllt werden können.
      </div>
      <div class="hint-text">
        Im Feld 'Name für das Feld' muss der Name eingegeben werden, der dann für den User später sichtbar ist.<br/>
        Wenn der Haken bei 'Pflichtfeld' gesetzt ist, muss der User das Feld ausfüllen.<br/>
        Die Reihenfolge der Felder ist nicht relevant.<br/>
        Wenn ein Feld als 'Zu löschen' markiert ist, wird es für den user nicht mehr angezeigt, die Informationen bleiben jedoch erhalten.
      </div>
    </q-card-section>
    <q-separator/>
    <q-card-section>
      <div class="row">
        <edit-something-button text="Speichern" class="col-md-3 col-lg-2" @click="saveFields()"/>
      </div>
    </q-card-section>
    <q-separator/>
    <q-card-section>
      <div class="column">
        <div class="col-12" v-for="field in currentFields" :key="field.id">
          <div class="row items-center">
            <q-input v-model="field.name" outlined label="Name für das Feld" class="col-md-4 col-lg-5" color="secondary"/>
            <q-chip :label="`Typ: ${getFieldNameById(field.dynamic_field_id)}`" color="deep-orange-8"/>
            <q-checkbox v-model="field.required" label="Pflichtfeld" color="secondary" :true-value="1" :false-value="0"/>
            <q-checkbox v-model="field.deprecated" label="Zu löschen" color="secondary" :true-value="1" :false-value="0"/>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import IDynamicField from 'src/misc/interfaces/DynamicField/IDynamicField'
import IUserInformationField from 'src/misc/interfaces/User/IUserInformationField'
import { api } from 'boot/axios'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import EditSomethingButton from 'components/general/buttons/EditSomethingButton.vue'

const availableFields = ref<IDynamicField[]>([])
const currentFields = ref<IUserInformationField[]>([])
const selectedField = ref<IDynamicField|null|undefined>()

onMounted(() => {
  getAvailableFields()
  getCurrentFields()
})

function getAvailableFields () {
  api.get('/api/userAdditionalInformation/fields')
    .then((response) => {
      availableFields.value = response.data
    })
    .catch((error) => {
      console.error(error)
    })
}
function getCurrentFields () {
  api.get('/api/userAdditionalInformation/currentFields')
    .then((response) => {
      currentFields.value = response.data
    })
    .catch((error) => {
      console.error(error)
    })
}
function addField () {
  if (selectedField.value === null || selectedField.value === undefined) return
  currentFields.value?.push({
    id: Math.random(),
    name: '',
    dynamic_field_id: selectedField.value.id,
    dynamicField: selectedField.value,
    required: 0,
    deprecated: 0
  } as unknown as IUserInformationField)
  selectedField.value = undefined
}
function saveFields () {
  if (currentFields.value === null || currentFields.value === undefined) return
  // check if any field is set to be deprecated with
  api.patch('/api/userAdditionalInformation/updateFields',
    {
      fields: currentFields.value
    })
    .catch((error) => {
      console.error(error)
    })
}
function getFieldNameById (id: number) {
  return availableFields.value.find((field) => field.id === id)?.name
}
</script>

<style scoped>

</style>
