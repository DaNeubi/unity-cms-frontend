<template>
  <q-card>
    <q-card-section>
      <div class="column">
        <div class="row q-gutter-md items-center" v-if="canAdd">
          <q-btn label="Geld einzahlen" icon="mdi-plus-circle-outline"
                 color="accent"
                 @click="updateBalance(true)"
                 class="col"/>
          <q-input type="number"
                   outlined
                   :min="0"
                   label="Summe, die hinzugefügt werden soll"
                   class="col-10"
                   v-model.number="toAdd"/>
        </div>
        <q-separator/>
        <div class="row q-gutter-md items-center" v-if="canRemove">
          <q-btn label="Geld abheben" icon="mdi-minus-circle-outline"
                 color="accent"
                 :min="0"
                 @click="updateBalance(false)"
                 class="col"/>
          <q-input type="number"
                   outlined
                   label="Summe, die abgezogen werden soll"
                   class="col-10"
                   v-model.number="toRemove"/>
        </div>
        <q-separator/>
        <q-input type="textarea"
                 label="Notiz*"
                 outlined class="q-mt-md"
                 counter
                 :maxlength="512"
                 hint="Eine kurze Notiz, um es dir und dem CCD später leichter zu machen das Ganze nachzuverfolgen."
                 v-model="note"/>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { api } from 'src/boot/axios'
import { ref, watch } from 'vue'

const props = defineProps({
  companyId: {
    type: Number,
    required: true
  },
  canAdd: {
    type: Boolean,
    required: true,
    default: false
  },
  canRemove: {
    type: Boolean,
    required: true,
    default: false
  },
  updateInt: {
    type: Number,
    required: true,
    default: 0
  }
})
const toAdd = ref<number>()
const toRemove = ref<number>()
const note = ref<string>()
watch(() => props.updateInt, () => {
  toAdd.value = undefined
  toRemove.value = undefined
  note.value = undefined
})
function updateBalance (type: boolean) {
  if (props.companyId <= 0) return
  if (note.value === undefined || note.value.length <= 0) return
  if (toAdd.value !== undefined && toAdd.value > 0) {
    updatePost(type)
  } else if (toRemove.value !== undefined && toRemove.value > 0) {
    updatePost(type)
  }
}
function updatePost (type: boolean) {
  api.patch('/api/companyBalance/update/' + props.companyId, {
    amount: type ? toAdd.value : toRemove.value,
    note: note.value,
    deposit: type
  })
    .catch((error) => {
      console.error(error)
    })
}
</script>

<style scoped>

</style>
