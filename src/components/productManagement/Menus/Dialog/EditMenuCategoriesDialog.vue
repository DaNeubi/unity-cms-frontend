<template>
  <q-dialog ref="dialogRef"
            transition-show="scale"
            transition-hide="scale"
            persistent>
    <q-card>
      <q-card-section>
        <div class="row">
          <q-select v-model="selectedItemCategories"
                    use-input
                    label="Artikelkategorien"
                    :options="availableOptionItemCategoriesWithoutCurrent"
                    option-value="id"
                    option-label="name"
                    class="col-12"
                    clearable
                    multiple
                    @filter="filterItemCategory"/>
          <div class="col-12">
            <CreateSomethingNewButton text="Ausgewählte Kategorien hinzufügen"
                                      class="q-mt-md"
                                      @create-something-new="addSelectedCategoriesToCurrentCategories()"/>
          </div>
          <div class="col-12 q-mt-md">
            <div class="row items-baseline justify-evenly">
              <div class="col-4">
                Anzahl
              </div>
              <div class="col-5">
                Kategorie
              </div>
              <div class="col-2">
                Aktion
              </div>
            </div>
            <div class="row items-baseline justify-evenly q-mt-sm"
                 v-for="currentCategory in currentlyIncludedItemCategories"
                 :key="currentCategory.id">
              <div class="col-4">
                <q-input type="number"
                         :min="0"
                         :max="32000"
                         outlined
                         dense
                         v-model.number="currentCategory.amount"/>
              </div>
              <div class="col-5">
                {{ currentCategory.item_category?.name }}
              </div>
              <div class="col-2">
                <DeleteSomethingButton text="Entfernen"
                                       @createSomethingNew="removeSelectedCategory(currentCategory)"/>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-card-actions>
        <DialogActionComponent @dialog-save-button="saveMenuCategoryChanges()"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { UnwrapRef, computed, defineComponent, onMounted, ref } from 'vue'
import { IItem } from 'src/misc/interfaces/Item/IItem'
import { api } from 'boot/axios'
import IItemCategory from 'src/misc/interfaces/Item/IItemCategory'
import { useDialogPluginComponent } from 'quasar'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import IItemMenuCategory from 'src/misc/interfaces/Item/IItemMenuCategory'
import DialogActionComponent from 'components/general/dialogs/DialogActionComponent.vue'
import DeleteSomethingButton from 'components/general/buttons/DeleteSomethingButton.vue'

export default defineComponent({
  name: 'EditMenuCategoriesDialog',
  components: { DeleteSomethingButton, DialogActionComponent, CreateSomethingNewButton },
  emits: [
    ...useDialogPluginComponent.emits
  ],
  props: {
    menu: {
      type: Object as () => IItem,
      required: true
    },
    companyId: {
      type: Number,
      required: true,
      default: 0
    },
    availableCategories: {
      type: Array as () => IItemCategory[],
      required: false,
      default: () => undefined
    }
  },
  setup (props) {
    const availableItemCategories = ref<IItemCategory[]>()
    const availableOptionItemCategories = ref<IItemCategory[]>()
    const availableOptionItemCategoriesWithoutCurrent = computed(() => {
      // remove the already included categories and the menu category itself from the available categories
      const tempCategories = availableOptionItemCategories.value?.filter((itemCategory) => {
        return currentlyIncludedItemCategories.value?.find((currentCategory) => {
          return currentCategory.item_category_id === itemCategory.id
        }) === undefined
      })
      return tempCategories?.filter((itemCategory) => itemCategory.id !== props.menu.item_category?.id)
    })
    const selectedItemCategories = ref<IItemCategory[]>()
    const { dialogRef, onDialogOK } = useDialogPluginComponent()
    const currentlyIncludedItemCategories = ref<IItemMenuCategory[]>([])
    onMounted(() => {
      // add the already given categories from the prop menu
      currentlyIncludedItemCategories.value?.push(...props.menu?.item_menu_categories ?? [])
      // add the itemCategories if available
      if (props.availableCategories !== undefined) {
        availableItemCategories.value = props.availableCategories
        availableOptionItemCategories.value = props.availableCategories
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
    }
    function addSelectedCategoriesToCurrentCategories () {
      // add the selected categories to the current categories
      currentlyIncludedItemCategories.value?.push(...selectedItemCategories.value?.map((itemCategory) => {
        return {
          id: Math.random(),
          item_category: itemCategory,
          item_category_id: itemCategory.id,
          amount: 0
        }
      }) ?? [])
      // clear the selected categories
      selectedItemCategories.value = []
    }
    function removeSelectedCategory (category: UnwrapRef<IItemMenuCategory>) {
      currentlyIncludedItemCategories.value?.splice(
        currentlyIncludedItemCategories.value?.findIndex((itemCategory) => itemCategory.id === category.id),
        1
      )
    }
    function saveMenuCategoryChanges () {
      onDialogOK(currentlyIncludedItemCategories.value)
    }
    return {
      props,
      filterItemCategory,
      availableOptionItemCategories,
      availableItemCategories,
      dialogRef,
      selectedItemCategories,
      currentlyIncludedItemCategories,
      addSelectedCategoriesToCurrentCategories,
      availableOptionItemCategoriesWithoutCurrent,
      saveMenuCategoryChanges,
      removeSelectedCategory
    }
  }
})
</script>

<style scoped>

</style>
