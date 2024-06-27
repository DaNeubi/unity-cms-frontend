<template>
  <q-tab-panel :name="`${ $props.newsBoardName + $props.newsBoardId }`">
    <div class="column">
      <h5 class="q-mt-sm q-mb-md">News Board bearbeiten</h5>
      <q-separator class="q-mb-md"/>
      <div class="row items-center">
        <CreateSomethingNewButton text="Aktualisieren"
                                  icon="mdi-content-save"
                                  @create-something-new="updateNewsBoard"/>
        <q-btn label="News Board löschen"
               color="negative"
               outline
               @click="deleteNewsBoard"
               class="q-ml-md"/>
        <q-separator vertical class="q-ml-md"/>
        <span class="q-ml-md">
          Erstellt am: <i>{{ FormatDateTime($props.createdAt) }}</i>
        </span>
        <q-separator vertical class="q-ml-md"/>
        <span class="q-ml-md">
          Zuletzt aktualisiert am: <i>{{ FormatDateTime($props.updatedAt) }}</i>
        </span>
        <q-separator vertical class="q-ml-md"/>
        <span class="q-ml-md">
          Version: <i>{{ $props.version }}</i>
        </span>
      </div>
      <q-separator class="q-mb-md q-mt-md"/>
      <q-expansion-item label="Mitarbeiter Ansichten" expand-separator icon="mdi-incognito">
        <q-card v-if="userReads">
          <q-card-section v-if="userReads?.length > 0">
            <div class="column">
              <div class="col-12 row items-center justify-start q-gutter-sm" v-for="userRead in userReads" :key="userRead.id">
                <div class="text-body1">
                  ⚪ {{ userRead?.user?.first_name }} {{ userRead?.user?.last_name }}
                </div>
                <q-separator vertical/>
                <div :class="`text-body1 ${ userRead?.version === version ? ' text-positive' : ' text-warning'}`">
                  gesehen in Version: {{ userRead?.version }}
                </div>
                <q-separator vertical/>
                <div>
                  Gesehen am: {{ FormatDateTime(userRead.updated_at) }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>
      <q-separator class="q-mb-md q-mt-md" v-if="$props.canEditPermissions"/>
      <div class="column" v-if="$props.canEditPermissions">
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
                        :disable="currentNewsBoardRanks.some(nbr => nbr.rank_id === rank.id)"
                        @click="addRankToNewsBoard(rank)"
                        v-ripple>
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
                <q-chip v-for="newsBoardRank in currentNewsBoardRanks"
                        :key="newsBoardRank.rank_id"
                        icon="mdi-eye-outline"
                        removable
                        size="md"
                        @remove="removeRankFromNewsBoard(newsBoardRank as INewsboardRank)"
                        :color="newsBoardRank?.needsToBeSaved ? 'warning' : 'accent'">
                  {{ $props.ranks.find(rank => rank.id === newsBoardRank.rank_id)?.name }}
                  {{ newsBoardRank?.needsToBeSaved ? '*' : '' }}
                </q-chip>
              </div>
            </div>
          </div>
        </div>
      </div>
      <q-separator class="q-mb-md q-mt-md"/>
      <div class="column">
        <q-input v-model="currentNewsBoardName"
                 label="Name"
                 outlined/>
        <q-input v-model.number="currentNewsBoardOrderNumber"
                 label="Sortierungsnummer"
                 type="number"
                 :min="0"
                 class="q-mt-md"
                 outlined/>
      </div>
      <q-separator class="q-mb-md q-mt-md"/>
      <TipTapEditor @update-content="(boardContent) => updateContent(boardContent)"
                    :initial-content="wysiwygContent"/>
    </div>
  </q-tab-panel>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import TipTapEditor from 'components/general/editor/TipTapEditor.vue'
import { api } from 'src/boot/axios'
import FormatDateTime from '../../../misc/functions/FormatDateTime'
import Rank from 'src/misc/classes/Rank/Rank'
import INewsboardRank from 'src/misc/interfaces/Newsboard/INewsboardRank'
import IUserNewsBoardRead from 'src/misc/interfaces/User/IUserNewsBoardRead'
import Base64Utf8Encoder from 'src/misc/functions/general/Base64Encoder'

export default defineComponent({
  name: 'NewsBoardTabContentComponent',
  methods: { FormatDateTime },
  components: { TipTapEditor, CreateSomethingNewButton },
  props: {
    canEditPermissions: {
      type: Boolean,
      required: true
    },
    canDeleteNewsBoard: {
      type: Boolean,
      required: true
    },
    canEditNewsBoard: {
      type: Boolean,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    newsBoardId: {
      type: Number,
      required: true
    },
    newsBoardOrderNumber: {
      type: Number,
      required: true
    },
    newsBoardName: {
      type: String,
      required: true
    },
    companyId: {
      type: Number,
      required: true
    },
    createdAt: {
      type: String,
      required: true
    },
    updatedAt: {
      type: String,
      required: true
    },
    ranks: {
      type: Array as PropType<Array<Rank>>,
      required: true
    },
    newsBoardRanks: {
      type: Array as PropType<Array<INewsboardRank>>,
      required: true,
      default: () => []
    },
    version: {
      type: Number,
      required: true
    },
    userReads: {
      type: Array as PropType<Array<IUserNewsBoardRead> | null>,
      required: true,
      default: () => []
    }
  },
  emits: [
    'delete-news-board'
  ],
  setup (props, { emit }) {
    const wysiwygContent = ref<string>(props.content)
    const currentNewsBoardName = ref<string>(props.newsBoardName)
    const currentNewsBoardOrderNumber = ref<number>(props.newsBoardOrderNumber)
    const currentNewsBoardRanks = ref<INewsboardRank[]>(props.newsBoardRanks)
    const availableRanks = ref<Rank[]>(props.ranks)
    function updateContent (content: string) {
      wysiwygContent.value = content
    }
    function updateNewsBoard () {
      if (currentNewsBoardName.value === undefined || currentNewsBoardName.value === '' || currentNewsBoardOrderNumber.value === undefined || currentNewsBoardOrderNumber.value === null || currentNewsBoardOrderNumber.value === undefined) {
        return
      }
      // base64 encode the content
      api.patch('/api/newsBoards/edit/' + props.companyId, {
        id: props.newsBoardId,
        name: currentNewsBoardName.value,
        order_number: currentNewsBoardOrderNumber.value,
        news_board_content: Base64Utf8Encoder(wysiwygContent.value),
        rank_boards: currentNewsBoardRanks.value
      }, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Access-Control-Allow-Origin': process.env.ACAO
        }
      })
        .catch((error) => {
          console.error(error)
        })
    }
    function addRankToNewsBoard (rank: Rank) {
      currentNewsBoardRanks.value === undefined ? currentNewsBoardRanks.value = [] : currentNewsBoardRanks.value.push({
        id: 0,
        company_newsboard_id: props.newsBoardId,
        rank_id: rank.id,
        needsToBeSaved: true,
        company_id: props.companyId
      })
    }
    function removeRankFromNewsBoard (newsBoardRank: INewsboardRank) {
      currentNewsBoardRanks.value = currentNewsBoardRanks.value.filter(nbr => nbr.rank_id !== newsBoardRank.rank_id)
    }
    function deleteNewsBoard () {
      api.post('/api/newsBoards/delete/' + props.companyId, {
        id: props.newsBoardId
      })
        .then(() => {
          emit('delete-news-board', props.newsBoardId)
        })
        .catch((error) => {
          console.error(error)
        })
    }
    return {
      updateContent,
      wysiwygContent,
      updateNewsBoard,
      currentNewsBoardName,
      currentNewsBoardOrderNumber,
      currentNewsBoardRanks,
      addRankToNewsBoard,
      availableRanks,
      removeRankFromNewsBoard,
      deleteNewsBoard
    }
  }
})
</script>

<style scoped>

</style>
