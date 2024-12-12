<template>
  <div class="profile-container">
    <h2>Twój profil</h2>

    <div class="profile-details">
      <p><strong>Nazwa użytkownika:</strong> {{ username }}</p>
      <p><strong>Poziom dostępu:</strong> {{ accessLevel }}</p>
      <!--<p><strong>Adres email:</strong> {{ email }}</p>-->
      <!--<p><strong>Rola:</strong> {{ role }}</p>-->
    </div>

    <button @click="goToEditProfile" class="edit-profile-button">
      Edytuj profil
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { loginData } from '../main';

export default defineComponent({
  name: 'ProfileView',
  setup() {
    const router = useRouter();

    // Przykładowe dane profilu
    const username = ref('');
    //const email = 'jan.kowalski@example.com';
    //const role = 'Student';
    const accessLevel = ref(1);

    const goToEditProfile = () => {
      router.push({ name: 'EditProfile' });
    };

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
              accessLevel.value = data.permission_level
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

    return {
      username,
      //email,
      //role,
      accessLevel,
      goToEditProfile,
    };
  },
});
</script>

<style scoped>
.profile-container {
  font-family: Arial, sans-serif;
  padding: 16px;
  text-align: center;
}

.profile-details {
  margin: 16px 0;
}

.edit-profile-button {
  background-color: #27ae60;
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 16px;
}

.edit-profile-button:hover {
  background-color: #1e8449;
}
</style>
