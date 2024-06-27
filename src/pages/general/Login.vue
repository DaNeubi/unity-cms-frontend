<template>
  <div class="column items-center full-width full-height content-center">
    <q-card class="login-card q-mt-xl shadow-8">
      <q-card-section>
        <div class="row items-center justify-center">
          <div class="text-h3">
            Einloggen
          </div>
          <q-form @submit="submit" class="col-12 q-mt-sm row justify-center q-gutter-md">
            <q-input v-model="form.umail"
                     outlined
                     hint="Deine Unity-Life Mailadresse📧."
                     label="ulife Mailadresse"
                     class="ui-input">
              <template v-slot:append>
                <q-icon name="mdi-at"/>
              </template>
            </q-input>
            <q-input v-model="form.pwd"
                     :type="displayPassword ? 'password' : 'text'"
                     outlined
                     hint="Die Tür🚪 macht biep boop biep boop."
                     label="Passwort"
                     class="ui-input col-12">
              <template v-slot:append>
                <q-icon :name="displayPassword ? 'mdi-eye' : 'mdi-eye-off'"
                        class="cursor-pointer"
                        @click="displayPassword = !displayPassword"/>
              </template>
            </q-input>
            <div class="col-12 justify-center items-center q-mt-lg"
                 v-if="showLoginError">
              <span class="text-subtitle2 text-red-7">
                Ungültige U-Mail Adresse oder Passwort.
              </span>
            </div>
            <div class="row items-center justify-around q-gutter-md">
              <q-btn type="submit"
                     label="Einloggen"
                     class="col-auto"
                     color="primary"
                     icon="mdi-login"
                     push
                     id="login_button"
                     :loading="loadingLogin"
                     @click="loadingLogin = true">
                <template v-slot:loading>
                  <q-spinner-hourglass color="tertiary" class="on-left"/>
                  Logge ein...
                </template>
              </q-btn>
              <div class="custom_link col-auto">
                <a href="https://admin.ulife.me/player/login" target="_blank">E-Mail Adresse vergessen?</a>
              </div>
              <div class="col-auto custom_link cursor-pointer">
                <a href="https://admin.ulife.me/player/login" target="_blank">Passwort vergessen?</a>
              </div>
            </div>
          </q-form>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { mapActions } from 'pinia'
import { LoginFormThing, useUserStore } from 'stores/useUserStore'

export default defineComponent({
  name: 'LogIn',
  components: {},
  setup () {
    const email = ref<string>()
    const password = ref<string>()
    const displayPassword = ref<boolean>(true)
    const loadingLogin = ref<boolean>(false)
    const loginButton = ref()
    const form = ref<LoginFormThing>({ umail: '', pwd: '' })
    const showLoginError = ref<boolean>(false)
    return {
      email,
      password,
      displayPassword,
      loadingLogin,
      loginButton,
      form,
      showLoginError
    }
  },
  methods: {
    ...mapActions(useUserStore, { login: 'signIn' }),
    async submit () {
      if (await this.login(this.form)) {
        this.$router.replace({ name: 'home' })
      } else {
        this.loadingLogin = false
        this.showLoginError = true
      }
    }
  }
})
</script>

<style scoped>
.login-card {
  width: 40rem;
  min-width: 40rem;
}
.ui-input {
  width: 25rem;
}
.custom_link a, a:hover {
  color: #9C5A96;
  text-decoration: none;
}

.custom_link {
  color: #9C5A96;
}
</style>
