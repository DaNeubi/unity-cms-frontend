<template>
  <q-dialog ref="dialogRef" transition-show="scale" transition-hide="scale" persistent>
    <q-card class="q-pa-md dialog-size custom-card-size" >
      <q-card-section>
        <div class="column">
          <div class="text-h5 q-mb-md">Neuen Artikel hinzufügen</div>
          <q-scroll-area class="scroll-area-height">
            <div class="column q-gutter-sm">
              <q-input v-model="articleName"
                       outlined
                       :rules="[val => val.length > 0 || 'Name des Artikels ist notwendig']"
                       label="Name des neuen Artikels"
                       :error="checkNameLength"
                       error-message="Maximal 128 Zeichen"/>
              <q-input v-model="articleDescription"
                       outlined
                       label="Beschreibung des neuen Artikels"
                       :error="checkDescriptionLength"
                       error-message="Maximal 128 Zeichen"/>
              <q-input v-model.number="articlePurchasePrice"
                       outlined
                       type="number"
                       label="EK des neuen Artikels"
                       :error="checkPurchasePriceLength"
                       error-message="Minimal 0, Maximal bis 2147483647"/>
              <q-input v-model.number="articleSellingPrice"
                       outlined
                       type="number"
                       label="VK des neuen Artikels"
                       :error="checkSellingPriceLength"
                       error-message="Minimal 0, Maximal bis 2147483647"/>
              <q-input v-model.number="articleOrderNumber"
                       outlined
                       type="number"
                       label="Sortierungsnummer"
                       hint="Nur ändern, wenn auch die Nummern basierte Sortierung verwendet wird."
                       reactive-rules :rules="[val => val >= 0 || 'Die Sortierzahl muss mindestens 0 sein!',
                       val => val <= 65535 || 'Mehr als 65535 geht wirklich nicht. Sicher dass sich das brauchst?',
                       val => val.toString().length > 0 || 'Meister, ohne Sortierungsnummer wird das nix']"/>
              <q-separator class="q-mt-md q-mb-sm"/>
              <q-checkbox v-model="articleActive"
                          :label="`Aktiv nach dem erstellen? - ${ articleActive ? 'Ja': 'Nein' }`"
                          :color="`${ articleActive ? 'green' : 'red' }`"
                          keep-color/>
              <q-checkbox v-model="articleDiscountAvailable"
                          :label="`Rabatt ür diesen Artikel verfügbar? - ${ articleDiscountAvailable ? 'Ja': 'Nein' }`"
                          keep-color
                          :color="`${ articleDiscountAvailable ? 'green' : 'red' }`"/>
              <q-checkbox v-model="articleUserShareAvailable"
                          :label="`Mitarbeiter-Anteil für diesen Artikel verfügbar? - ${ articleUserShareAvailable ? 'Ja': 'Nein' }`"
                          keep-color
                          :color="`${ articleUserShareAvailable ? 'green' : 'red' }`"/>
              <q-checkbox v-model="createPurchaseFromSale"
                          :label="`Einkauf aus Verkauf? - ${ createPurchaseFromSale ? 'Ja': 'Nein' }`"
                          keep-color
                          :color="`${ articleUserShareAvailable ? 'green' : 'red' }`"/>
              <q-separator class="q-mt-md q-mb-md"/>
              <q-select v-model="selectedArticleType"
                        outlined
                        clearable
                        option-value="id"
                        option-label="name"
                        :options="availableOptionItemTypes"
                        @filter="filterItemType"
                        label="Artikeltyp"/>
              <q-select v-model="selectedArticleCategory"
                        outlined
                        clearable
                        option-value="id"
                        option-label="name"
                        :options="availableOptionItemCategories"
                        @filter="filterItemCategory"
                        label="Artikelkategorie"/>
            </div>
          </q-scroll-area>
        </div>
      </q-card-section>
      <q-card-actions>
        <DialogActionComponent @dialog-save-button="createNewArticle"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { computed, onMounted, ref } from 'vue'
import DialogActionComponent from 'components/general/dialogs/DialogActionComponent.vue'
import { api } from 'boot/axios'
import { companyStore } from 'stores/companyStore'
import { useDialogPluginComponent } from 'quasar'
import IItemType from 'src/misc/interfaces/Item/IItemType'
import IItemCategory from 'src/misc/interfaces/Item/IItemCategory'
import { IItem } from 'src/misc/interfaces/Item/IItem'

export default {
  name: 'CreateNewArticleDialogComponent',
  components: { DialogActionComponent },
  emits: [
    ...useDialogPluginComponent.emits
  ],
  setup () {
    const articleName = ref('')
    const articleDescription = ref('')
    const articlePurchasePrice = ref(0)
    const articleSellingPrice = ref(0)
    const articleOrderNumber = ref(0)
    const articleActive = ref(true)
    const articleDiscountAvailable = ref(true)
    const articleUserShareAvailable = ref(true)
    const selectedArticleType = ref<IItemType | null>(null)
    const selectedArticleCategory = ref<IItemCategory | null>(null)
    const createPurchaseFromSale = ref(false)
    const cStore = companyStore()
    const companyId = computed(() => cStore.companyId)
    const selectedSubArticles = ref(null)
    const { dialogRef, onDialogOK, onDialogHide } = useDialogPluginComponent()
    const availableItemTypes = ref<IItemType[]>([])
    const availableOptionItemTypes = ref<IItemType[]>([])
    const availableItemCategories = ref<IItemCategory[]>([])
    const availableOptionItemCategories = ref<IItemCategory[]>([])
    function filterItemType (val: string, update: (val: () => void) => void) {
      if (availableItemTypes.value !== undefined) {
        update(() => {
          const needle = val.toLowerCase()
          availableOptionItemTypes.value =
            availableItemTypes.value?.filter((v) => v.name.toLowerCase().indexOf(needle) > -1)
        })
      }
      api.get('/api/itemTypes/reducedForStock/' + companyId.value)
        .then((res) => {
          availableItemTypes.value = res.data.itemTypes
          const needle = val.toLowerCase()
          availableOptionItemTypes.value =
            availableItemTypes.value?.filter((v) => v.name.toLowerCase().indexOf(needle) > -1)
        })
        .catch((e) => {
          console.error(e)
        })
    }
    function filterItemCategory (val: string, update: (val: () => void) => void) {
      if (availableItemCategories.value !== undefined) {
        update(() => {
          const needle = val.toLowerCase()
          availableOptionItemCategories.value =
            availableItemCategories.value?.filter((v) => v.name.toLowerCase().indexOf(needle) > -1)
        })
      }
      api.get('/api/itemCategories/reducedForStock/' + companyId.value)
        .then((res) => {
          availableItemCategories.value = res.data.itemCategories
          const needle = val.toLowerCase()
          availableOptionItemCategories.value =
            availableItemCategories.value?.filter((v) => v.name.toLowerCase().indexOf(needle) > -1)
        })
        .catch((e) => {
          console.error(e)
        })
    }
    return {
      createNewArticle () {
        if (articlePurchasePrice.value === null || articleName.value.length < 1 || articlePurchasePrice.value < 0 || articleSellingPrice.value < 0) return
        onDialogOK({
          name: articleName.value,
          description: articleDescription.value,
          purchase_price: articlePurchasePrice.value,
          selling_price: articleSellingPrice.value,
          order_number: articleOrderNumber.value,
          active: articleActive.value,
          discount_available: articleDiscountAvailable.value,
          user_share: articleUserShareAvailable.value,
          item_type_id: selectedArticleType.value?.id,
          item_category_id: selectedArticleCategory.value?.id,
          expense_on_sale: createPurchaseFromSale.value
        } as IItem)
        onDialogHide()
      },
      articleName,
      articleDescription,
      articlePurchasePrice,
      articleSellingPrice,
      articleOrderNumber,
      articleActive,
      articleDiscountAvailable,
      articleUserShareAvailable,
      selectedArticleType,
      selectedArticleCategory,
      selectedSubArticles,
      checkNameLength: computed(() => (articleName.value.length > 128)),
      checkDescriptionLength: computed(() => (articleDescription.value.length > 128)),
      checkPurchasePriceLength: computed(() => (articlePurchasePrice.value > 2147483647) || (articlePurchasePrice.value < 0)),
      checkSellingPriceLength: computed(() => (articleSellingPrice.value > 2147483647) || (articleSellingPrice.value < 0)),
      onMounted,
      dialogRef,
      filterItemType,
      filterItemCategory,
      availableOptionItemTypes,
      availableOptionItemCategories,
      createPurchaseFromSale
    }
  }
}
</script>

<style scoped>
.custom-card-size {
  width: 50rem;
  height: 42rem;
  min-height: 30rem;
  overflow: hidden;
}
.scroll-area-height {
  max-width: 100%;
  min-width: 95%;
  width: 100%;
  height: 32rem;
}
</style>
