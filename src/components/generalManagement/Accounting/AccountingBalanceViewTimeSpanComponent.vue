<template>
  <q-card>
    <q-card-section v-if="canSeeBalanceView">
      <div class="column items-center">
        <h4 class="q-mt-none q-mb-sm">Billanz Ansicht Standard Zeitraum und Startzeitpunkt</h4>
      </div>
      <div>
        <span class="hint-text">
          Der angegebene Startzeitpunkt wird als Startzeitpunkt verwendet.
          Die Anzahl der Tage wird dann als Zeitspanne verwendet, um immer vom Startzeitpunkt aus die
          gewünschte Zeitspanne anzuzeigen.
        </span>
      </div>
      <CreateSomethingNewButton icon="mdi-content-save"
                                text="Zeitspanne/Startzeitpunkt aktualisieren"
                                class="q-mt-md q-mb-sm"
                                v-if="canEditBalanceViewDuration || canEditBalanceViewStart"
                                @create-something-new="updateCompanyBalanceViewSettings()"/>
      <div v-if="loading">
        <q-skeleton height="2rem"/>
        <q-skeleton height="2rem"
                    class="q-mt-sm"/>
      </div>
      <div v-else>
        <q-input outlined
                 v-model="startDate"
                 :rules="['date']"
                 class="q-mt-sm"
                 :disable="!canEditBalanceViewStart">
          <template v-slot:append>
            <q-icon name="mdi-calendar" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="startDate">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Übernehmen" color="positive" flat/>
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        <q-input type="number"
                 :disable="!canEditBalanceViewDuration"
                 outlined
                 :min="1"
                 :max="183"
                 label="Anzahl der Tage für die Zeitspanne"
                 v-model.number="duration"/>
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import { api } from 'src/boot/axios'
import { ICompanySetting } from 'src/misc/interfaces/CompanySetting/ICompanySetting'

export default defineComponent({
  name: 'AccountingBalanceViewTimeSpanComponent',
  components: { CreateSomethingNewButton },
  props: {
    companyId: {
      type: Number,
      required: true
    },
    updateNumber: {
      type: Number,
      required: true
    },
    canSeeBalanceView: {
      type: Boolean,
      required: true
    },
    canEditBalanceViewStart: {
      type: Boolean,
      required: true
    },
    canEditBalanceViewDuration: {
      type: Boolean,
      required: true
    }
  },
  setup (props) {
    const startDate = ref<string>()
    const duration = ref<number>()
    const companySetting = ref<ICompanySetting>()
    const loading = ref<boolean>(false)
    watch(() => props.updateNumber, () => {
      getCurrentBalanceViewSettings()
    })
    onMounted(async () => {
      getCurrentBalanceViewSettings()
    })
    function getCurrentBalanceViewSettings () {
      loading.value = true
      api.get('/api/companySettings/balance/reduced/' + props.companyId)
        .then((response) => {
          companySetting.value = response.data.companySettings[0]
          startDate.value = companySetting.value?.balance_view_start_date.replaceAll('-', '/')
          duration.value = (companySetting.value?.balance_view_time_span ?? 0) / 1440
          loading.value = false
        })
        .catch((error) => {
          console.error(error)
        })
    }
    function updateCompanyBalanceViewSettings () {
      api.patch('/api/companySettings/balance/update/' + props.companyId, {
        setting_id: companySetting.value?.id,
        balance_view_start_date: startDate.value?.replaceAll('/', '-'),
        balance_view_time_span: (duration.value ?? 0) * 1440
      })
        .catch((error) => {
          console.error(error)
        })
    }
    return {
      startDate,
      duration,
      loading,
      updateCompanyBalanceViewSettings
    }
  }
})
</script>

<style scoped>

</style>
