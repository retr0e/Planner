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
  
          <li v-else-if="isUser" class="nav-item">
            <router-link to="/edit" class="nav-link">Twój plan zajęć</router-link>
            <button @click="logout" class="nav-link">Wyloguj</button>
          </li>
          
          <li v-else-if="isAdmin" class="nav-item">
            <router-link to="/departments" class="nav-link">Zarządzaj wydziałami</router-link>
            <router-link to="/admin/users" class="nav-link">Zarządzaj użytkownikami</router-link>
            <button @click="logout" class="nav-link">Wyloguj</button>
          </li>
        </ul>
      </nav>
    </header>
  </template>
  
  <script>
  export default {
    name: "HeaderComponent",
    computed: {
      isLoggedIn() {
        
      },
      isUser() {
        
      },
      isAdmin() {
        
      }
    },
    methods: {
      logout() {
  
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
  