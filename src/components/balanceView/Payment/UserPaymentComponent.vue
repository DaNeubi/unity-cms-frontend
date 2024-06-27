<template>
  <div class="row q-gutter-sm" v-if="!loadingPerms">
    <UserPayoutComponent :can-see-all="canSeeAll"
                         class="col-12"
                         :can-see-salaries="canSeeSalaries"
                         :company-id="companyId"
                         v-if="canSeeAll || canSeeSalaries"
                         :reload-int="userPayoutComponentReload"/>
    <AddUserMoneyManuallyComponent class="col-12"
                                   :company-id="companyId"
                                   :reload-int="addUserMoneyManuallyComponentReload"
                                   :can-add-tip="canAddTip"
                                   :can-add-share="canAddShare"
                                   :can-reset-note="canResetNote"
                                   :can-remove-share="canRemoveShare"
                                   :can-remove-tip="canRemoveTip"
                                   v-if="canSeeAll || canSeeManualAddRemove"/>
    <ManuallyAddedUserTransactionsComponent class="col-12"
                                            :company-id="companyId"
                                            v-if="canSeeAll || canSeeManualAddedHistory"
                                            :reload-int="addUserMoneyManuallyComponentReload"/>
    <UserPayoutHistoryComponent class="col-12"
                                :company-id="companyId"
                                :reload-int="userPayoutHistoryComponentReload"
                                v-if="canSeeAll || canSeePayoutHistory"/>
  </div>
  <div class="row q-gutter-md" v-else>
    <q-skeleton class="col-12"/>
    <q-skeleton class="col-12"/>
    <q-skeleton class="col-12"/>
    <q-skeleton class="col-12"/>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import UserPayoutComponent from 'components/balanceView/Payment/UserPayoutComponent.vue'
import AddUserMoneyManuallyComponent from 'components/balanceView/Payment/AddUserMoneyManuallyComponent.vue'
import ManuallyAddedUserTransactionsComponent from 'components/balanceView/Payment/ManuallyAddedUserTransactionsComponent.vue'
import UserPayoutHistoryComponent from 'components/balanceView/Payment/UserPayoutHistoryComponent.vue'
import laravelEcho from 'src/boot/laravelecho'

export default defineComponent({
  name: 'UserPaymentComponent',
  components: { UserPayoutHistoryComponent, ManuallyAddedUserTransactionsComponent, AddUserMoneyManuallyComponent, UserPayoutComponent },
  props: {
    canSeeAll: {
      type: Boolean,
      required: true,
      default: false
    },
    canSeeSalaries: {
      type: Boolean,
      required: true,
      default: false
    },
    canSeeManualAddRemove: {
      type: Boolean,
      required: true,
      default: false
    },
    canSeePayoutHistory: {
      type: Boolean,
      required: true,
      default: false
    },
    canSeeManualAddedHistory: {
      type: Boolean,
      required: true,
      default: false
    },
    canMakePayoutDefault: {
      type: Boolean,
      required: true,
      default: false
    },
    canMakePayoutCustom: {
      type: Boolean,
      required: true,
      default: false
    },
    canRevertPayout: {
      type: Boolean,
      required: true,
      default: false
    },
    canAddEverything: {
      type: Boolean,
      required: true,
      default: false
    },
    canAddTip: {
      type: Boolean,
      required: true,
      default: false
    },
    canRemoveTip: {
      type: Boolean,
      required: true,
      default: false
    },
    canAddShare: {
      type: Boolean,
      required: true,
      default: false
    },
    canRemoveShare: {
      type: Boolean,
      required: true,
      default: false
    },
    canResetNote: {
      type: Boolean,
      required: true,
      default: false
    },
    companyId: {
      type: Number,
      required: true,
      default: 0
    },
    loadingPerms: {
      type: Boolean,
      required: true,
      default: false
    },
    userId: {
      type: Number,
      required: true,
      default: 0
    }
  },
  setup (props) {
    const userPayoutComponentReload = ref<number>(0)
    const addUserMoneyManuallyComponentReload = ref<number>(0)
    const manuallyAddedUserTransactionsComponentReload = ref<number>(0)
    const userPayoutHistoryComponentReload = ref<number>(0)
    onMounted(() => {
      joinReloadChannel()
    })
    watch(() => props.companyId, () => {
      joinReloadChannel()
    })
    watch(() => props.userId, () => {
      joinReloadChannel()
    })
    onUnmounted(() => {
      laravelEcho.leave('user.payment.' + props.userId)
    })
    function joinReloadChannel () {
      if (props.companyId <= 0 || props.userId <= 0) return
      laravelEcho.private('user.payment.' + props.userId)
        .listen('.user.payment', (cb: { paymentTypes: number }) => {
          switch (cb.paymentTypes) {
            case 0:
              // made payment, reload user balance currents and user payout history
              userPayoutComponentReload.value++
              userPayoutHistoryComponentReload.value++
              break
            case 1:
              // reverted a payment, reload user balance currents and user payout history
              userPayoutComponentReload.value++
              userPayoutHistoryComponentReload.value++
              break
            case 2:
              // manual payment, reload user balance and manually payment history
              userPayoutComponentReload.value++
              manuallyAddedUserTransactionsComponentReload.value++
              break
          }
        })
    }
    return {
      userPayoutComponentReload,
      addUserMoneyManuallyComponentReload,
      manuallyAddedUserTransactionsComponentReload,
      userPayoutHistoryComponentReload
    }
  }
})
</script>

<style scoped>

</style>
