<template>
    <div class="admin-user-management">
      <h1>Zarządzanie Użytkownikami</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Login</th>
            <th>Imię</th>
            <th>Nazwisko</th>
            <th>Poziom dostępu</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.login }}</td>
            <td>{{ user.first_name }}</td>
            <td>{{ user.last_name }}</td>
            <td>{{ user.permission_level }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  import axios from 'axios';

  export default {
    data() {
      return {
        // Przykładowa lista użytkowników
        users: [
          { id: 1, login: 'admin', first_name: 'Jan', last_name: 'Kowalski', active: true },
          { id: 2, login: 'jdoe', first_name: 'John', last_name: 'Doe', active: true },
          { id: 3, login: 'aszym', first_name: 'Anna', last_name: 'Szymańska', active: false },
        ],
      };
    },
    methods: {
      toggleUserActivity(userId) {
        const user = this.users.find((u) => u.id === userId);
        if (user) {
          user.active = !user.active;
          // Tutaj możesz dodać logikę wysyłania zmian na backend
          console.log(`Użytkownik ${userId} aktywny: ${user.active}`);
        }
      },
      getUsersFromAPI() {
        axios.post('https://localhost/profile/get-all',
          {key: localStorage.getItem('authToken')}
        )
          .then((response) => {
            this.users = response.data.users;
          })
          .catch((error) => {
            console.error('Błąd pobierania danych:', error);
          });
      }
    },
    mounted() {
      this.getUsersFromAPI();
    },
  };
  </script>
  
  <style scoped>
  .admin-user-management {
    font-family: Arial, sans-serif;
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }
  
  th, td {
    padding: 10px;
    border: 1px solid #ddd;
    text-align: left;
  }
  
  th {
    background-color: #f4f4f4;
  }
  
  .switch {
    position: relative;
    display: inline-block;
    width: 34px;
    height: 20px;
  }
  
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.4s;
    border-radius: 20px;
  }
  
  .slider:before {
    position: absolute;
    content: '';
    height: 14px;
    width: 14px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
  
  input:checked + .slider {
    background-color: #4caf50;
  }
  
  input:checked + .slider:before {
    transform: translateX(14px);
  }
  </style>
  