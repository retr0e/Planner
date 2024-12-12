<template>
  <div class="edit-profile-container">
    <h2>Edytuj profil</h2>

    <form @submit.prevent="saveProfile">
      <div class="form-group">
        <label for="username">Nazwa użytkownika</label>
        <input v-model="username" id="username" type="text" required />
      </div>
      <div class="form-group">
        <label for="password">Hasło</label>
        <input v-model="password" id="password" type="password" required />
      </div>
      <div class="form-group">
        <label for="permissionLevel">Poziom dostępu</label>
        <input v-model="permissionLevel" id="permissionLevel" type="number" required />
      </div>
      <!--
      <div class="form-group">
        <label for="role">Rola</label>
        <input v-model="role" id="role" type="text" required />
      </div>
      -->

      <button type="submit" class="save-button">Zapisz zmiany</button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { loginData } from '../main';

export default defineComponent({
  name: 'EditProfile',
  setup() {
    const router = useRouter();

    // Przykładowe dane do edycji
    const username = ref('Jan Kowalski');
    const password = ref('examplePassword123');
    //const role = ref('Student'); //jeszcze w bazie nie mamy kont studentów XD
    const permissionLevel = ref(1);

    const loadProfile = () => {
      fetch("http://localhost:8080/profile/get", {
          method: "post",
          headers: {
                "Content-Type": "application/json"
            },
          body: JSON.stringify({
            key: loginData.session_key,
            user_id: loginData.user_id,
          })
        })
        .then(
          res => {
            console.log("Getting info for user " + loginData.login + " with id " + loginData.user_id);
            return res.json();
          })
        .then(
          data => {
            if (data.ok == true) {
              username.value = data.login,
              permissionLevel.value = data.permission_level
            }
            else {
              alert("Wystąpił problem podczas ładowania danych!");
            }
          })
        .catch(
          err => {
            console.error(err);
          });
    }

    loadProfile();

    const saveProfile = () => {
      fetch("http://localhost:8080/profile/edit", {
          method: "post",
          headers: {
                "Content-Type": "application/json"
            },
          body: JSON.stringify({
            key: loginData.session_key,
            user_id: loginData.user_id,
            newLogin: username.value,
            newPassword: password.value,
            newPermission_level: permissionLevel.value
          })
        })
        .then(
          res => {
            return res.json();
          })
        .then(
          data => {
            if (data.ok == true) {
              alert("Dane zaktualizowane");
            }
            else {
              alert("Wystąpił problem podczas edycji danych!");
            }
            router.push({ name: 'Profile' });
          })
        .catch(
          err => {
          console.error(err);
          router.push({ name: 'Profile' });
        });
    };

    return {
      username,
      password,
      //role,
      permissionLevel,
      saveProfile,
    };
  },
});
</script>

<style scoped>
.edit-profile-container {
  font-family: Arial, sans-serif;
  padding: 16px;
  text-align: center;
}

.form-group {
  margin-bottom: 16px;
}

.save-button {
  background-color: #27ae60;
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
}

.save-button:hover {
  background-color: #1e8449;
}
</style>
