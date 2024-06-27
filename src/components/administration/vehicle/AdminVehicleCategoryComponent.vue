<template>
  <CreateSomethingNewButton text="Fahrzeugkategorie erstellen" @click="showCreateDialog()" v-if="canCreateCategory"/>
  <DeleteSomethingButton text="Fahrzeugkategorie löschen" @click="submitForDelete()" class="q-ml-md"
                         v-if="canDeleteCategory" :disable="categoriesForDelete.length < 1"/>
  <EditSomethingButton text="Fahrzeugkategorie aktualisieren" @click="submitForEdit()" class="q-ml-md"
                        v-if="canEditCategory" :disable="categoriesForEdit.length < 1"/>
  <q-table class="default-table-height q-mt-md full-width" virtual-scroll title="Alle Fahrzeugkategorien"
           :columns="columns" :rows="categories" row-key="id" :loading="loading"
           :pagination="{ rowsPerPage: 100 }" :selection="canDeleteCategory ? 'multiple' : 'none'"
           v-model:selected="categoriesForDelete" :filter="filterCategory">
    <template v-slot:top-right>
      <q-input borderless dense debounce="250" v-model="filterCategory" placeholder="Kategorie suchen...">
        <template v-slot:append>
          <q-icon name="mdi-magnify"/>
        </template>
      </q-input>
    </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td v-if="canDeleteCategory">
          <q-checkbox color="accent" v-model="props.selected"/>
        </q-td>
        <q-td v-for="headerVal in columns" :key="headerVal.name" :props="props">
          <div v-if="headerVal.name === 'created_at' || headerVal.name === 'updated_at'">
            {{ FormatDateTime(props.row[headerVal.name]) }}
          </div>
          <div v-else-if="headerVal.name === 'name'" class="cursor-pointer">
            {{ props.row[headerVal.name] }}
            <q-popup-edit :model-value="props.row[headerVal.name]" v-slot="scope" buttons label-set="Aktualisieren"
                          label-cancel="Abbrechen" v-if="canEditCategory"
                          @save="(val) => editVehicleCategory(val, props.row, headerVal.name)">
              <q-input v-model="scope.value" dense autofocus maxlength="100" counter outlined/>
            </q-popup-edit>
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script setup lang="ts">

import { onMounted, ref } from 'vue'
import IVehicleCategory from 'src/misc/interfaces/Vehicle/IVehicleCategory'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import FormatDateTime from 'src/misc/functions/FormatDateTime'
import CreateNewVehicleCategoryDialog from 'components/administration/vehicle/dialog/CreateNewVehicleCategoryDialog.vue'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import DeleteSomethingButton from 'components/general/buttons/DeleteSomethingButton.vue'
import EditSomethingButton from 'components/general/buttons/EditSomethingButton.vue'

const categories = ref<IVehicleCategory[]>([])
const categoriesForEdit = ref<IVehicleCategory[]>([])
const categoriesForDelete = ref<IVehicleCategory[]>([])
const loading = ref<boolean>(false)
const $q = useQuasar()
const filterCategory = ref<string>('')
const columns = [{ name: 'name', label: 'Name', field: 'name' },
  { name: 'created_at', label: 'Erstellt am', field: 'created_at' },
  { name: 'updated_at', label: 'Aktualisiert am', field: 'updated_at' }]

defineProps({
  canCreateCategory: {
    type: Boolean,
    required: true,
    default: false
  },
  canDeleteCategory: {
    type: Boolean,
    required: true,
    default: false
  },
  canEditCategory: {
    type: Boolean,
    required: true,
    default: false
  }
})

onMounted(() => {
  getAllCategories()
})

function getAllCategories () {
  loading.value = true
  api.get('/api/administration/vehicleCategories/all')
    .then((response) => {
      categories.value = response.data
      loading.value = false
    })
    .catch((error) => {
      console.error(error)
    })
}
function showCreateDialog () {
  $q.dialog({
    component: CreateNewVehicleCategoryDialog
  })
    .onOk((newCategory: IVehicleCategory) => {
      api.post('/api/administration/vehicleCategories/create', {
        name: newCategory.name
      })
        .then((response) => {
          categories.value.push(response.data)
        })
        .catch((error) => {
          console.error(error)
        })
    })
}
function editVehicleCategory (newValue: string, category: IVehicleCategory, valueChanged: string) {
  category[valueChanged] = newValue
  if (categoriesForEdit.value.find((value) => value.id === category.id) === undefined) {
    categoriesForEdit.value.push(category)
  }
}
function submitForEdit () {
  if (categoriesForEdit.value.length < 1) return
  api.patch('/api/administration/vehicleCategories/edit', {
    categories: categoriesForEdit.value
  })
    .then(() => {
      categoriesForEdit.value = []
    })
    .catch((error) => {
      console.error(error)
    })
}
function submitForDelete () {
  if (categoriesForDelete.value.length < 1) return
  api.post('/api/administration/vehicleCategories/delete', {
    categories: categoriesForDelete.value
  })
    .then(() => {
      categories.value = categories.value.filter((value) => !categoriesForDelete.value.includes(value))
      categoriesForDelete.value = []
    })
    .catch((error) => {
      console.error(error)
    })
}
</script>

<style scoped>

</style>
