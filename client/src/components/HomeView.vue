<template>
  <div class="home-container">
    <h1>Wybierz kierunek</h1>

    <ul class="courses-list">
      <li
        v-for="course in courses"
        :key="course.id"
        @click="goToSchedule(course.id)"
        class="course-item"
      >
        {{ course.name }}
      </li>
    </ul>

    <!-- Przycisk do wyświetlenia formularza logowania -->
    <button v-if="!isLoggedIn" @click="toggleLoginForm" class="login-button">
      Zaloguj się
    </button>
    <button v-if="isLoggedIn" @click="logout" class="logout-button">
      Wyloguj się
    </button>

    <!-- Formularz logowania -->
    <div v-if="showLoginForm" class="login-form">
      <input
        v-model="username"
        type="text"
        placeholder="Nazwa użytkownika"
        class="input-field"
      />
      <input
        v-model="password"
        type="password"
        placeholder="Hasło"
        class="input-field"
      />
      <button @click="login" class="submit-button">Zaloguj</button>
    </div>

    <!-- Przycisk do zobaczenia profilu -->
    <button v-if="isLoggedIn" @click="goToProfile" class="profile-button">
      Zobacz profil
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'HomeView',
  setup() {
    const router = useRouter();

    const courses = [
      { id: 1, name: 'Informatyka' },
      { id: 2, name: 'Administracja' },
      { id: 3, name: 'Zarządzanie produkcją' },
    ];

    const showLoginForm = ref(false);
    const username = ref('');
    const password = ref('');
    const isLoggedIn = ref(false);

    const goToSchedule = (courseId: number) => {
      router.push({
        name: 'Schedule',
        params: { id: courseId, courseName: 'test' },
      });
    };

    const toggleLoginForm = () => {
      showLoginForm.value = !showLoginForm.value;
    };

    const login = () => {
      if (username.value && password.value) {
        isLoggedIn.value = true;
        showLoginForm.value = false;
      }
    };

    const logout = () => {
      isLoggedIn.value = false;
    };

    const goToProfile = () => {
      router.push({ name: 'Profile' });
    };

    return {
      courses,
      goToSchedule,
      showLoginForm,
      username,
      password,
      login,
      logout,
      isLoggedIn,
      toggleLoginForm,
      goToProfile,
    };
  },
});
</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* min-height: 100vh; */
  background: linear-gradient(135deg, #bdc3c7, #2c3e50);
  color: white;
  font-family: 'Roboto', sans-serif;
  transition: all 0.3s ease-in-out;
  padding: 0;
  margin: 0;
  /* height: 100vh; */
  height: fit-content;
  padding: 50px;
}

h1 {
  font-size: 3rem;
  margin-bottom: 30px;
  text-align: center;
  animation: fadeIn 1s ease-in-out;
}

.courses-list {
  list-style-type: none;
  padding: 0;
  margin-bottom: 30px;
  animation: slideIn 1.2s ease-out;
}

.course-item {
  font-size: 1.5rem;
  margin: 15px 0;
  padding: 15px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.course-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.login-button,
.logout-button,
.profile-button,
.submit-button {
  background-color: #27ae60;
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 16px;
  transition: background-color 0.3s, transform 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.login-button:hover,
.logout-button:hover,
.profile-button:hover,
.submit-button:hover {
  background-color: #1e8449;
  transform: translateY(-3px);
}

input[type='text'],
input[type='password'] {
  width: 300px;
  padding: 12px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
}

input[type='text']:focus,
input[type='password']:focus {
  border-color: #27ae60;
}

.login-form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes slideIn {
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
