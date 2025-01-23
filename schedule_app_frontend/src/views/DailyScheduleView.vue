<template>
  <div class="daily-schedule">
    <h1>Zajęcia na dziś</h1>

    <!-- Lista zajęć -->
    <div class="schedule-list">
      <ul>
        <li v-for="(classItem, index) in classes" :key="index" class="class-item">
          <div>
            <strong>{{ classItem.name }}</strong> {{ classItem.room_number }}
            <p>{{ formatTime(classItem.start_time) }} - {{ formatTime(classItem.end_time) }}</p>
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
          <label for="start_time">Godzina rozpoczęcia</label>
          <input type="time" id="start_time" v-model="form.start_time" required />
        </div>
        <div class="form-group">
          <label for="end_time">Godzina zakończenia</label>
          <input type="time" id="end_time" v-model="form.end_time" required />
        </div>
        <div class="form-group">
          <label for="room_number">Pokój</label>
          <select id="room_number" v-model="form.room_number" required>
            <option v-for="room in rooms" :key="room.room_id" :value="room.room_id">{{ room.room_number }}</option>
          </select>
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
import axios from 'axios';

export default {
  data() {
    return {
      // Przykładowe dane zajęć
      classes: [
        
      ],
      rooms: [],
      // Dane formularza
      form: {
        name: '',
        start_time: '',
        end_time: '',
        room_number: null,
        direction_id: null,
        employee_id: null,
        semester_id: null,
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
        axios.post('https://localhost/classes/update',
          {
            key: localStorage.getItem('authToken'),
            id: this.classes[this.editIndex].class_id,
            name: this.form.name,
            start_time: this.form.start_time,
            end_time: this.form.end_time,
            room_number: this.form.room_number,
            // direction_id: this.form.direction_id,
            // employee_id: this.form.employee_id,
            // semester_id: this.form.semester_id,
          }
        )
          .then((response) => {
            this.$toast.success('Zajęcia zostały zaktualizowane!');
            this.getClassesFromAPI();
          })
          .catch((error) => {
            console.error(error);
            this.displayError(error.response.data.reason);
          });
      }
      else {
        axios.post('https://localhost/classes/add',
          {
            key: localStorage.getItem('authToken'),
            name: this.form.name,
            start_time: this.form.start_time,
            end_time: this.form.end_time,
            room_number: this.form.room_number,
            // direction_id: this.form.direction_id,
            // employee_id: this.form.employee_id,
            // semester_id: this.form.semester_id,
          }
        )
          .then((response) => {
            this.$toast.success('Zajęcia zostały dodane!');
            this.getClassesFromAPI();
          })
          .catch((error) => {
            console.error(error);
            this.displayError(error.response.data.reason);
          });
      }
      this.resetForm();
    },
    // Usuń zajęcia
    deleteClass(index) {
      axios.post('https://localhost/classes/delete',
        {
          key: localStorage.getItem('authToken'),
          id: this.classes[index].class_id,
        })
        .then((response) => {
          this.$toast.success('Zajęcia zostały odwołane!');
          this.getClassesFromAPI();
        })
        .catch((error) => {
          console.error(error);
          this.displayError(error.response.data.reason);
        });
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
    formatTime(dateString) {
      const date = new Date(dateString);
      return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    },
    displayError(message) {
      this.$toast.error(message);
    },
    getClassesFromAPI() {
      axios.post('https://localhost/classes/get-all',
        {
          key: localStorage.getItem('authToken'),
        }
      )
        .then((response) => {
          this.classes = response.data.classes;
        })
        .catch((error) => {
          console.error(error);
        });
    },
    getRoomsFromAPI() {
      axios.post('https://localhost/rooms/get-all',
        {
          key: localStorage.getItem('authToken'),
        }
      )
        .then((response) => {
          this.rooms = response.data.rooms;
        })
        .catch((error) => {
          console.error(error);
        });
    },
  },
  created() {
    this.getClassesFromAPI();
    this.getRoomsFromAPI();
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
  
