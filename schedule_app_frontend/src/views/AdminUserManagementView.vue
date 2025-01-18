<template>
  <div class="user-management">
    <h1>Zarządzanie Użytkownikami</h1>

    <!-- Formularz dodawania/modyfikacji użytkownika -->
    <div class="form-card">
      <h2>{{ editMode ? 'Edytuj Użytkownika' : 'Dodaj Użytkownika' }}</h2>
      <form @submit.prevent="saveUser">
        <div class="form-group">
          <label for="login">Login *</label>
          <input type="text" id="login" v-model="form.login" placeholder="Wprowadź login" required />
        </div>
        <div class="form-group">
          <label for="password">Hasło *</label>
          <input type="password" id="password" v-model="form.password" placeholder="Wprowadź hasło" required />
        </div>
        <div class="form-group">
          <label for="account_type">Poziom dostępu *</label>
          <select id="account_type" v-model="form.account_type" required>
            <option disabled value="-1">Wybierz typ</option>
            <option
              v-for="type in account_types"
              :value="type.id">
              {{ type.account_type }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="employee_id">Pracownik</label>
          <select id="employee_id" v-model="form.employee_id">
            <option disabled value="-1">Wybierz</option>
            <option
              v-for="employee in employees"
              :value="employee.id">
              {{ employee.name }}
            </option>
          </select>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">
            {{ editMode ? 'Zapisz' : 'Dodaj' }}
          </button>
          <button
            type="button"
            v-if="editMode"
            class="btn btn-secondary"
            @click="cancelEdit"
          >
            Anuluj
          </button>
        </div>
      </form>
    </div>

    <!-- Lista użytkowników -->
    <div class="user-list">
      <h2>Lista Użytkowników</h2>
      <ul>
        <li v-for="(user, index) in users" :key="index" class="list-item">
          <span>
            <strong>{{ user.login }}</strong> - {{ user.first_name }} {{ user.last_name }}
            <br />
            <small>Rodzaj konta: {{ user.account_type_name }}</small>
          </span>
          <div v-if="user.id != currentUserId" class="actions">
            <button class="btn btn-edit" @click="editUser(index)">Edytuj</button>
            <button class="btn btn-delete" @click="deleteUser(index)">Usuń</button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      users: [],
      account_types: [{ id: 1, account_type: 'AdministratorTEMP' }, { id: 2, account_type: 'Użytkownik' }],
      employees: [],
      form: {
        id: null,
        login: '',
        password: '',
        account_type: null,
        employee_id: null,
      },
      editMode: false,
      editIndex: null,
      currentUserId: localStorage.getItem('userId'),
    };
  },
  methods: {
    saveUser() {
      if (this.editMode) {
        axios.post('https://localhost/profile/update', {
          key: localStorage.getItem('authToken'),
          id: this.form.id,
          login: this.form.login,
          password: this.form.password,
          account_type: this.form.account_type,
          employee_id: this.form.employee_id,
        })
          .then((response) => {
            //console.log(this.form);
            //this.users[this.editIndex] = { ...this.form };
            this.getUsersFromAPI();
            this.resetForm();
          })
          .catch((error) => {
            console.error('Błąd zapisu danych:', error);
          });
      } else {
        axios.post('https://localhost/profile/add', {
          key: localStorage.getItem('authToken'),
          login: this.form.login,
          password: this.form.password,
          account_type: this.form.account_type,
          employee_id: this.form.employee_id,
        })
          .then((response) => {
            //console.log(this.form);
            //this.users.push({ ...this.form });
            this.getUsersFromAPI();
            this.resetForm();
          })
          .catch((error) => {
            console.error('Błąd zapisu danych:', error);
          });
      }
      
    },
    editUser(index) {
      this.editIndex = index;
      this.form = { ...this.users[index] };
      this.editMode = true;
    },
    deleteUser(index) {
      axios.post('https://localhost/profile/delete', {
        key: localStorage.getItem('authToken'),
        id: this.users[index].id,
      })
        .then((response) => {
          this.users.splice(index, 1);
        })
        .catch((error) => {
          console.error('Błąd usuwania danych:', error);
        });
    },
    cancelEdit() {
      this.resetForm();
    },
    resetForm() {
      this.form = { 
        id: null,
        login: '',
        password: '',
        account_type: null,
        employee_id: null
      };
      this.editMode = false;
      this.editIndex = null;
    },
    getUsersFromAPI() {
      axios.post('https://localhost/profile/get-all', {
        key: localStorage.getItem('authToken'),
      })
        .then((response) => {
          this.users = response.data.users;
        })
        .catch((error) => {
          console.error('Błąd pobierania danych:', error);
        });
    },
    getAccountTypesFromAPI() {
      axios.post('https://localhost/profile/get-accounts-types', {
        key: localStorage.getItem('authToken'),
      })
        .then((response) => {
          this.account_types = response.data.account_types;
        })
        .catch((error) => {
          console.error('Błąd pobierania danych:', error);
        });
    },
    getEmployeesFromAPI() {
      axios.post('https://localhost/employees', {
        key: localStorage.getItem('authToken'),
      })
        .then((response) => {
          this.employees = response.data.employees;
        })
        .catch((error) => {
          console.error('Błąd pobierania danych:', error);
        });
    },
  },
  mounted() {
    this.getUsersFromAPI();
    this.getAccountTypesFromAPI();
    this.getEmployeesFromAPI();
  },
};
</script>

<style scoped>
.user-management {
  font-family: Arial, sans-serif;
  max-width: 700px;
  margin: 2rem auto;
  padding: 1rem;
}

h1,
h2 {
  text-align: center;
  margin-bottom: 1.5rem;
}

.form-card {
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

input:focus {
  outline: none;
  border-color: #007bff;
}

.form-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-edit {
  background-color: #ffc107;
  color: white;
}

.btn-delete {
  background-color: #dc3545;
  color: white;
}

.user-list ul {
  list-style: none;
  padding: 0;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.actions {
  display: flex;
  gap: 0.5rem;
}
</style>
