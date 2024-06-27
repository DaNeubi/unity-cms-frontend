<template>
  <div v-if="loading">
    <q-skeleton class="q-mt-md" height="4rem"/>
    <q-skeleton class="q-mt-md" height="4rem"/>
    <q-skeleton class="q-mt-md" height="4rem"/>
    <q-skeleton class="q-mt-md" height="4rem"/>
  </div>
  <div v-else>
    <q-tabs v-model="tabs" inline-label align="left">
      <CreateNewsBoardTabComponent name="new_news_board"
                                   label="Neues News Board erstellen"
                                   icon="mdi-plus-circle-outline"
                                   id="-1"
                                   v-if="canCreateNewsBoard"/>
      <NewsBoardTabComponent v-for="newsBoard in newsBoards"
                             :key="newsBoard.id"
                             :name="`${ newsBoard.name + newsBoard.id}`"
                             icon="mdi-developer-board"
                             :label="`${ newsBoard.name }`"/>
    </q-tabs>
    <q-tab-panels v-model="tabs">
      <CreateNewsBoardTabContentComponent name="new_news_board-1"
                                          :ranks="allRanks"
                                          :can-edit-permissions="canEditNewsBoardPermissions"
                                          :company-id="companyId"
                                          @news-board-created="reloadOnCreate()"
                                          v-if="canCreateNewsBoard"/>
      <NewsBoardTabContentComponent v-for="newsBoard in newsBoards"
                                    :key="newsBoard.id"
                                    :can-edit-permissions="canEditNewsBoardPermissions"
                                    :can-delete-news-board="canDeleteNewsBoard"
                                    :name="`${ newsBoard.name + newsBoard.id}`"
                                    :content="newsBoard.content"
                                    :news-board-order-number="newsBoard.order_number"
                                    :news-board-id="newsBoard.id"
                                    :news-board-name="newsBoard.name"
                                    :company-id="companyId"
                                    :created-at="newsBoard.created_at"
                                    :updated-at="newsBoard.updated_at"
                                    :ranks="allRanks"
                                    :version="newsBoard.version"
                                    :news-board-ranks="newsBoard.rank_boards"
                                    :can-edit-news-board="canEditNewsBoard"
                                    :user-reads="newsBoard.user_reads"
                                    @delete-news-board="removeNewsBoardOnDelete"/>
    </q-tab-panels>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import CreateNewsBoardTabComponent from 'components/generalManagement/NewsBoards/CreateNewsBoardTabComponent.vue'
import CreateNewsBoardTabContentComponent
  from 'components/generalManagement/NewsBoards/CreateNewsBoardTabContentComponent.vue'
import NewsBoardTabComponent from 'components/generalManagement/NewsBoards/NewsBoardTabComponent.vue'
import NewsBoardTabContentComponent from 'components/generalManagement/NewsBoards/NewsBoardTabContentComponent.vue'
import { api } from 'boot/axios'
import { companyStore } from 'stores/companyStore'
import INewsboard from 'src/misc/interfaces/Newsboard/INewsboard'
import Rank from 'src/misc/classes/Rank/Rank'
import laravelEcho from 'boot/laravelecho'
import { useUserStore } from 'stores/useUserStore'
import AssignPolicies from 'src/misc/functions/policies/Policies'

export default defineComponent({
  name: 'CompanyNewsBoard',
  components: { NewsBoardTabContentComponent, NewsBoardTabComponent, CreateNewsBoardTabContentComponent, CreateNewsBoardTabComponent },
  setup () {
    const tabs = ref('new_news_board-1')
    const cStore = companyStore()
    const companyId = computed(() => cStore.companyId)
    const canCreateNewsBoard = ref<boolean>(false)
    const canEditNewsBoard = ref<boolean>(false)
    const canDeleteNewsBoard = ref<boolean>(false)
    const canEditNewsBoardPermissions = ref<boolean>(false)
    const newsBoards = ref<INewsboard[]>([])
    const allRanks = ref<Rank[]>([])
    const loading = ref<boolean>(true)
    const userStore = useUserStore()
    const userId = computed(() => userStore.userId)
    watch(companyId, () => {
      getPermissions()
      getAllNewsBoards()
    })
    onMounted(() => {
      // get permissions
      getPermissions()
      joinReloadChannel()
      getAllNewsBoards()
    })
    watch(userId, () => {
      joinReloadChannel()
    })
    onUnmounted(() => {
      // stop listening to the change event
      laravelEcho.leave('user.reload.' + userId.value)
    })
    function joinReloadChannel () {
      if (userId.value <= 0) { return }
      // listen to the change event
      laravelEcho.private('user.reload.' + userId.value)
        .listen('.user.reload', () => {
          // just reload the companies
          loading.value = true
          getAllNewsBoards()
        })
    }
    function getPermissions () {
      if (companyId.value <= 0) { return }
      api.get('/api/policies/generalManagement/newsBoards/' + companyId.value)
        .then((response) => {
          AssignPolicies([
            { policyName: 'GeneralManagement_NewsBoard_Create', policyToAssign: canCreateNewsBoard },
            { policyName: 'GeneralManagement_NewsBoard_Update', policyToAssign: canEditNewsBoard },
            { policyName: 'GeneralManagement_NewsBoard_Delete', policyToAssign: canDeleteNewsBoard },
            { policyName: 'GeneralManagement_NewsBoard_Edit_Permissions', policyToAssign: canEditNewsBoardPermissions }
          ], response.data.newsBoardPolicies)
        })
        .catch((error) => {
          console.error(error)
        })
    }
    function getAllNewsBoards () {
      if (companyId.value <= 0) { return }
      api.get('/api/newsBoards/reduced/' + companyId.value)
        .then((res) => {
          newsBoards.value = res.data.newsBoards
          allRanks.value = res.data.ranks
          loading.value = false
        })
    }
    function removeNewsBoardOnDelete (id: number) {
      const index = newsBoards.value.findIndex((newsBoard) => newsBoard.id === id)
      newsBoards.value.splice(index, 1)
      tabs.value = 'new_news_board-1'
    }
    function reloadOnCreate () {
      loading.value = true
      getAllNewsBoards()
    }
    return {
      tabs,
      newsBoards,
      canCreateNewsBoard,
      canEditNewsBoard,
      canDeleteNewsBoard,
      canEditNewsBoardPermissions,
      allRanks,
      loading,
      companyId,
      removeNewsBoardOnDelete,
      reloadOnCreate
    }
  }
})
</script>

<style scoped>

</style>
