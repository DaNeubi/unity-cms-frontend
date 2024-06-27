<template>
  <div v-if="loading">
    <q-tabs v-model="tabs"
            inline-label
            align="left">
      <q-tab name="index_news_boards-0"
             label="Lade">
        <q-spinner-dots color="primary"
                        class="q-ml-sm"
                        size="1.3em"/>
      </q-tab>
    </q-tabs>
    <q-tab-panels v-model="tabs">
      <q-tab-panel name="index_news_boards-0">
        <div>
          <q-skeleton/>
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </div>
  <div v-else>
    <q-tabs v-model="tabs"
            inline-label
            align="left">
      <IndexPageSingleNewsBoardTabHeaderComponent v-for="newsBoard in newsBoards" :key="newsBoard.id+'header'"
                                                  :name="`${ newsBoard.name + newsBoard.id}`"
                                                  :is-up-to-date="checkIfUserIsUpToDate(newsBoard.id, newsBoard.version)"
                                                  :label="`${ newsBoard.name }`" :id="newsBoard.id"/>
    </q-tabs>
    <q-tab-panels v-model="tabs">
      <IndexPageSingleNewsBoardComponent v-for="newsBoard in newsBoards" :key="newsBoard.id+'panel'" :id="newsBoard.id"
                                         @user-read-news-board="updateNewsBoardReads(newsBoard.id, newsBoard.version)"
                                         :name="`${ newsBoard.name + newsBoard.id}`" :content="newsBoard.content"/>
    </q-tab-panels>
  </div>
</template>

<script setup lang="ts">
import { api } from 'src/boot/axios'
import INewsboard from 'src/misc/interfaces/Newsboard/INewsboard'
import { companyStore } from 'stores/companyStore'
import { computed, onMounted, ref, watch } from 'vue'
import IndexPageSingleNewsBoardTabHeaderComponent
  from 'components/general/indexPage/newsBords/IndexPageSingleNewsBoardTabHeaderComponent.vue'
import IndexPageSingleNewsBoardComponent
  from 'components/general/indexPage/newsBords/IndexPageSingleNewsBoardComponent.vue'
import IUserNewsBoardRead from 'src/misc/interfaces/User/IUserNewsBoardRead'

const cStore = companyStore()
const companyId = computed(() => cStore.companyId)
const newsBoards = ref<INewsboard[]>([])
const loading = ref<boolean>(true)
const tabs = ref('index_news_boards-0')
const userNewsBoardReads = ref<IUserNewsBoardRead[]>([])
const doneLoadingReads = ref<boolean>(false)

onMounted(() => {
  if (companyId.value === 0) {
    return
  }
  getNewsBoards()
  getNewsBoardReads()
})
watch(companyId, () => {
  getNewsBoards()
  getNewsBoardReads()
})
function getNewsBoards () {
  if (companyId.value <= 0) return
  api.get('/api/newsBoards/reducedForMainPage/' + companyId.value)
    .then((response) => {
      newsBoards.value = response.data.newsBoards
      loading.value = false
      tabs.value = newsBoards.value.length > 0 ? newsBoards.value[0].name + newsBoards.value[0].id : 'index_news_boards-0'
    })
    .catch((error) => {
      loading.value = false
      console.error(error)
    })
}
function getNewsBoardReads () {
  if (companyId.value <= 0) return
  doneLoadingReads.value = false
  api.get('/api/newsBoards/getReads/' + companyId.value)
    .then((response) => {
      userNewsBoardReads.value = response.data
      doneLoadingReads.value = true
    })
    .catch((error) => {
      console.error(error)
    })
}
function checkIfUserIsUpToDate (newsBoardId: number, newsBoardVersion: number) : boolean {
  // check if the user has a userNewsBoardRead for this newsBoard with this version
  const userNewsBoardRead = userNewsBoardReads.value.find((userNewsBoardRead) => {
    return userNewsBoardRead.news_board_id === newsBoardId
  })
  if (userNewsBoardRead === undefined) {
    return false
  }
  return userNewsBoardRead.version >= newsBoardVersion
}
function updateNewsBoardReads (newsBoardId: number, newsBoardVersion: number) {
  if (companyId.value <= 0) return
  if (!doneLoadingReads.value) return
  // check if the user has a userNewsBoardRead for this newsBoard with this version
  const userNewsBoardRead = userNewsBoardReads.value.find((userNewsBoardRead) => {
    return userNewsBoardRead.news_board_id === newsBoardId
  })
  if (userNewsBoardRead !== undefined && userNewsBoardRead.version >= newsBoardVersion) {
    return
  }
  api.post('/api/newsBoards/read/' + companyId.value, {
    news_board_id: newsBoardId
  })
    .then(() => {
      getNewsBoardReads()
    })
    .catch((error) => {
      console.error(error)
    })
}
</script>

<style lang="scss">

</style>
