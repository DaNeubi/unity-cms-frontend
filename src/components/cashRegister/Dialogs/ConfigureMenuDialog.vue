<template>
  <q-dialog ref="dialogRef" transition-show="scale" transition-hide="scale">
    <q-card class="q-pa-sm">
      <q-card-section>
        <div class="text-h5" v-if="editing">Menü bearbeiten</div>
        <div class="text-h5" v-else>Menü zusammenstellen</div>
      </q-card-section>
      <q-card-section>
        <div class="row items-center justify-center"
             v-for="currentCategory in item.item_menu_categories"
             :key="currentCategory.id">
          <div class="col-12">
            <div class="row justify-center items-center">
              <div class="text-h5">
                <b>{{ currentCategory.item_category?.name }}</b>&nbsp;
              </div>
              <div class="text-body2">
                Maximal {{ currentCategory.amount }} Stück
              </div>
            </div>
          </div>
          <div v-if="checkIfCurrentCategoryItemsExceedAmountLimit(currentCategory)">
            Das ist zu viel!
          </div>
          <div class="col-12" v-if="currentCategory.item_category?.items?.length <= 0">
            <div class="text-h3 q-mt-sm">
              Hier is ja gar nix drin!?
            </div>
            <div class="hint-text q-mt-md">
              Ich glaub ja da hat jemand verkackt😉
            </div>
          </div>
          <div class="col-12" v-else>
            <div class="row items-baseline justify-evenly"
                 v-for="currentItem in currentCategory.item_category?.items"
                 :key="currentItem.id">
              <div class="col-4">
                {{ currentItem.name}}
              </div>
              <div class="col-5 q-mt-sm">
                <q-input outlined dense type="number" v-model.number="currentItem.amount" :min="0"
                         :rules="[val => val >= 0 || 'Mindestens 0', val => val !== null || 'Da muss schon mindestens 0 rein']"
                         :bg-color="checkIfCurrentCategoryItemsExceedAmountLimit(currentCategory) ? 'red-5' : undefined"
                         :max="currentCategory.amount"/>
              </div>
              <div>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-card-actions>
        <DialogActionComponent @dialog-save-button="saveMenuAndReturn()" @dialog-cancel-button="resetItemMenuCategoriesAmount()"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { IItem } from 'src/misc/interfaces/Item/IItem'
import { useDialogPluginComponent } from 'quasar'
import DialogActionComponent from 'components/general/dialogs/DialogActionComponent.vue'
import IItemMenuCategory from 'src/misc/interfaces/Item/IItemMenuCategory'
import IItemMenu from 'src/misc/interfaces/Item/IItemMenu'

export default defineComponent({
  name: 'ConfigureMenuDialog',
  components: { DialogActionComponent },
  emits: [
    ...useDialogPluginComponent.emits
  ],
  props: {
    item: {
      type: Object as () => IItem,
      required: true
    },
    editing: {
      type: Boolean,
      required: false,
      default: false
    },
    itemMenu: {
      type: Object as () => IItemMenu,
      required: false
    }
  },
  setup (props) {
    const { dialogRef, onDialogOK } = useDialogPluginComponent()
    function checkIfCurrentCategoryItemsExceedAmountLimit (currentCategory: IItemMenuCategory) {
      const max = currentCategory.amount
      let sum = 0
      currentCategory.item_category?.items?.forEach((item) => {
        sum += +item.amount
      })
      return sum > max
    }
    function saveMenuAndReturn () {
      // create new menu
      const itemMenu: IItemMenu = {
        id: Math.random(),
        item_id: JSON.parse(JSON.stringify(props.item.id)),
        item_menu_category: JSON.parse(JSON.stringify(props.item.item_menu_categories))
      }
      // reset item_menu_categories amount for items
      resetItemMenuCategoriesAmount()
      onDialogOK(itemMenu)
    }
    function resetItemMenuCategoriesAmount () {
      props.item.item_menu_categories?.forEach((itemMenuCategory) => {
        itemMenuCategory.item_category?.items?.forEach((item) => {
          item.amount = 0
        })
      })
    }
    return {
      dialogRef,
      checkIfCurrentCategoryItemsExceedAmountLimit,
      saveMenuAndReturn,
      resetItemMenuCategoriesAmount
    }
  }
})
</script>

<style scoped>

</style>
