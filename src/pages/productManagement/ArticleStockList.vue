<template>
  <div>
    <q-tabs v-model="tab" inline-label align="left">
      <CreateItemStockTabComponent name="new_article_stock"
                                   label="Neues Lager anlegen"
                                   icon="mdi-plus-circle-outline"
                                   id="-1"
                                   v-if="canCreateItemStock"/>
      <ItemStockTabComponent v-for="itemStock in itemStocks"
                             :name="`${ itemStock.name + itemStock.id }`"
                             :key="itemStock.id"
                             :label="`${ itemStock.name }`"
                             :isDefault="itemStock.is_default ? 1 : 0"/>
    </q-tabs>
    <q-tab-panels v-model="tab">
      <CreateItemStockTabContentComponent name="new_article_stock-1"
                                          v-if="canCreateItemStock" @item-stock-created="getArticleStocks()"
                                          :can-create="canCreateItemStock"/>
      <ItemStockTabContentComponent v-for="itemStockContent in itemStocks" :itemStock="itemStockContent"
                                    :name="`${ itemStockContent.name + itemStockContent.id }`" :key="itemStockContent.id"
                                    :can-edit="canEditItemStock" @item-stock-deleted="updateDeletedItemStock"
                                    @item-stock-updated="(val) => updateItemStockName(val, itemStockContent.id)"
                                    :can-change-default="canChangeDefault" :can-delete="canDeleteItemStock"/>
    </q-tab-panels>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import CreateItemStockTabComponent from 'components/productManagement/ItemStock/CreateItemStockTabComponent.vue'
import ItemStockTabComponent from 'components/productManagement/ItemStock/ItemStockTabComponent.vue'
import ItemStockTabContentComponent from 'components/productManagement/ItemStock/ItemStockTabContentComponent.vue'
import CreateItemStockTabContentComponent
  from 'components/productManagement/ItemStock/CreateItemStockTabContentComponent.vue'
import { companyStore } from 'stores/companyStore'
import { useUserStore } from 'stores/useUserStore'
import { api } from 'src/boot/axios'
import laravelEcho from 'boot/laravelecho'
import IItemStock from 'src/misc/interfaces/Item/IItemStock'
import UserNotification from 'src/misc/classes/User/UserNotification'
import NotificationType from 'src/misc/Enums/Notification/NotificationType'
import AssignPolicies from 'src/misc/functions/policies/Policies'

const tab = ref('Lager werden geladen')
const itemStocks = ref<IItemStock[] | undefined>([])
const cStore = companyStore()
const userStore = useUserStore()
const userId = computed(() => userStore.userId)
const companyId = computed(() => cStore.companyId)
const canCreateItemStock = ref<boolean>(false)
const canEditItemStock = ref<boolean>(false)
const canDeleteItemStock = ref<boolean>(false)
const canChangeDefault = ref<boolean>(false)
const loading = ref<boolean>(true)
watch(companyId, () => {
  getPermissions()
  getArticleStocks()
})
onMounted(() => {
  // get permissions
  getPermissions()
  joinReloadChannel()
  getArticleStocks()
})
watch(userId, () => {
  joinReloadChannel()
})
onUnmounted(() => {
  // stop listening to the change event
  laravelEcho.leave('user.reload.' + userId.value)
})
function joinReloadChannel () {
  if (userId.value <= 0) return
  // listen to the change event
  laravelEcho.private('user.reload.' + userId.value)
    .listen('.user.reload', (cb : UserNotification) => {
      // just reload the stocks
      if (cb.userNotification.notificationType !== NotificationType.Error) {
        getArticleStocks()
      }
    })
}
function getPermissions () {
  if (companyId.value <= 0) return
  api.get('/api/policies/productManagement/itemStocks/' + companyId.value)
    .then((res) => {
      AssignPolicies([
        { policyName: 'ProductManagement_ArticleStock_Create', policyToAssign: canCreateItemStock },
        { policyName: 'ProductManagement_ArticleStock_Update', policyToAssign: canEditItemStock },
        { policyName: 'ProductManagement_ArticleStock_Delete', policyToAssign: canDeleteItemStock },
        { policyName: 'ProductManagement_ArticleStock_Change_Default', policyToAssign: canChangeDefault }
      ], res.data.itemStockPolicies)
    })
    .catch((e) => {
      console.error(e)
    })
}
function loadingStocks () {
  loading.value = true
  itemStocks.value = undefined
  const loadingStock: IItemStock = {
    id: 0,
    name: 'Lager werden geladen',
    content: 'Lager werden geladen',
    is_default: false,
    company_id: companyId.value,
    created_at: '',
    item_stock_items: [],
    item_stock_item_types: []
  }
  itemStocks.value = []
  itemStocks.value?.push(loadingStock)
}
function getArticleStocks () {
  if (companyId.value <= 0) return
  loadingStocks()
  api.get('/api/itemStocks/reduced/' + companyId.value)
    .then((res) => {
      itemStocks.value = res.data.itemStocks
      if (itemStocks.value !== undefined && itemStocks.value.length > 0) {
        loading.value = false
        tab.value = itemStocks.value[0].name + itemStocks.value[0].id
      }
    })
    .catch((e) => {
      console.error(e)
    })
}
function updateDeletedItemStock (id: number) {
  if (itemStocks.value === undefined) return
  const index = itemStocks.value.findIndex((itemStock) => itemStock.id === id)
  if (index >= 0) {
    itemStocks.value.splice(index, 1)
    tab.value = itemStocks.value[0].name + itemStocks.value[0].id
  }
}
function updateItemStockName (name: string | undefined, id: number) {
  if ((name === undefined || name.length <= 0) || id <= 0) return
  if (itemStocks.value === undefined) return
  const index = itemStocks.value.findIndex((itemStock) => itemStock.id === id)
  if (index >= 0) {
    itemStocks.value[index].name = name
    tab.value = name + id
  }
}
</script>
