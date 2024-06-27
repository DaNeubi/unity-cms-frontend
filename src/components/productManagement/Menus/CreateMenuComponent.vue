<template>
  <q-stepper v-model="step"
             :header-nav="true"
             class="full-width"
             active-color="accent"
             done-color="primary"
             animated>
    <q-step :name="1"
            title="Grundlagen einstellen"
            icon="mdi-pencil"
            :done="step > 1">
      <div class="row q-gutter-md q-pa-sm">
        <q-input outlined
                 label="Name"
                 v-model="name"
                 class="col-12"
                 hint="Name des Menüs/Bundles"
                 :rules="[val => val.length > 0 || 'Name muss angegeben werden']"/>
        <q-input outlined
                 label="Beschreibung"
                 v-model="description"
                 class="col-12"
                 hint="Beschreibung des Menüs/Bundles"/>
        <q-select v-model="selectedCategory"
                  use-input
                  class="col-12"
                  label="Kategorie"
                  hint="Hinweis: Die Kategorie, die hier ausgewählt wird, kann nicht mehr bei den Kategorien für die Artikel ausgewählt werden."
                  outlined
                  :options="availableOptionItemCategories"
                  option-value="id"
                  option-label="name"
                  clearable
                  @filter="filterItemCategory"/>
        <q-input outlined
                 v-model.number="sellingPrice"
                 label="Verkaufspreis in $"
                 type="number"
                 hint="Der Einkaufspreis wird automatisch beim Buchen errechnet."
                 class="col-12"
                 :min="0" />
        <q-checkbox v-model="active"
                    label="Aktiv in der Kasse?"
                    class="col-12"/>
        <q-checkbox v-model="discount"
                    label="Rabattfähig?"
                    class="col-12"/>
        <q-checkbox v-model="employeeShare"
                    label="Mitarbeiter-Anteil? Überschreibt den Mitarbeiter-Anteil der einzelnen Artikel."
                    class="col-12"/>
        <q-stepper-navigation class="col-12">
          <div class="row justify-around">
            <q-btn label="Abbrechen"
                   icon="mdi-cancel"
                   color="primary"
                   @click="$emit('menu-created')"/>
            <q-btn label="Weiter"
                   icon="mdi-arrow-right"
                   color="primary"
                   @click="() => { step = 2; }"/>
          </div>
        </q-stepper-navigation>
      </div>
    </q-step>
    <q-step :name="2"
            title="Artikelkategorien hinzufügen"
            icon="mdi-shape-plus"
            :done="step > 2">
      <div class="row q-gutter-md">
        <div class="row q-gutter-md">
          <div class="col-12">
            <div class="hint-text">
              Hier kannst du aus den vorhandenen Kategorien auswählen und eine Anzahl hinzufügen
            </div>
          </div>
          <q-select v-model="selectedItemCategoryToAdd"
                    multiple
                    use-input
                    class="col-12"
                    clearable
                    outlined
                    label="Kategorien für das Menü"
                    :options="forMenuAvailableItemCategories"
                    option-value="id"
                    option-label="name"
                    use-chips
                    @filter="filterItemCategory">
            <template v-slot:selected-item="scope">
              <q-chip removable
                      color="accent"
                      @remove="scope.removeAtIndex(scope.index)">
                {{ scope.opt.name }}
              </q-chip>
            </template>
          </q-select>
          <div class="col-12 q-mt-lg q-mb-lg">
            <q-btn label="Ausgewählte Kategorien hinzufügen"
                   icon="mdi-plus"
                   @click="addSelectedCategories()"
                   color="primary"/>
          </div>
          <div class="col-12">
            <div class="row items-baseline justify-evenly">
              <div class="col-7">
                <div class="text-h5">Anzahl der Kategorie im Menü</div>
              </div>
              <div class="col-4">
                <div class="text-h5">Kategorie</div>
              </div>
            </div>
            <div class="row items-baseline justify-evenly"
                 v-for="category in selectedItemMenuCategories"
                 :key="category.id">
              <div class="col-7">
                <q-input v-model.number="category.amount"
                         type="number"
                         :min="-1"
                         :max="32000"
                         outlined
                         hint="-1 für unbegrenzt"/>
              </div>
              <div class="col-4">
                {{ category.itemCategory?.name }}
              </div>
            </div>
          </div>
        </div>
        <q-stepper-navigation class="col-12">
          <div class="row justify-around">
            <q-btn label="Zurück"
                   icon="mdi-arrow-left"
                   color="primary"
                   @click="() => { step = 1; }"/>
            <q-btn label="Weiter"
                   icon="mdi-arrow-right"
                   color="primary"
                   @click="() => { step = 3; }"/>
          </div>
        </q-stepper-navigation>
      </div>
    </q-step>
    <q-step :name="3"
            title="Überprüfen"
            icon="mdi-magnify"
            :done="step > 3">
      <div class="row q-gutter-md">
        <div class="row items-baseline">
          <div class="col-12">
            <div class="text-body1">
              Name*: {{ name }}
            </div>
          </div>
          <div class="col-12">
            <div class="text-body1">
              Beschreibung*: {{ description }}
            </div>
          </div>
          <div class="col-12">
            <div class="text-body1">

            </div>
          </div>
          <div class="col-12">
            <div class="text-body1">
              Eigene Kategorie: {{ selectedCategory?.name }}
            </div>
          </div>
          <div class="col-12 q-mt-md">
            <q-separator />
          </div>
          <div class="col-12 q-mt-md">
            <div class="row items-baseline justify-evenly">
              <div class="col-5">
                <div class="text-h5">Kategorie</div>
              </div>
              <div class="col-6">
                <div class="text-h5">Anzahl der Kategorie im Menü</div>
              </div>
            </div>
            <div class="row items-baseline justify-around"
                 v-for="category in selectedItemMenuCategories"
                 :key="category.id + Math.random()">
              <div class="col-5">
                {{ category.itemCategory?.name }}
              </div>
              <div class="col-6">
                {{ category.amount }}x
              </div>
            </div>
          </div>
        </div>
        <q-stepper-navigation class="col-12">
          <div class="row justify-around">
            <q-btn label="Zurück"
                   icon="mdi-arrow-left"
                   color="primary"
                   @click="() => { step = 2; }"/>
            <q-btn label="Speichern"
                   icon="mdi-content-save"
                   color="primary"
                   @click="createNewMenu()"/>
          </div>
        </q-stepper-navigation>
      </div>
    </q-step>
  </q-stepper>
</template>

<script setup lang="ts">
import IItemCategory from 'src/misc/interfaces/Item/IItemCategory'
import { computed, ref, watch } from 'vue'
import { api } from 'boot/axios'
import IItemMenuCategory from 'src/misc/interfaces/Item/IItemMenuCategory'
import { IItem } from 'src/misc/interfaces/Item/IItem'

const emits = defineEmits(['menu-created'])
const props = defineProps({
  companyId: {
    type: Number,
    required: true,
    default: 0
  }
})
const step = ref<number>(1)
const name = ref<string>('')
const description = ref<string>('')
const sellingPrice = ref<number>(0)
const active = ref<boolean>(true)
const order = ref<number>(0)
const discount = ref<boolean>(true)
const employeeShare = ref<boolean>(true)
const selectedCategory = ref<IItemCategory>()
const availableItemCategories = ref<IItemCategory[]>()
const availableOptionItemCategories = ref<IItemCategory[]>()
const forMenuAvailableItemCategories = computed(() => {
  if (availableItemCategories.value !== undefined) {
    return availableItemCategories.value.filter((v) => v.id !== selectedCategory.value?.id && !alreadyAddedCategories.value?.includes(v))
  }
  return []
})
const selectedItemCategoryToAdd = ref<IItemCategory[]>()
const selectedItemMenuCategories = ref<IItemMenuCategory[]>()
const alreadyAddedCategories = ref<IItemCategory[]>()
watch(() => props.companyId, () => {
  if (availableItemCategories.value !== undefined) {
    api.get('/api/itemCategories/reducedForStock/' + props.companyId)
      .then((res) => {
        availableItemCategories.value = res.data.itemCategories
      })
      .catch((err) => {
        console.error(err)
      })
  }
})
function filterItemCategory (val: string, update: (val: () => void) => void) {
  if (availableItemCategories.value !== undefined) {
    update(() => {
      const needle = val.toLowerCase()
      availableOptionItemCategories.value =
        availableItemCategories.value?.filter((v) => v.name.toLowerCase().indexOf(needle) > -1)
    })
  }
  api.get('/api/itemCategories/reducedForStock/' + props.companyId)
    .then((res) => {
      availableItemCategories.value = res.data.itemCategories
      const needle = val.toLowerCase()
      availableOptionItemCategories.value =
        availableItemCategories.value?.filter((v) => v.name.toLowerCase().indexOf(needle) > -1)
    })
    .catch((err) => {
      console.error(err)
    })
}
function addSelectedCategories () {
  if (selectedItemMenuCategories.value === undefined) {
    selectedItemMenuCategories.value = []
  }
  if (alreadyAddedCategories.value === undefined) {
    alreadyAddedCategories.value = []
  }
  // add the selected categories as item menu categories
  selectedItemCategoryToAdd.value?.forEach((category) => {
    const itemMenuCategory: IItemMenuCategory = {
      id: Math.random(),
      item_category_id: category.id,
      itemCategory: category,
      amount: 0
    }
    selectedItemMenuCategories.value?.push(itemMenuCategory)
    alreadyAddedCategories.value?.push(category)
    selectedItemCategoryToAdd.value?.splice(selectedItemCategoryToAdd.value?.indexOf(category), 1)
  })
}
function createNewMenu () {
  // check that everything has been provided
  if (name.value === undefined || name.value === '' ||
    selectedItemMenuCategories.value === undefined || selectedItemMenuCategories.value.length === 0) {
    return
  }
  emits('menu-created', {
    name: name.value,
    description: description.value,
    selling_price: sellingPrice.value,
    active: active.value,
    order_number: order.value,
    discount_available: discount.value,
    user_share: employeeShare.value,
    item_category_id: selectedCategory.value?.id,
    item_menu_categories: selectedItemMenuCategories.value
  } as IItem)
}
</script>

<style scoped>

</style>
