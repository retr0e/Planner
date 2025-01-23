<template>
  <div class="department-management">
    <h1>Zarządzanie Wydziałami</h1>
    <!-- Formularz dodawania/modyfikacji wydziału -->
    <div class="form-card">
      <h2>{{ editMode ? 'Edytuj Wydział' : 'Dodaj Wydział' }}</h2>
      <form @submit.prevent="saveDepartment">
        <div class="form-group">
          <label for="name">Nazwa Wydziału</label>
          <input type="text" id="name" v-model="form.name" placeholder="Wprowadź nazwę" required />
        </div>
        <div>
          <label for="open_time">Godzina otwarcia</label>
          <input type="time" id="open_time" v-model="form.open_time" required />
        </div>
        <div>
          <label for="close_time">Godzina zamknięcia</label>
          <input type="time" id="close_time" v-model="form.close_time" required />
        </div>
        <div class="form-group">
          <label for="location">Adres</label>
          <input
            type="text"
            id="location"
            v-model="form.department_address"
            placeholder="Wprowadź adres"
            required
          />
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

    <!-- Lista wydziałów -->
    <div class="department-list">
      <h2>Lista Wydziałów</h2>
      <ul>
        <li v-for="(department, index) in departments" :key="index" class="list-item">
          <span>
            <strong>{{ department.name }}</strong> - {{ department.street }}
            <br />
            <small>Godziny otwarcia: {{ formatTime(department.open_time) }} - {{ formatTime(department.close_time) }}</small>
          </span>
          <div class="actions">
            <button class="btn btn-edit" @click="editDepartment(index)">Edytuj</button>
            <button class="btn btn-delete" @click="deleteDepartment(index)">Usuń</button>
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
      departments: [
        
      ],
      form: {
        department_id: null,
        name: '',
        open_time: null,
        close_time: null,
        street: '',
      },
      editMode: false,
      editIndex: null,
    };
  },
  methods: {
    saveDepartment() {
      if (this.editMode) {
        axios.post('https://localhost/departments/update', {
          key: localStorage.getItem('authToken'),
          id: this.form.department_id,
          name: this.form.name,
          open_time: this.form.open_time,
          close_time: this.form.close_time,
          department_address: this.form.department_address,
        })
          .then((response) => {
            this.$toast.success('Wydział został zaktualizowany pomyślnie.');
            this.getDepartmentsFromAPI();
          })
          .catch((error) => {
            console.error('Błąd aktualizacji danych:', error);
            this.displayError(error.response.data.reason);
          });
      } else {
        axios.post('https://localhost/departments/add', {
          key: localStorage.getItem('authToken'),
          name: this.form.name,
          open_time: this.form.open_time,
          close_time: this.form.close_time,
          department_address: this.form.department_address,
        })
          .then((response) => {
            this.$toast.success('Wydział został dodany pomyślnie.');
            this.getDepartmentsFromAPI();
          })
          .catch((error) => {
            console.error('Błąd dodawania danych:', error);
            this.displayError(error.response.data.reason);
          });
      }
      this.resetForm();
    },
    editDepartment(index) {
      this.editIndex = index;
      this.form = { ...this.departments[index] };
      this.editMode = true;
    },
    deleteDepartment(index) {
      const departmentId = this.departments[index].department_id;
      axios.post('https://localhost/departments/delete', {
        key: localStorage.getItem('authToken'),
        id: departmentId,
      })
        .then((response) => {
          this.$toast.success('Wydział został usunięty pomyślnie.');
          this.getDepartmentsFromAPI();
        })
        .catch((error) => {
          console.error('Błąd usuwania danych:', error);
          this.displayError(error.response.data.reason);
        });
    },
    cancelEdit() {
      this.resetForm();
    },
    resetForm() {
      this.form = { name: '', location: '', employees: null };
      this.editMode = false;
      this.editIndex = null;
    },
    displayError(message) {
      this.$toast.error(message);
    },
    getDepartmentsFromAPI() {
      axios.post('https://localhost/departments/get-all', {
        key: localStorage.getItem('authToken'),
      })
        .then((response) => {
          this.departments = response.data.departments;
        })
        .catch((error) => {
          console.error('Błąd pobierania danych:', error);
          this.displayError(error.response.data.reason);
        });
    },
    formatTime(dateString) {
      const date = new Date(dateString); 
      return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    }
  },
  created() {
    this.getDepartmentsFromAPI();
  },
};
</script>

<style scoped>
.department-management {
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

.department-list ul {
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
