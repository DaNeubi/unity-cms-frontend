<template>
  <q-layout view="lHh LpR lFf">
    <q-header reveal elevated class="bg-primary text-white">
      <q-toolbar class="q-mt-sm q-mb-sm">
        <q-btn dense flat round icon="mdi-menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>
          <HeaderComponent ref="headerComponent"/>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above
              v-model="leftDrawerOpen"
              :width="280"
              :breakpoint="300"
              :overlay="false"
              :persistent="true">
      <q-scroll-area class="fit">
        <div class="row">
          <div class="row col-12 items-baseline justify-center q-pt-sm q-pb-sm">
            <span class="text-h5 text-blue-7">C</span><span>onnect</span><span class="text-h5 text-blue-7">M</span><span>anagement</span><span class="text-h5 text-blue-7">S</span><span>ystem</span>
          </div>
          <div class="col-12 nav-header">
            <NavigationComponent ref="navigationComponent"/>
          </div>
          <div class="column items-center justify-center custom_link col-12 nav-header">
            <span>Version 0.<span @click="uglyEasterEgg()">3</span>.9 {{ '- ' + buildVersion }}</span>
            <a href="https://connect.ulife.me/impressum" target="_blank">Impressum (OOC)</a>
            <a href="https://forum.unity-life.de/wcf/index.php?datenschutzerklaerung/" target="_blank">Datenschutz (OOC)</a>
          </div>
        </div>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <q-page class="q-pa-md" id="currentPageView">
        <router-view />
      </q-page>
    </q-page-container>

    <q-footer reveal class="bg-primary text-white">
      <div class="row text-h5 q-ml-sm">
        <div v-if="connectEasterEggCounter < 7">CMS - Conne<span @click="connectEasterEggCounter++">c</span>t Internet Company © {{ copyrightDate }}</div>
        <div v-else>CMS - Collect Internet Company © {{ copyrightDate }}</div>
      </div>
    </q-footer>
  </q-layout>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import { companyStore } from 'stores/companyStore'
import NavigationComponent from 'components/general/NavigationComponent.vue'
import HeaderComponent from 'components/general/header/HeaderComponent.vue'
import { useQuasar } from 'quasar'
import SelectCompanyOverlay from 'components/general/overlay/SelectCompanyOverlay.vue'
import AdministrationChannels from 'src/misc/functions/administration/AdministrationChannels'
import laravelEcho from 'src/boot/laravelecho'
import NotificationType from 'src/misc/Enums/Notification/NotificationType'
import UserNotification from 'src/misc/classes/User/UserNotification'
import { useUserStore } from 'stores/useUserStore'
import GeneralNotification from 'src/misc/classes/WebSocketResults/General/GeneralNotification'
import UserCompanyChangeType from 'src/misc/Enums/User/UserCompanyChangeType'
import { api } from 'boot/axios'
import { useRouter } from 'vue-router'
import { notificationHistoryStateStore } from 'stores/notificationHistoryStore'

export default defineComponent({
  name: 'MainLayout',
  components: {
    HeaderComponent,
    NavigationComponent
  },

  setup () {
    const leftDrawerOpen = ref(false)
    const companyStateStore = companyStore()
    const companyId = computed(() => companyStateStore.companyId)
    const copyrightDate = ref(new Date().getFullYear())
    const $q = useQuasar()
    const backendUrl = ref(process.env.BACKEND_SERVER)
    const userStore = useUserStore()
    const userId = computed(() => userStore.userId)
    const hasSubscribedToChannels = ref<boolean>(false)
    const headerComponent = ref()
    const navigationComponent = ref()
    const connectEasterEggCounter = ref<number>(0)
    const primaryCompanyColor = ref<string|undefined>('#27272FFF')
    const buildVersion = process.env.BUILD_VERSION ?? 'dev-error'
    const notificationStore = notificationHistoryStateStore()
    const router = useRouter()
    onMounted(() => {
      // subscribe to all required channels
      subscribeToAllChannels()
      // check if the user is done with the onboarding
      if (!userStore.welcomeDone) {
        router.push('/user/onboarding')
      }
      // check if a company is selected via local store
      if (companyId.value <= 0) {
        // first check, if a company is located in the local storage
        if (!companyStateStore.checkForSavedCompany()) {
          // we need to show the overlay to select a company
          $q.dialog({
            component: SelectCompanyOverlay
          })
        }
      }
      getCompanyColors()
    })
    watch(userStore, () => {
      if (!userStore.welcomeDone) {
        router.push('/user/onboarding')
      }
    })
    watch(companyId, () => {
      if (companyId.value > 0 && !hasSubscribedToChannels.value) {
        subscribeToAllChannels()
      }
      primaryCompanyColor.value = '#27272FFF'
      getCompanyColors()
    })
    watch(userId, () => {
      if (userId.value >= 0) {
        subscribeToAllChannels()
        getCompanyColors()
      }
    })
    function subscribeToAllChannels () {
      if (hasSubscribedToChannels.value) return
      // subscribe to admin channels
      const adminChannelSubscription = new AdministrationChannels()
      adminChannelSubscription.subscribeToAdministrationChannels()
      listenToChannels()
    }
    async function listenToChannels () {
      if (userId.value <= 0) { return }
      hasSubscribedToChannels.value = true
      // global notification channel
      listenToGeneralNotifications()
      // personal notification channel
      listenToPrivateNotification()
      // company changed event
      listenToCompanyChangedEvent()
      // company color changed event
      listenToCompanyColorChangedEvent()
    }
    function listenToGeneralNotifications () {
      laravelEcho.join('general.notification').listen('.general.notification.all',
        (gn: GeneralNotification) => {
          // get the color
          let nColor = ''
          switch (gn.generalNotification.type) {
            case 2:
              nColor = 'info'
              break
            case 1:
              nColor = 'positive'
              break
            case 3:
              nColor = 'warning'
              break
            default:
              nColor = 'negative'
              break
          }
          // add to the notification history
          notificationStore.addNotification(gn.generalNotification.message)
          // send the message
          $q.notify({
            message: gn.generalNotification.message,
            color: nColor,
            position: 'center',
            timeout: 10000,
            icon: 'mdi-shield-account',
            progress: true,
            multiLine: true,
            caption: gn.generalNotification.sender ?? 'Von einem Admin⚙',
            closeBtn: 'Äh okay?...'
          })
        })
        .error((error: any) => { // eslint-disable-line
          console.error(error)
        })
    }
    function listenToPrivateNotification () {
      laravelEcho.private('user.notification.' + userId.value)
        .listen('.user.notification', (n: UserNotification) => {
          // get the color
          let nColor = ''
          let nIcon = ''
          switch (n.userNotification.notificationType) {
            case NotificationType.Info:
              nColor = 'info'
              nIcon = 'mdi-information-outline'
              break
            case NotificationType.Success:
              nColor = 'positive'
              nIcon = 'mdi-check-circle'
              break
            case NotificationType.Warning:
              nColor = 'warning'
              nIcon = 'mdi-alert'
              break
            default:
              nColor = 'negative'
              nIcon = 'mdi-alert-circle'
              break
          }
          // add to the notification history
          notificationStore.addNotification(n.userNotification.message)
          // send the message
          $q.notify({
            message: n.userNotification.message,
            color: nColor,
            position: 'top-right',
            timeout: 5000,
            icon: nIcon,
            progress: true
          })
        })
        .error((error: any) => { // eslint-disable-line
          console.error(error)
        })
    }
    function listenToCompanyChangedEvent () {
      laravelEcho.private('user.company.changed.' + userId.value)
        .listen('.user.company.changed', (n: { changeType: UserCompanyChangeType, message?: string, companyId: number | null}) => {
          $q.notify({
            message: n.message ?? '',
            color: 'info',
            position: 'top-right',
            timeout: 5000,
            icon: 'mdi-information-outline',
            progress: true
          })
          // do the things that need to be done
          switch (n.changeType) {
            case UserCompanyChangeType.JoinInfo:
              // reload the header dropdown companies
              triggerHeaderDropdownUpdate()
              break
            case UserCompanyChangeType.LeaveInfo:
              // reload the header dropdown companies
              triggerHeaderDropdownUpdate()
              changeCompanyIfFiredAndCurrentlyActive(n.companyId ?? -1)
              break
            case UserCompanyChangeType.RankUpdatedInfo:
              // reload the navigation
              navigationComponent.value.updateNavigationOnRankUpdate()
              break
          }
        })
        .error((error: any) => { // eslint-disable-line
          console.error(error)
        })
    }
    function listenToCompanyColorChangedEvent () {
      if (companyId.value <= 0) return
      laravelEcho.private('general.companyColorChanged.' + companyId.value)
        .listen('.company.companyColor.changed', () => {
          getCompanyColors()
        })
        .error((error: any) => { // eslint-disable-line
          console.error(error)
        })
    }
    function triggerHeaderDropdownUpdate () {
      headerComponent.value.updateAvailableCompanies()
    }
    function changeCompanyIfFiredAndCurrentlyActive (firedCompanyId: number) {
      if (firedCompanyId === -1) return
      // change the current working company if the fired company is the current one
      if (companyId.value !== firedCompanyId) return
      // change the company
      companyStateStore.updateCompanyId(-1)
    }
    function uglyEasterEgg () {
      $q.notify({
        message: 'Ich bin hässlich und ich bin stolz! Ich bin hässlich und ich bin stolz! ICH BIN HÄSSLICH UND ICH BIN STOLZ!',
        color: 'primary',
        icon: 'mdi-egg-easter',
        position: 'center',
        timeout: 2000
      })
    }
    function getCompanyColors () {
      if (companyId.value <= 0) return
      api.get('/api/companyColors/' + companyId.value)
        .then((res) => {
          if (res.data.primary_color !== null) {
            primaryCompanyColor.value = res.data.primary_color
          }
        })
        .catch((err) => {
          console.error(err)
        })
    }
    return {
      leftDrawerOpen,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },
      copyrightDate,
      backendUrl,
      headerComponent,
      navigationComponent,
      connectEasterEggCounter,
      uglyEasterEgg,
      buildVersion,
      primaryCompanyColor
    }
  }
})
</script>

<style>
.nav-header {
  border-top: 1px solid rgba(255, 255, 255, 0.28);
}
.custom_link a, a:hover {
  color: #9C5A96;
  text-decoration: none;
}
.custom-company-background-color {
  background-color: v-bind('primaryCompanyColor') !important;
}
.custom-company-color {
  color: v-bind('primaryCompanyColor') !important;
}

/**
  * Sticky Table Header
  */
.cms-sticky-header-table {
  /* height or max-height is important */
  min-height: 20vh;
  /* this is when the loading indicator appears */
  /* prevent scrolling behind sticky top row on focus */ }
.cms-sticky-header-table .q-table__top,
.cms-sticky-header-table .q-table__bottom,
.cms-sticky-header-table thead tr:first-child th {
  /* bg color is important for th; just specify one */
  background-color: v-bind('primaryCompanyColor'); }
.cms-sticky-header-table thead tr th {
  position: sticky;
  z-index: 1; }
.cms-sticky-header-table thead tr:first-child th {
  top: 0; }
.cms-sticky-header-table.q-table--loading thead tr:last-child th {
  /* height of all previous header rows */
  top: 48px; }
.cms-sticky-header-table tbody {
  /* height of all previous header rows */
  scroll-margin-top: 48px; }

/**
  * Calendar
 */
.cal-theme-cms .cv-header,
.cal-theme-cms .cv-header-day {
  background-color: v-bind('primaryCompanyColor');
  color: #FFFFFF;
}
.cal-theme-cms .cv-day.today {
  background-color: v-bind('primaryCompanyColor');
}

</style>
