<template>
  <q-card>
    <q-card-section>
      <div class="column">
        <h5 class="q-mt-sm">Manuelles hinzufügen oder entfernen</h5>
        <span class="hint-text">
          Hinweis: Der Mitarbeiteranteil wird 1:1 abgezogen/hinzugefügt.<br/>
          Soll eine Summe hinzugefügt werden, so kann ganz normal die entsprechende Summe eingegeben werden.<br/>
          Soll eine Summe abgezogen werden, einfach eine Zahl {{ '< 0' }} nutzen.<br/>
        </span>
      </div>
      <div class="column q-mt-sm q-gutter-md">
        <q-select v-model="selectedUser"
                  outlined
                  :options="allUsers"
                  :option-label="item => item.first_name + ' ' + item.last_name"
                  label="Mitarbeiter/in">
          <template v-slot:append>
            <q-icon name="mdi-account-multiple"/>
          </template>
        </q-select>
        <q-input type="number"
                 label="Trinkgeld in $"
                 outlined
                 v-model.number="addedTip"/>
        <q-input type="number"
                 label="Mitarbeiteranteil in $"
                 outlined
                 v-model.number="addedShare"/>
        <q-input label="Notiz*"
                 outlined
                 v-model="note"
                 counter
                 maxlength="800"/>
        <q-checkbox v-model="clearNote"
                    :disable="!canResetNote"
                    label="Notiz beim buchen zurücksetzen"/>
        <div>
          <q-btn label="Buchen"
                 outline
                 color="positive"
                 :disable="!toggleButton()"
                 @click="addMoneyToUser()"
                 icon="mdi-cash-multiple"/>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { api } from 'src/boot/axios'
import IUser from 'src/misc/interfaces/User/IUser'
import { defineComponent, onMounted, ref, watch } from 'vue'

export default defineComponent({
  name: 'AddUserMoneyManuallyComponent',
  components: {},
  props: {
    companyId: {
      type: Number,
      required: true,
      default: 0
    },
    reloadInt: {
      type: Number,
      required: true,
      default: 0
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
    }
  },
  setup (props) {
    const allUsers = ref<IUser[]>([])
    const selectedUser = ref<IUser>()
    const addedTip = ref<number>()
    const addedShare = ref<number>()
    const note = ref<string>()
    const clearNote = ref<boolean>(true)
    onMounted(() => {
      getAllUsers()
    })
    watch(() => props.companyId, () => {
      getAllUsers()
      resetUi()
    })
    watch(() => props.reloadInt, () => {
      getAllUsers()
      resetUi()
    })
    function getAllUsers () {
      if (props.companyId <= 0) return
      api.get('/api/companyUsers/forPayment/' + props.companyId)
        .then((res) => {
          allUsers.value = res.data.users
        })
        .catch((err) => {
          console.error(err)
        })
    }
    function resetUi () {
      selectedUser.value = undefined
      addedTip.value = undefined
      addedShare.value = undefined
      if (clearNote.value) {
        note.value = undefined
      }
    }
    function toggleButton () : boolean {
      return (addedTip.value === undefined || addedShare.value === undefined || selectedUser.value === undefined) && (note.value !== undefined && note.value.length > 0) && selectedUser.value !== undefined
    }
    function addMoneyToUser () {
      if (props.companyId <= 0) return
      api.post('/api/payout/manual/' + props.companyId, {
        receiver_id: selectedUser.value?.id,
        tip: addedTip.value ?? 0,
        share: addedShare.value ?? 0,
        note: note.value ?? ''
      })
        .catch((err) => {
          console.error(err)
        })
    }
    return {
      allUsers,
      addedTip,
      addedShare,
      note,
      clearNote,
      selectedUser,
      toggleButton,
      addMoneyToUser
    }
  }
})
</script>
