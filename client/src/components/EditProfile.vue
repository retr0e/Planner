<template>
  <div class="edit-profile-container">
    <h2>Edytuj profil</h2>

    <form @submit.prevent="saveProfile">
      <div class="form-group">
        <label for="username">Nazwa użytkownika</label>
        <input v-model="username" id="username" type="text" required />
      </div>
      <div class="form-group">
        <label for="email">Adres email</label>
        <input v-model="email" id="email" type="email" required />
      </div>
      <div class="form-group">
        <label for="role">Rola</label>
        <input v-model="role" id="role" type="text" required />
      </div>

      <button type="submit" class="save-button">Zapisz zmiany</button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'EditProfile',
  setup() {
    const router = useRouter();

    // Przykładowe dane do edycji
    const username = ref('Jan Kowalski');
    const email = ref('jan.kowalski@example.com');
    const role = ref('Student');

    const saveProfile = () => {
      // Można dodać logikę zapisu danych na serwerze
      alert('Profil został zaktualizowany!');
      router.push({ name: 'Profile' });
    };

    return {
      username,
      email,
      role,
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
