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
        <div class="form-group">
          <label for="location">Lokalizacja</label>
          <input
            type="text"
            id="location"
            v-model="form.location"
            placeholder="Wprowadź lokalizację"
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
            <strong>{{ department.name }}</strong> - {{ department.location }}
            <br />
            <small>{{ department.employees }} pracowników</small>
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
export default {
  data() {
    return {
      departments: [
        { name: 'Wydział Informatyki', location: 'Warszawa', employees: 50 },
        { name: 'Wydział Ekonomii', location: 'Kraków', employees: 30 },
        { name: 'Wydział Mechaniki', location: 'Gdańsk', employees: 40 },
      ],
      form: {
        name: '',
        location: '',
        employees: null,
      },
      editMode: false,
      editIndex: null,
    };
  },
  methods: {
    saveDepartment() {
      if (this.editMode) {
        this.$set(this.departments, this.editIndex, { ...this.form });
      } else {
        this.departments.push({ ...this.form });
      }
      this.resetForm();
    },
    editDepartment(index) {
      this.editIndex = index;
      this.form = { ...this.departments[index] };
      this.editMode = true;
    },
    deleteDepartment(index) {
      this.departments.splice(index, 1);
    },
    cancelEdit() {
      this.resetForm();
    },
    resetForm() {
      this.form = { name: '', location: '', employees: null };
      this.editMode = false;
      this.editIndex = null;
    },
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
