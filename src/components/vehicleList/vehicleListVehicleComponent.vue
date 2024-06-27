<template>
  <q-card flat bordered style="min-height: 210px;">
    <q-card-section>
      <div class="row justify-start">
        <div class="col-6">
          <div class="row items-center justify-start q-gutter-sm">
            <span class="text-h6">{{ vehicle?.name }}</span>
            <span>-</span>
            <span class="text-body2">{{ vehicle?.manufacturer?.name }}</span>
          </div>
          <div class="text-body1">
            Händlerpreis: <b>
            ${{ vehicle?.price?.toLocaleString() ?? '?' }}
            <q-tooltip v-if="vehicle?.price == null" class="text-body2">
              Fragen Sie noch heute beim Autohändler Ihres Vertrauens nach dem Verkaufspreis😋
            </q-tooltip>
          </b>
          </div>
          <div>
            Sitzplätze: {{ vehicle?.seat_amount }}
          </div>
          <div>
            Kofferraum: {{ vehicle?.trunk }}
          </div>
          <div>
            Handschuhfach: {{ vehicle?.glove_compartment }}
          </div>
          <div>
            Kraftstoff: {{ vehicle?.fuel_type?.name }}
          </div>
          <div v-if="vehicle?.soon_car">
            Soon Auto: {{ vehicle?.soon_car ? 'Ja' : '' }}
          </div>
        </div>
        <q-img v-if="vehicle?.image !== undefined && vehicle?.image !== null" :fit="'scale-down'" ratio="5/4"
               loading="lazy" class="col-6" style="max-height: 210px; min-height: 210px;" alt="Car Image"
               :src="backendServer + vehicle.image" @click="showImageDialog()"/>
        <q-img v-else :fit="'scale-down'" src="images/missingcarimage_small.webp" class="col-6" alt="Car Image"
               style="max-height: 210px; min-height: 210px;"/>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import IVehicle from 'src/misc/interfaces/Vehicle/IVehicle'
import { PropType } from 'vue'
import { useQuasar } from 'quasar'
import VehicleListImageDialog from 'components/vehicleList/Dialogs/vehicleListImageDialog.vue'

const $q = useQuasar()

const props = defineProps({
  vehicle: Object as PropType<IVehicle>,
  backendServer: String
})

function showImageDialog () {
  console.log('showImageDialog')
  let fullImageUrl = props.backendServer ?? ''
  fullImageUrl += props.vehicle?.image
  $q.dialog({
    component: VehicleListImageDialog,
    componentProps: {
      imageUrl: fullImageUrl,
      vehicleName: props.vehicle?.name,
      manufacturerName: props.vehicle?.manufacturer?.name
    }
  })
}
</script>

<style scoped>

</style>
