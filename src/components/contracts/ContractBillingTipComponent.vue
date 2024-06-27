<template>
  <div class="row">
    <div class="col-12 text-h6">
      Hier kann ausgewählt werden, wer beim Abrechnen wie viel Trinkgeld bekommt.
    </div>
    <q-list class="col-12">
      <q-item v-for="user in availableUsers" :key="user.id">
        <q-item-section avatar>
          <q-icon name="mdi-account" :color="user.color"/>
        </q-item-section>
        <q-item-section side>
          {{ user?.first_name + ' ' + user?.last_name }}
        </q-item-section>
        <q-item-section>
          <q-slider v-model="user.tipAmount" label :label-value="'$' + user.tipAmount" markers
                    label-always :color="user.color" :min="0" :max="maxAvailableAmount"/>
        </q-item-section>
      </q-item>
    </q-list>

  </div>
</template>

<script setup lang="ts">
import { computed, PropType } from 'vue'
import IContractOnHoldTransaction from '../../misc/interfaces/Contract/IContractOnHoldTransaction'
import IUser from '../../misc/interfaces/User/IUser'

const props = defineProps({
  selectedTransactions: {
    type: Array as PropType<IContractOnHoldTransaction[]>,
    required: true
  }
})
const availableUsers = computed(() => {
  if (props.selectedTransactions === undefined) return []
  const users: IUser[] = []
  props.selectedTransactions.forEach((transaction) => {
    if (transaction.user !== undefined) {
      // check if user is already in array
      const userIndex = users.findIndex((user) => user.id === transaction.user?.id)
      if (userIndex >= 0) return
      transaction.user.tipAmount = 0
      transaction.user.color = getRandomColor()
      users.push(transaction.user)
    }
  })
  return users
})
const maxAvailableAmount = computed(() => {
  if (props.selectedTransactions === undefined) return 0
  let total = 0
  props.selectedTransactions.forEach((transaction) => {
    total += transaction.total
  })
  return total
})

const availableColors = ['red', 'red-10', 'pink', 'pink-5', 'purple', 'purple-5', 'deep-purple', 'deep-purple-5',
  'indigo', 'indigo-5', 'blue', 'blue-5', 'light-blue', 'light-blue-5', 'cyan', 'cyan-5', 'teal', 'teal-5', 'green',
  'green-5', 'light-green', 'light-green-5', 'lime', 'lime-5', 'yellow', 'yellow-5', 'amber', 'amber-5', 'orange',
  'orange-5', 'blue-grey', 'blue-grey-5']
function getRandomColor (): string {
  return availableColors[Math.floor(Math.random() * availableColors.length)]
}

</script>

<style scoped>

</style>
