<template>
  <div class="column">
    <div class="col-12">
      <q-tabs v-model="tab" align="left" inline-label>
        <q-tab name="vehicles" label="Audos" icon="mdi-tank" v-if="anyVehiclePermissionAvailable"/>
        <q-tab name="manufacturers" label="Hersteller" icon="mdi-car" v-if="anyManufacturerPermissionAvailable"/>
        <q-tab name="categories" label="Kategorien" icon="mdi-car" v-if="anyCategoryPermissionAvailable"/>
        <q-tab name="fuelTypes" label="Kraftstoffe" icon="mdi-gas-station" v-if="anyFuelTypePermissionAvailable"/>
      </q-tabs>
      <q-tab-panels v-model="tab">
        <q-tab-panel name="vehicles" v-if="anyVehiclePermissionAvailable">
          <AdminVehicleListComponent :can-create-new-vehicle="canCreateNewVehicle" :can-delete-vehicle="canDeleteVehicle"
                                     :can-edit-vehicle="canEditVehicle"/>

        </q-tab-panel>
        <q-tab-panel name="manufacturers" v-if="anyManufacturerPermissionAvailable">
          <AdminVehicleManufacturerComponent :can-create-manufacturer="canCreateManufacturer"
                                             :can-delete-manufacturer="canDeleteManufacturer"
                                             :can-edit-manufacturer="canEditManufacturer"/>
        </q-tab-panel>
        <q-tab-panel name="categories" v-if="anyCategoryPermissionAvailable">
          <AdminVehicleCategoryComponent :can-edit-category="canEditCategory" :can-delete-category="canDeleteCategory"
                                         :can-create-category="canEditCategory"/>
        </q-tab-panel>
        <q-tab-panel name="fuelTypes" v-if="anyFuelTypePermissionAvailable">
          <AdminVehicleFuelComponent :can-edit-fuel-type="canEditFuelType" :can-delete-fuel-type="canDeleteFuelType"
                                      :can-create-fuel-type="canCreateFuelType"/>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { api } from 'src/boot/axios'
import AssignPolicies from 'src/misc/functions/policies/Policies'
import AdminVehicleListComponent from 'components/administration/vehicle/AdminVehicleListComponent.vue'
import AdminVehicleManufacturerComponent from 'components/administration/vehicle/AdminVehicleManufacturerComponent.vue'
import AdminVehicleCategoryComponent from 'components/administration/vehicle/AdminVehicleCategoryComponent.vue'
import AdminVehicleFuelComponent from 'components/administration/vehicle/AdminVehicleFuelComponent.vue'

const canCreateNewVehicle = ref<boolean>(false)
const canDeleteVehicle = ref<boolean>(false)
const canEditVehicle = ref<boolean>(false)
const canCreateManufacturer = ref<boolean>(false)
const canDeleteManufacturer = ref<boolean>(false)
const canEditManufacturer = ref<boolean>(false)
const canCreateCategory = ref<boolean>(false)
const canDeleteCategory = ref<boolean>(false)
const canEditCategory = ref<boolean>(false)
const canCreateFuelType = ref<boolean>(false)
const canDeleteFuelType = ref<boolean>(false)
const canEditFuelType = ref<boolean>(false)
const anyVehiclePermissionAvailable = computed(() => canCreateNewVehicle.value || canDeleteVehicle.value || canEditVehicle.value)
const anyManufacturerPermissionAvailable = computed(() => canCreateManufacturer.value || canDeleteManufacturer.value || canEditManufacturer.value)
const anyCategoryPermissionAvailable = computed(() => canCreateCategory.value || canDeleteCategory.value || canEditCategory.value)
const anyFuelTypePermissionAvailable = computed(() => canCreateFuelType.value || canDeleteFuelType.value || canEditFuelType.value)
const tab = ref<string>('vehicles')

onMounted(async () => {
  // get permissions
  getPermissions()
})
function getPermissions () {
  api.get('/api/administrationPolicies/vehicle')
    .then((res) => {
      AssignPolicies([
        { policyName: 'Administration_Vehicle_Edit', policyToAssign: canEditVehicle },
        { policyName: 'Administration_Vehicle_Create', policyToAssign: canCreateNewVehicle },
        { policyName: 'Administration_Vehicle_Delete', policyToAssign: canDeleteVehicle },
        { policyName: 'Administration_Vehicle_Manufacturer_Create', policyToAssign: canCreateManufacturer },
        { policyName: 'Administration_Vehicle_Manufacturer_Delete', policyToAssign: canDeleteManufacturer },
        { policyName: 'Administration_Vehicle_Manufacturer_Edit', policyToAssign: canEditManufacturer },
        { policyName: 'Administration_Vehicle_Category_Create', policyToAssign: canCreateCategory },
        { policyName: 'Administration_Vehicle_Category_Delete', policyToAssign: canDeleteCategory },
        { policyName: 'Administration_Vehicle_Category_Edit', policyToAssign: canEditCategory },
        { policyName: 'Administration_Vehicle_FuelType_Create', policyToAssign: canCreateFuelType },
        { policyName: 'Administration_Vehicle_FuelType_Delete', policyToAssign: canDeleteFuelType },
        { policyName: 'Administration_Vehicle_FuelType_Edit', policyToAssign: canEditFuelType }
      ], res.data.vehiclePolicies)
    })
    .catch((e) => {
      console.error(e)
    })
}
</script>

<style scoped>

</style>
