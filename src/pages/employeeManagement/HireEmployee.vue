<template>
  <div class="col justify-center items-center">
    <div class="row justify-center items-start">
      <q-card>
        <q-card-section>
          <h4 class="q-mb-sm">Mitarbeiter/in einstellen</h4>
          <span class="hint-text">
          Hier kannst du Personen deinem Gewerbe als neue Mitarbeiter/innen hinzufügen.
          </span>
          <span class="hint-text"><br/>
            Bitte beachte, dass du nur so viele Personen einstellen kannst, wie Slots verfügbar sind (max 20). Die Anzahl sieht man in der Mitarbeiterübersicht.
          </span>
          <span class="hint-text"><br/>
            Hinweis: Falls die gesuchte Person nicht auffindbar ist, kann es sein, dass sich diese noch nie an diesem System angemeldet hat.
          </span>
        </q-card-section>
        <q-card-section>
          <q-input
            outlined
            v-model="uMail"
            label="U-Mail"
            type="email"
            :rules="[val => !!val || 'Da muss schon was hin', val => /.+@.+\..+/.test(val) || 'Das sieht nicht richtig aus']"
            hint="Format: xyz@umail.com"/>
          <q-btn
            class="q-mt-md"
            color="accent"
            label="Person suchen"
            icon="mdi-magnify" @click="searchUser(uMail)"/>
        </q-card-section>
      </q-card>
    </div>
    <div class="row justify-center items-center q-mt-md">
      <q-skeleton v-if="(requestedUser === null || requestedUser === undefined) && loadingSearchResult" type="rect" animation="wave" height="10rem" width="30rem"/>
      <div v-else-if="requestedUser === null && !loadingSearchResult">
        <q-chip size="2em" color="orange">
          <q-avatar color="secondary" icon="mdi-account-question-outline"/>
          Keine Person mit dieser UMail gefunden
        </q-chip>
      </div>
      <q-card v-else-if="requestedUser !== undefined && requestedUser !== null" class="col-4">
        <q-card-section>
          <div class="row justify-center items-baseline">
            <q-chip size="2em" square color="grey">
              <q-avatar color="primary">
                {{ requestedUser.first_name.substring(0,1) + requestedUser.last_name.substring(0,1) }}
              </q-avatar>
              {{ requestedUser.first_name + ' ' +  requestedUser.last_name }}
            </q-chip>
          </div>
          <div class="row justify-center items-baseline q-mt-md">
            <q-skeleton v-if="companyRanks === undefined"
                        type="QInput"
                        animation="wave"
                        width="90%"/>
            <div v-else>
              <div class="hint-text">
                Hier kannst du auswählen, welchen Rang die Person beim Einstellen erhält.
              </div>
              <q-select v-model="rankToAssign"
                        :options="companyRanks"
                        :option-value="option => option.id"
                        :option-label="(option: Rank) => option.name + ' | ' + option.weight"
                        outlined/>
              <q-btn label="Einstellen"
                     class="q-mt-sm"
                     color="accent" @click="addUserToCompany"/>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
    <q-inner-loading :showing="assigningUserToCompany" class="relative-position">
      <q-spinner-hourglass color="orange" size="8rem"/>
    </q-inner-loading>
  </div>

</template>

<script lang="ts">
import { api } from 'src/boot/axios'
import { computed, defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import { companyStore } from 'stores/companyStore'
import User from 'src/misc/classes/User/User'
import Rank from 'src/misc/classes/Rank/Rank'
import laravelEcho from 'boot/laravelecho'
import { useUserStore } from 'stores/useUserStore'

export default defineComponent({
  name: 'HireEmployee',
  computed: {
    Rank () {
      return Rank
    }
  },
  components: {},
  setup () {
    const uMail = ref<string | undefined>('')
    const cStore = companyStore()
    const companyId = computed(() => cStore.companyId)
    const requestedUser = ref<User | undefined | null>()
    const companyRanks = ref<Rank[] | undefined>()
    const rankToAssign = ref<Rank | undefined>()
    const assigningUserToCompany = ref<boolean>(false)
    const loadingSearchResult = ref<boolean>(false)
    const userStore = useUserStore()
    const userId = computed(() => userStore.userId)
    watch(userId, () => {
      joinReloadChannel()
    })
    onMounted(async () => {
      joinReloadChannel()
    })
    onUnmounted(() => {
      // stop listening to the change event
      laravelEcho.leave('user.reload.' + userId.value)
    })
    function joinReloadChannel () {
      if (userId.value <= 0) { return }
      laravelEcho.private('user.reload.' + userId.value)
        .listen('.user.reload', () => {
          requestedUser.value = undefined
          companyRanks.value = undefined
          rankToAssign.value = undefined
          uMail.value = undefined
          assigningUserToCompany.value = false
        })
    }
    function searchUser (uMail: string | undefined) {
      // do nothing if no mail is given
      if (!uMail) return
      if (!/.+@.+\..+/.test(uMail)) return
      // do nothing if mail is same as loaded user
      if (requestedUser.value?.email === uMail) return
      loadingSearchResult.value = true
      api.get('/api/companyUsers/findRequestedUserForHire/' + companyId.value + '?uMail=' + uMail)
        .then((response) => {
          requestedUser.value = response.data.user
          loadingSearchResult.value = false
        })
        .catch((error) => {
          console.error(error)
        })
      api.get('/api/ranks/reduced/' + companyId.value)
        .then((res) => {
          companyRanks.value = res.data.data
          companyRanks.value = companyRanks.value?.filter((rank: Rank) => rank.weight !== 100)
        })
        .catch((err) => {
          console.error(err)
        })
    }
    function addUserToCompany () {
      if (!requestedUser.value || !rankToAssign.value) return
      assigningUserToCompany.value = true
      api.post('/api/companyUser/hire/' + companyId.value, {
        user_id: requestedUser.value?.id,
        rank_id: rankToAssign.value?.id
      })
        .then(() => {
          requestedUser.value = undefined
          companyRanks.value = undefined
          rankToAssign.value = undefined
          uMail.value = undefined
          assigningUserToCompany.value = false
        })
        .catch((err) => {
          console.error(err)
        })
    }
    return {
      uMail,
      searchUser,
      requestedUser,
      companyRanks,
      rankToAssign,
      assigningUserToCompany,
      addUserToCompany,
      loadingSearchResult
    }
  }
})
</script>
