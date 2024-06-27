<template>
  <q-card>
    <q-card-section v-if="loading || companyColorSetting === undefined">
      <q-skeleton/>
    </q-card-section>
    <q-card-section v-else>
      <div class="row justify-between">
        <div class="col-12 text-h4">
          Firmen Farben anpassen
        </div>
        <div class="col-12 q-mb-md">
          <create-something-new-button text="Farben speichern" icon="mdi-content-save"
                                       @create-something-new="updateColors()"/>
        </div>
        <q-color v-model="companyColorSetting!.primary_color" bordered format-model="hexa"
                 class="col-sm-2 self-start" style="max-width: 30vw;"
                 no-header-tabs no-footer/>
        <q-table class="preview-sticky-header-table col-8 self-start default-table-height" virtual-scroll
                 :rows-per-page-options="[0]" :columns="columns" :rows="rowsToUse"
                 :pagination="{ rowsPerPage: 0 }">
        </q-table>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { api } from 'boot/axios'
import { ICompanySetting } from 'src/misc/interfaces/CompanySetting/ICompanySetting'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'

const companyColorSetting = ref<ICompanySetting>()
const loading = ref<boolean>(false)
const color = computed(() => {
  return companyColorSetting.value?.primary_color ?? ''
})
const columns = [
  { name: 'eine', field: 'eine', label: 'Eine' },
  { name: 'sinnlose', field: 'sinnlose', label: 'Sinnlose' },
  { name: 'tabelle', field: 'tabelle', label: 'Tabelle' },
  { name: 'und', field: 'und', label: 'und' },
  { name: 'so', field: 'so', label: 'so' }
]
const rows = [
  { eine: 'Du', sinnlose: 'macht', tabelle: 'echt', und: 'lieber', so: 'farben' },
  { eine: 'als', sinnlose: 'dich', tabelle: 'um', und: 'dein', so: 'gewerbe' },
  { eine: 'zu', sinnlose: 'kümmern', tabelle: 'das', und: 'schon', so: 'wild' }
]
const rowsToUse = computed(() => {
  const tempRows = []
  for (let i = 0; i < 15; i++) {
    tempRows.push(...rows)
  }
  return tempRows
})

const props = defineProps({
  companyId: {
    type: Number,
    required: true
  }
})

onMounted(() => {
  getCompanyColors()
})

watch(() => props.companyId, () => {
  getCompanyColors()
})

function getCompanyColors () {
  if (props.companyId <= 0) return
  loading.value = true
  api.get('/api/companySettings/colors/' + props.companyId)
    .then((res) => {
      companyColorSetting.value = res.data
      loading.value = false
    })
    .catch((err) => {
      console.error(err)
    })
}

function updateColors () {
  if (props.companyId <= 0) return
  api.patch('/api/companySettings/colors/update/' + props.companyId, {
    primary_color: companyColorSetting.value?.primary_color
  })
    .then(() => {
      getCompanyColors()
    })
    .catch((err) => {
      console.error(err)
    })
}

</script>

<style>
/**
  * Sticky Table Header
  */
.preview-sticky-header-table {
  /* height or max-height is important */
  height: 45px;
  /* this is when the loading indicator appears */
  /* prevent scrolling behind sticky top row on focus */ }
.preview-sticky-header-table .q-table__top,
.preview-sticky-header-table .q-table__bottom,
.preview-sticky-header-table thead tr:first-child th {
  /* bg color is important for th; just specify one */
  background-color: v-bind('color'); }
.preview-sticky-header-table thead tr th {
  position: sticky;
  z-index: 1; }
.preview-sticky-header-table thead tr:first-child th {
  top: 0; }
.preview-sticky-header-table.q-table--loading thead tr:last-child th {
  /* height of all previous header rows */
  top: 48px; }
.preview-sticky-header-table tbody {
  /* height of all previous header rows */
  scroll-margin-top: 48px; }
</style>
