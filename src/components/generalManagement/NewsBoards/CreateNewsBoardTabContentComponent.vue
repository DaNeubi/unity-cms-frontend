<template>
  <q-tab-panel :name="`${ name }`">
    <div class="column">
      <h5 class="q-mt-sm q-mb-md">Neues News Board erstellen</h5>
      <q-separator class="q-mb-md"/>
      <div>
        <CreateSomethingNewButton text="News Board speichern"
                                  icon="mdi-shape-square-plus"
                                  @click="createNewNewsBoard"/>
      </div>
      <q-separator class="q-mb-md q-mt-md"/>
      <q-input v-model="newsBoardName"
               label="Name des News Boards*"
               outlined/>
      <q-input v-model.number="newsBoardOrderNumber"
               label="Sortierungsnummer des Newsboards"
               type="number"
               :min="0"
               class="q-mt-md"
               outlined/>
      <q-separator class="q-mb-none q-mt-sm"/>
      <div class="col q-mt-sm" v-if="canEditPermissions">
        <div v-if="availableRanks === undefined || availableRanks.length < 1">
          <div class="text-h6">
            Leider keine Ränge verfügbar.
          </div>
        </div>
        <div v-else>
          <div class="row">
            <div class="col-5">
              <q-list bordered>
                <q-item v-for="rank in availableRanks"
                        :key="rank.id"
                        clickable
                        v-ripple
                        :disable="newsBoardRanks.some(nbr => nbr.rank_id === rank.id)"
                        @click="addRankToNewsBoard(rank)">
                  <q-item-section>
                    {{ rank.name }}
                  </q-item-section>
                  <q-item-section avatar>
                    <q-avatar icon="mdi-arrow-right-thick" color="accent"/>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
            <div class="col-2">
            </div>
            <div class="col-3">
              <div class="column">
                <q-chip icon="mdi-eye-outline"
                        :color="newsBoardRank?.needsToBeSaved ? 'warning' : 'accent'"
                        removable
                        size="md"
                        @remove="removeRankFromNewsBoard(newsBoardRank)"
                        v-for="newsBoardRank in newsBoardRanks"
                        :key="newsBoardRank.rank_id">
                  {{ availableRanks.find(rank => rank.id === newsBoardRank.rank_id)?.name }}
                  {{ newsBoardRank?.needsToBeSaved ? '*' : '' }}
                </q-chip>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="q-mt-sm">
        <div class="text-h6">
          Du hast keine Berechtigung, die Rechte für das News Board zu verändern.
        </div>
      </div>
      <q-separator class="q-mb-none q-mt-sm"/>
      <h6 class="q-mt-sm q-mb-md">Inhalt deines News Boards:</h6>
      <TipTapEditor @update-content="(content) => updateContent(content)"/>
    </div>
  </q-tab-panel>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import TipTapEditor from 'components/general/editor/TipTapEditor.vue'
import Rank from 'src/misc/classes/Rank/Rank'
import INewsboardRank from 'src/misc/interfaces/Newsboard/INewsboardRank'
import { api } from 'src/boot/axios'
import Base64Utf8Encoder from 'src/misc/functions/general/Base64Encoder'

export default defineComponent({
  name: 'CreateNewsBoardTabContentComponent',
  components: { TipTapEditor, CreateSomethingNewButton },
  props: {
    name: {
      type: String,
      required: true
    },
    ranks: {
      type: Array as PropType<Array<Rank>>,
      required: true
    },
    canEditPermissions: {
      type: Boolean,
      required: true
    },
    companyId: {
      type: Number,
      required: true
    }
  },
  emits: ['news-board-created'],
  setup (props, { emit }) {
    const newsBoardName = ref<string>()
    const newsBoardOrderNumber = ref<number>(0)
    const wysiwygContent = ref('Heute schon nen Riegel bekommen?🍫')
    const availableRanks = ref<Rank[]>(props.ranks)
    const newsBoardRanks = ref<INewsboardRank[]>([])
    function updateContent (content: string) {
      wysiwygContent.value = content
    }
    function createNewNewsBoard () {
      if (props.companyId <= 0) return
      if (newsBoardName.value === undefined || newsBoardName.value?.length < 1) return

      api.post('/api/newsBoards/create/' + props.companyId, {
        name: newsBoardName.value,
        news_board_content: Base64Utf8Encoder(wysiwygContent.value),
        order_number: newsBoardOrderNumber.value,
        rank_boards: newsBoardRanks.value
      })
        .then(() => {
          newsBoardName.value = undefined
          newsBoardOrderNumber.value = 0
          wysiwygContent.value = ''
          newsBoardRanks.value = []
          emit('news-board-created')
        })
        .catch((err) => {
          console.error(err)
        })
    }
    function addRankToNewsBoard (rank: Rank) {
      newsBoardRanks.value.push({
        company_id: props.companyId,
        company_newsboard_id: undefined,
        rank_id: rank.id,
        needsToBeSaved: true
      })
    }
    function removeRankFromNewsBoard (newsBoardRank: INewsboardRank) {
      const index = newsBoardRanks.value.findIndex(r => r.rank_id === newsBoardRank.rank_id)
      newsBoardRanks.value.splice(index, 1)
    }
    return {
      newsBoardName,
      wysiwygContent,
      newsBoardOrderNumber,
      updateContent,
      createNewNewsBoard,
      availableRanks,
      newsBoardRanks,
      addRankToNewsBoard,
      removeRankFromNewsBoard
    }
  }
})
</script>
