<template>
    <header class="header">
      <nav class="nav">
        <ul class="nav-list">

          <li>
            <router-link to="/">Home</router-link>
          </li>
          
          <li v-if="!isLoggedIn" class="nav-item">
            <router-link to="/login" class="nav-link">Logowanie</router-link>
          </li>

          <li v-else class="nav-item">
            <a @click="logout" class="nav-link">Wyloguj</a>
          </li>
  
          <li v-if="isUser" class="nav-item">
            <li><router-link to="/edit" class="nav-link">Zarządzaj planem</router-link></li>
            <li><router-link to="/departments" class="nav-link">Zarządzaj wydziałami</router-link></li>
          </li>
          
          <li v-else-if="isAdmin" class="nav-item nav-list">
            <li><router-link to="/edit" class="nav-link">Zarządzaj planem</router-link></li>
            <li><router-link to="/departments" class="nav-link">Zarządzaj wydziałami</router-link></li>
            <li><router-link to="/admin/users" class="nav-link">Zarządzaj użytkownikami</router-link></li>
          </li>
        </ul>
      </nav>
    </header>
  </template>
  
  <script>
import { ref } from 'vue';

  export default {
    name: "HeaderComponent",
    computed: {
      isLoggedIn() {
        if (localStorage.getItem('authToken')) {
          return true;
        }
      },
      isUser() {
        if (localStorage.getItem('userRole') < 3 && localStorage.getItem('userRole') > 0 ) {
          return true;
        }
      },
      isAdmin() {
        if (localStorage.getItem('userRole') == 3) {
          return true;
        }
      }
    },
    methods: {
      async logout() {
        try {
          const res = await axios.post(
            'https://localhost/logout',
            {uuid: JSON.parse(localStorage.getItem('authToken'))},
            {
              withCredentials: true,
            }
          );
          console.log(res.data);
          
        } catch (err) {
          this.error = 'Błąd wylogowania z serwera';
        }

        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        open("/", '_self').close();
        this.$router.push('/');
      }
    }
  };
  </script>
  
  <style scoped>
  .header {
    background-color: #f8f9fa;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .nav-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    gap: 1rem;
  }
  
  .nav-item {
    font-size: 1rem;
  }
  
  .nav-link {
    text-decoration: none;
    color: #007bff;
    transition: color 0.3s;
  }
  
  .nav-link:hover {
    color: #0056b3;
  }
  </style>
  