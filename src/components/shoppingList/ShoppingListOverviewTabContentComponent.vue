<template>
  <div class="column q-pa-md">
    <div v-if="loading">
      <q-skeleton type="rect"
                  class="q-mt-sm"
                  v-for="n in 5" :key="n"/>
    </div>
    <div v-else>
      <div class="text-h4 text-accent">
        Lagerübersicht
      </div>
      <div v-for="itemStockOverview in itemStockOverviews"
           :key="itemStockOverview.id">
        <div class="row items-center q-gutter-sm">
          <div class="text-h6">
            {{ itemStockOverview.name }} {{ itemStockOverview.is_default ? 'D' : '' }}
          </div>
          <div class="text-subtitle1">
            <span
              :class="`${ calculateColor(itemStockOverview.item_stock_total_available, itemStockOverview.item_stock_total_wanted) }`">
              {{ itemStockOverview.item_stock_total_available }}
            /
            {{ itemStockOverview.item_stock_total_wanted }}
            </span>
            aktuell auf Lager
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import { api } from 'src/boot/axios'
import { ICompanySetting } from 'src/misc/interfaces/CompanySetting/ICompanySetting'
import IItemStock from 'src/misc/interfaces/Item/IItemStock'
import { defineComponent, onMounted, ref } from 'vue'

export default defineComponent({
  name: 'ShoppingListOverviewTabContentComponent',
  props: {
    name: {
      type: String,
      required: true
    },
    canSeeOverview: {
      type: Boolean,
      required: true,
      default: false
    },
    companyId: {
      type: Number,
      required: true
    }
  },
  setup (props) {
    const itemStockOverviews = ref<IItemStock[]>()
    const threshold = ref<ICompanySetting>()
    const loading = ref<boolean>(false)
    onMounted(async () => {
      getOverview()
    })
    function getOverview () {
      if (props.companyId <= 0) { return }
      loading.value = true
      api.get('/api/shopping-list/summary/' + props.companyId)
        .then((res) => {
          itemStockOverviews.value = res.data.overView
          threshold.value = res.data.threshold
          loading.value = false
        })
        .catch((err) => {
          console.error(err)
        })
    }
    function calculateColor (current: number, wanted: number) : string {
      if (!threshold.value || !threshold.value.item_stock_threshold_low || !threshold.value.item_stock_threshold_high) {
        return 'text-pink-5'
      }
      // check if the high threshold is reached
      if (current < wanted - Math.round((wanted / 100) * threshold.value?.item_stock_threshold_high)) {
        return 'text-red'
      }
      // check if the low threshold is reached
      if (current < wanted - Math.round(Math.round((wanted / 100) * threshold.value?.item_stock_threshold_low))) {
        return 'text-orange'
      }
      return 'text-green'
    }
    return {
      itemStockOverviews,
      loading,
      threshold,
      calculateColor
    }
  }
})
</script>

<style scoped>

</style>
