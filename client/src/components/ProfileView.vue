<template>
  <div class="profile-container">
    <h2>Twój profil</h2>

    <div class="profile-details">
      <p><strong>Nazwa użytkownika:</strong> {{ username }}</p>
      <p><strong>Adres email:</strong> {{ email }}</p>
      <p><strong>Rola:</strong> {{ role }}</p>
    </div>

    <button @click="goToEditProfile" class="edit-profile-button">
      Edytuj profil
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'ProfileView',
  setup() {
    const router = useRouter();

    // Przykładowe dane profilu
    const username = 'Jan Kowalski';
    const email = 'jan.kowalski@example.com';
    const role = 'Student';

    const goToEditProfile = () => {
      router.push({ name: 'EditProfile' });
    };

    return {
      username,
      email,
      role,
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
