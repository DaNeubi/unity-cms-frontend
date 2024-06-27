<template>
  <q-card>
    <q-card-section>
      <div class="column q-mb-sm" v-if="!editMode">
        <div class="row q-gutter-xl items-center justify-between">
          <div class="row items-center">
            <a :href="`${ url }`" target="_blank">
              <q-icon name="mdi-newspaper-variant" size="md" color="accent" class="col-1"/>
              <span class="col-5">&nbsp;{{ name }}</span>
            </a>
          </div>
        </div>
        <span class="col">Zuletzt aktualisiert am {{ FormatDateTime(updatedAt) }}</span>
        <div v-if="companyPanel?.rank_panels?.length > 0" class="text-h6 text-warning">
          Da mindestens 1 Rang ausgewählt ist, können nun nur noch Mitarbeiter/innen die den/die ausgewählte/n Rang haben das Panel sehen.
        </div>
      </div>
      <div v-else>
        <div class="row q-gutter-md justify-between">
          <div class="column col-5">
            <q-input v-model="newName"
                     dense
                     outlined
                     type="text"
                     label="Name"
                     class="q-mb-sm"/>
            <q-input v-model="newUrl"
                     type="text"
                     dense
                     outlined
                     label="URL"
                     class="q-mb-sm"/>
          </div>
          <div class="row items-center q-gutter-sm">
            <div class="col">
              <q-list bordered v-if="ranks.length > 0">
                <q-item v-for="rank in companyRanks"
                        :key="rank.id"
                        clickable
                        v-ripple
                        :disable="cPanelRanks.some(cPanelRank => cPanelRank.rank_id === rank.id)"
                        @click="addRankToView(rank)">
                  <q-item-section>
                    {{ rank.name }}
                  </q-item-section>
                  <q-item-section avatar>
                    <q-avatar icon="mdi-arrow-right-thick" color="accent"/>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
            <div class="column">
              <q-chip icon="mdi-eye-outline"
                      :color="companyPanelRank?.needsToBeSaved ? 'warning' : 'accent'"
                      removable
                      size="md"
                      @remove="() => removeRankToView(companyPanelRank)"
                      v-for="companyPanelRank in companyPanel?.rank_panels"
                      :key="companyPanelRank.rank_id">
                {{ companyRanks.find(rank => rank.id === companyPanelRank.rank_id)?.name }}
                {{ companyPanelRank?.needsToBeSaved ? '*' : '' }}
              </q-chip>
            </div>
          </div>
          <div v-if="companyPanel?.rank_panels?.some(rp => rp.needsToBeSaved)" class="text-subtitle2 text-warning">
            Ränge mit einem * /in gelb, müssen noch gespeichert werden.
          </div>
        </div>
      </div>
      <div class="row q-gutter-md" v-if="!editMode">
        <q-btn label="Bearbeiten"
               color="positive"
               outline
               class="col-2"
               icon="mdi-pencil"
               @click="switchEditMode()"/>
        <q-btn label="Löschen"
               color="negative"
               outline
               class="col-2"
               icon="mdi-delete"
               @click="deleteCompanyPanel()"/>
      </div>
      <div class="row q-gutter-md" v-else>
        <q-btn label="Speichern"
               color="positive"
               outline
               class="col-2"
               icon="mdi-content-save"
               @click="editCompanyPanel()"/>
        <q-btn label="Abbrechen"
               color="negative"
               outline
               class="col-1"
               icon="mdi-close"
               @click="switchEditMode()"/>
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'
import { ICompanyPanel } from 'src/misc/interfaces/CompanyPanel/ICompanyPanel'
import { ICompanyPanelRank } from 'src/misc/interfaces/CompanyPanel/ICompanyPanelRank'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import FormatDateTime from '../../../misc/functions/FormatDateTime'
import Rank from 'src/misc/classes/Rank/Rank'

export default defineComponent({
  name: 'CompanyPanelComponent',
  methods: { FormatDateTime },
  props: {
    companyPanel: {
      type: Object as () => ICompanyPanel,
      required: true
    },
    canEdit: {
      type: Boolean,
      required: true
    },
    canDelete: {
      type: Boolean,
      required: true
    },
    companyId: {
      type: Number,
      required: true
    },
    ranks: {
      type: Array as PropType<Array<Rank>>,
      required: true
    }
  },
  components: {},
  setup (props) {
    const $q = useQuasar()
    const editMode = ref<boolean>(false)
    const newName = ref<string>()
    const newUrl = ref<string>()
    const selectedRanks = ref<Rank[]>([])
    const name = ref<string>(props.companyPanel.name)
    const url = ref<string>(props.companyPanel.url)
    const updatedAt = ref<string>(props.companyPanel.updated_at)
    const cPanelRanks = ref<ICompanyPanelRank[]>(props.companyPanel.rank_panels)
    function editCompanyPanel () {
      api.patch('/api/companyPanels/update/' + props.companyId, {
        id: props.companyPanel.id,
        name: newName.value,
        url: newUrl.value,
        rank_panels: cPanelRanks.value
      })
        .catch((error) => {
          console.error(error)
        })
      editMode.value = false
    }
    function deleteCompanyPanel () {
      $q.dialog({
        title: 'FirmenPanel löschen',
        message: 'Willst du wirklich das FirmenPanel löschen?',
        persistent: true,
        cancel: true
      })
        .onOk(() => {
          deletePanel()
        })
    }
    function deletePanel () {
      api.post('/api/companyPanels/delete/' + props.companyId, {
        id: props.companyPanel.id
      })
        .catch((error) => {
          console.error(error)
        })
    }
    function switchEditMode () {
      editMode.value = !editMode.value
      newUrl.value = props.companyPanel.url
      newName.value = props.companyPanel.name
    }
    function addRankToView (rank: Rank) {
      cPanelRanks.value.push({
        company_id: props.companyId,
        company_panel_id: props.companyPanel.id,
        rank_id: rank.id,
        needsToBeSaved: true
      })
    }
    function removeRankToView (companyPanelRank: ICompanyPanelRank) {
      const index = cPanelRanks.value.findIndex(r => r.rank_id === companyPanelRank.rank_id)
      cPanelRanks.value.splice(index, 1)
    }
    return {
      name,
      url,
      updatedAt,
      companyRanks: props.ranks,
      cPanelRanks,
      editCompanyPanel,
      deleteCompanyPanel,
      switchEditMode,
      editMode,
      newName,
      newUrl,
      selectedRanks,
      addRankToView,
      removeRankToView
    }
  }
})
</script>

<style scoped>
a, a:hover, a:visited {
  text-decoration: none;
  color: white;
}

</style>
