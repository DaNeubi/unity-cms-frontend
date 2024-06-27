<template>
  <transition-group appear
                    enter-active-class="animated zoomIn"
                    leave-active-class="animated zoomOut">
    <div class="col-12 q-pb-md" v-if="show && tempChartOptions !== undefined">
      <q-card>
        <q-card-section>
          <div class="row items-center q-gutter-sm">
            <div class="col-12 text-body1">
              Hier kannst du den Graphen anpassen
            </div>
            <q-toggle v-model="tempChartOptions.dataLabels.enabled" :label="markerLabel" color="accent"
                      @update:model-value="updateChart('updateDataLabel')"
                      :true-value="true" :false-value="false" class="col-auto"/>
            <q-separator vertical v-if="showStrokeOptions"/>
            <q-option-group v-model="tempChartOptions.stroke.curve" inline v-if="showStrokeOptions"
                            @update:model-value="updateChart('updateChartStroke')"
                            :options="strokeOptions" class="col-auto">
              <template v-slot:label-0="props">
                {{ props.label }}
                <q-tooltip>
                  Bei einem größeren Zeitraum ist Smooth nicht mehr aktiv und es wird automatisch Straight angezeigt.
                </q-tooltip>
              </template>
            </q-option-group>
            <q-separator vertical/>
            <q-option-group v-model="tempChartOptions.theme.palette" inline
                            @update:model-value="updateChart('updateChartPalette')"
                            :options="paletteOptions" class="col-auto"/>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </transition-group>
</template>

<script setup lang="ts">

import { PropType, defineEmits } from 'vue'
import { ApexOptions } from 'apexcharts'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
    default: false
  },
  chartOptions: {
    type: Object as unknown as PropType<ApexOptions | undefined>,
    required: true,
    default: undefined
  },
  showStrokeOptions: {
    type: Boolean,
    required: false,
    default: true
  },
  markerLabel: {
    type: String,
    required: false,
    default: 'Moneten Marker anzeigen'
  }
})
const tempChartOptions = props.chartOptions as ApexOptions
const strokeOptions = [{ label: 'Smooth', value: 'smooth' },
  { label: 'Straight', value: 'straight' },
  { label: 'Stepped', value: 'stepline' }]
const paletteOptions = [{ label: 'Palette 1', value: 'palette1' }, { label: 'Palette 2', value: 'palette2' },
  { label: 'Palette 3', value: 'palette3' }, { label: 'Palette 4', value: 'palette4' },
  { label: 'Palette 5', value: 'palette5' }, { label: 'Palette 6', value: 'palette6' },
  { label: 'Palette 7', value: 'palette7' }, { label: 'Palette 8', value: 'palette8' },
  { label: 'Palette 9', value: 'palette9' }, { label: 'Palette 10', value: 'palette10' }]

const emit = defineEmits(['updateChartStroke', 'updateChartPalette', 'updateDataLabel'])

function updateChart (eventName: 'updateChartStroke' | 'updateChartPalette' | 'updateDataLabel') {
  emit(eventName, tempChartOptions)
}

</script>

<style scoped>

</style>
