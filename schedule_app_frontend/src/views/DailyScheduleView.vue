<template>
    <div class="daily-schedule">
      <h1>Zajęcia na dziś</h1>
  
      <!-- Lista zajęć -->
      <div class="schedule-list">
        <ul>
          <li v-for="(classItem, index) in classes" :key="index" class="class-item">
            <div>
              <strong>{{ classItem.name }}</strong>
              <p>{{ classItem.time }} - {{ classItem.location }}</p>
            </div>
            <div class="actions">
              <button class="btn btn-edit" @click="editClass(index)">Edytuj</button>
              <button class="btn btn-delete" @click="deleteClass(index)">Odwołaj</button>
            </div>
          </li>
        </ul>
      </div>
  
      <!-- Formularz edycji zajęć -->
      <div class="form-card" v-if="editMode">
        <h2>Edytuj Zajęcia</h2>
        <form @submit.prevent="saveClass">
          <div class="form-group">
            <label for="name">Nazwa zajęć</label>
            <input type="text" id="name" v-model="form.name" placeholder="Wprowadź nazwę" required />
          </div>
          <div class="form-group">
            <label for="time">Godzina</label>
            <input type="time" id="time" v-model="form.time" required />
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
            <button type="submit" class="btn btn-primary">Zapisz</button>
            <button type="button" class="btn btn-secondary" @click="cancelEdit">Anuluj</button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        // Przykładowe dane zajęć
        classes: [
          { name: 'Matematyka', time: '08:00', location: 'Sala 101' },
          { name: 'Fizyka', time: '10:00', location: 'Sala 202' },
          { name: 'Informatyka', time: '12:00', location: 'Laboratorium 3' },
        ],
        // Dane formularza
        form: {
          name: '',
          time: '',
          location: '',
        },
        editMode: false,
        editIndex: null,
      };
    },
    methods: {
      // Edytuj zajęcia
      editClass(index) {
        this.editIndex = index;
        this.form = { ...this.classes[index] };
        this.editMode = true;
      },
      // Zapisz zmiany
      saveClass() {
        if (this.editMode) {
          this.$set(this.classes, this.editIndex, { ...this.form });
          this.resetForm();
        }
      },
      // Usuń zajęcia
      deleteClass(index) {
        this.classes.splice(index, 1);
      },
      // Anuluj edycję
      cancelEdit() {
        this.resetForm();
      },
      // Resetowanie formularza
      resetForm() {
        this.form = { name: '', time: '', location: '' };
        this.editMode = false;
        this.editIndex = null;
      },
    },
  };
  </script>
  
  <style scoped>
  .daily-schedule {
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
  
  .schedule-list ul {
    list-style: none;
    padding: 0;
  }
  
  .class-item {
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
  
  .form-card {
    background: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1.5rem;
    margin-top: 2rem;
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
  </style>
  