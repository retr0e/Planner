<template>
  <div class="edit-class-container">
    <h1>Edytuj Zajęcia</h1>

    <!-- Wybór kierunku i semestru -->
    <div class="filters">
      <select v-model="selectedDirection" @change="fetchClasses">
        <option value="">Wybierz Kierunek</option>
        <option v-for="direction in directions" :key="direction.direction_id" :value="direction.direction_id">
          {{ direction.direction_name }}
        </option>
      </select>

      <select v-model="selectedSemester" @change="fetchClasses">
        <option value="">Wybierz Semestr</option>
        <option v-for="semester in semesters" :key="semester.semester_id" :value="semester.semester_id">
          Semestr {{ semester.nr_semester }}
        </option>
      </select>
    </div>

    <!-- Wybór zajęć do edycji -->
    <div v-if="classes.length > 0" class="classes-list">
      <select v-model="selectedClassa" class="classa-selection" @change="selectClassa(selectedClassa)">
        <option value="">Wybierz Zajęcia</option>
        <option v-for="classa in classes" :key="classa.class_id" :value="classa.class_id">
          {{ classa.name }} - {{ classa.course_code }} - {{ classa.first_name }} {{ classa.last_name }} - Grupa {{
            classa.group_number }} {{ classa.type_name }}
        </option>
      </select>
      <button v-if="selectedClassa" class="delete-btn" @click="removeClassa">
        Usuń Wybrany Przedmiot
      </button>
    </div>


    <!-- Formularz dodawania terminu -->
    <div v-if="selectedClassaDetails" class="class-form">
      <form @submit.prevent="addSchedule">
        <h2>Dodaj Termin</h2>
        <div class="form-group">
          <label for="start_time">Godzina rozpoczęcia:</label>
          <input type="time" v-model="form.start_time" required />
        </div>
        <div class="form-group">
          <label for="end_time">Godzina zakończenia:</label>
          <input type="time" v-model="form.end_time" required />
        </div>
        <div class="form-group">
          <label for="date">Data:</label>
          <input type="date" v-model="form.date" required />
        </div>
        <div class="form-group">
          <label for="room">Sala:</label>
          <select v-model="form.room_id" required>
            <option value="" disabled>Wybierz salę</option>
            <option v-for="room in rooms" :key="room.room_id" :value="room.room_id">
              {{ room.room_number }} - {{ room.name }}
            </option>
          </select>
        </div>
        <button type="submit" class="save-btn">Dodaj Termin</button>
      </form>
    </div>

    <!-- Lista terminów -->
    <div v-if="schedules.length > 0" class="schedule-list">
      <h2>Terminy</h2>
      <ul>
        <li v-for="(schedule, index) in schedules" :key="index">
          {{ new Date(schedule.date).toLocaleDateString('pl-PL') }} | {{ formatTime(schedule.start_time) }} - {{
            formatTime(schedule.end_time) }} | Sala: {{ schedule.room_number }} {{ schedule.name }}
          <button class="delete-btn" @click="removeSchedule(index)">Usuń</button>
        </li>
      </ul>
    </div>

    <!-- Nowy formularz dodawania zajęć -->
    <div v-if="selectedDirection && selectedSemester" class="add-class-form">
      <h2>Dodaj Nowe Zajęcia</h2>
      <form @submit.prevent="addNewClass">
        <div class="form-group">
          <label for="subject">Przedmiot:</label>
          <select v-model="newClass.subject_id" required>
            <option value="" disabled>Wybierz przedmiot</option>
            <option v-for="subject in subjects" :key="subject.subject_id" :value="subject.subject_id">
              {{ subject.name }} - {{ subject.course_code }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="group">Grupa:</label>
          <select v-model="newClass.group_id" required>
            <option value="" disabled>Wybierz grupę</option>
            <option v-for="group in groups" :key="group.group_id" :value="group.group_id">
              {{ group.type_name }} - {{ group.group_number }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="employee">Prowadzący:</label>
          <select v-model="newClass.employee_id" required>
            <option value="" disabled>Wybierz prowadzącego</option>
            <option v-for="lecturer in employees" :key="lecturer.employee_id" :value="lecturer.employee_id">
              {{ lecturer.first_name }} {{ lecturer.last_name }} - {{ lecturer.position }}
            </option>
          </select>
        </div>

        <button type="submit" class="save-btn">Dodaj Zajęcia</button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      directions: [],
      semesters: [],
      classes: [],
      employees: [],
      classTypes: [],
      groups: [],
      schedules: [],
      rooms: [],
      subjects: [],
      selectedDirection: "",
      selectedSemester: "",
      selectedClassa: "",
      selectedClassaDetails: null,
      form: {
        start_time: "",
        end_time: "",
        date: "",
        room_id: null,
      },
      newClass: {
        group_id: null,
        employee_id: null,
        subject_id: null,
      },
    };
  },
  created() {
    this.fetchDirections();
    this.fetchSemesters();
    this.fetchLecturers();
    this.fetchGroups();
    this.getGroupTypesFromAPI();
    this.getRoomsFromAPI();
    this.getSubjectsFromAPI();
  },
  methods: {
    async fetchDirections() {
      this.getDirectionsFromAPI();
    },
    async fetchSemesters() {
      this.getSemestersFromAPI();
    },
    async fetchClasses() {
      if (this.selectedDirection && this.selectedSemester) {
        this.getClassesFromAPI();
      }
    },
    async fetchLecturers() {
      this.getEmployeesFromAPI();
    },
    selectClassa(class_id) {
      this.selectedClassa = class_id;
      this.selectedClassaDetails = this.classes.find(
        (classa) => classa.class_id === class_id
      );

      if (this.selectedClassa) {
        this.getClassesDatesFromAPI();
      }
    },
    async fetchGroups() {
      this.getGroupsFromAPI();
    },
    addSchedule() {
      axios.post('https://localhost/classes/add-date', {
        key: localStorage.getItem('authToken'),
        class_id: this.selectedClassa,
        start_time: this.timeToISOString(this.form.start_time),
        end_time: this.timeToISOString(this.form.end_time),
        room_id: this.form.room_id,
        date: this.form.date,
      })
        .then((response) => {
          this.$toast.success('Termin dodany pomyślnie');
          this.getClassesDatesFromAPI();
          this.resetForm();
        })
        .catch((error) => {
          console.error('Błąd dodawania terminu:', error);
          this.displayError(error.response.data.reason);
        });
    },
    removeSchedule(index) {
      axios.post('https://localhost/classes/delete-date', {
        key: localStorage.getItem('authToken'),
        id: this.schedules[index].class_date_id,
      })
        .then((response) => {
          this.$toast.success('Termin usunięty pomyślnie');
          this.getClassesDatesFromAPI();
        })
        .catch((error) => {
          console.error('Błąd usuwania terminu:', error);
          this.displayError(error.response.data.reason);
        });
    },
    addNewClass() {
      axios.post('https://localhost/classes/add', {
        key: localStorage.getItem('authToken'),
        direction_id: this.selectedDirection,
        semester_id: this.selectedSemester,
        
        group_id: this.newClass.group_id,
        employee_id: this.newClass.employee_id,
        subject_id: this.newClass.subject_id,
      })
        .then((response) => {
          this.$toast.success('Zajęcia dodane pomyślnie');
          this.getClassesFromAPI();
        })
        .catch((error) => {
          console.error('Błąd dodawania zajęć:', error);
          this.displayError(error.response.data.reason);
        });
    },
    removeClassa() {
      const classaIndex = this.classes.findIndex(
        (classa) => classa.class_id === this.selectedClassa
      );
      if (classaIndex !== -1) {
        axios.post('https://localhost/classes/delete', {
          key: localStorage.getItem('authToken'),
          id: this.selectedClassa,
        })
          .then((response) => {
            this.$toast.success('Zajęcia usunięte pomyślnie');
            this.getClassesFromAPI();
          })
          .catch((error) => {
            console.error('Błąd usuwania zajęć:', error);
            this.displayError(error.response.data.reason);
          });
      }
    },
    resetForm() {
      this.form = {
        start_time: "",
        end_time: "",
        date: "",
        room_id: null,
      };
    },
    formatTime(dateString) {
      const date = new Date(dateString);
      return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    },
    timeToISOString(time) {
      const [hours, minutes] = time.split(':').map(Number);

      const date = new Date();
      date.setHours(hours, minutes, 0, 0);

      return date.toISOString();
    },
    displayError(error) {
      this.$toast.error(error);
    },
    getDirectionsFromAPI() {
      axios.post('https://localhost/directions/get-all', {
        key: localStorage.getItem('authToken'),
      })
        .then((response) => {
          this.directions = response.data.directions;
        })
        .catch((error) => {
          console.error('Błąd pobierania danych:', error);
          this.displayError(error.response.data.reason);
        });
    },
    getSemestersFromAPI() {
      axios.post('https://localhost/semesters/get-all', {
        key: localStorage.getItem('authToken'),
      })
        .then((response) => {
          this.semesters = response.data.semesters;
        })
        .catch((error) => {
          console.error('Błąd pobierania danych:', error);
          this.displayError(error.response.data.reason);
        });
    },
    getEmployeesFromAPI() {
      axios.post('https://localhost/employees/get-all', {
        key: localStorage.getItem('authToken'),
      })
        .then((response) => {
          this.employees = response.data.employees;
        })
        .catch((error) => {
          console.error('Błąd pobierania danych:', error);
          this.displayError(error.response.data.reason);
        });
    },
    getGroupsFromAPI() {
      axios.post('https://localhost/groups/get-all', {
        key: localStorage.getItem('authToken'),
      })
        .then((response) => {
          this.groups = response.data.groups;
        })
        .catch((error) => {
          console.error('Błąd pobierania danych:', error);
          this.displayError(error.response.data.reason);
        });
    },
    getGroupTypesFromAPI() {
      axios.post('https://localhost/groups-types/get-all', {
        key: localStorage.getItem('authToken'),
      })
        .then((response) => {
          this.classTypes = response.data.groups_types;
        })
        .catch((error) => {
          console.error('Błąd pobierania danych:', error);
          this.displayError(error.response.data.reason);
        });
    },
    getClassesFromAPI() {
      axios.post('https://localhost/classes/get-by-dir-and-sem', {
        key: localStorage.getItem('authToken'),
        direction_id: this.selectedDirection,
        semester_id: this.selectedSemester,
      })
        .then((response) => {
          this.classes = response.data.classes;
        })
        .catch((error) => {
          console.error('Błąd pobierania danych:', error);
          this.displayError(error.response.data.reason);
        });
    },
    getRoomsFromAPI() {
      axios.post('https://localhost/rooms/get-all', {
        key: localStorage.getItem('authToken'),
      })
        .then((response) => {
          this.rooms = response.data.rooms;
        })
        .catch((error) => {
          console.error('Błąd pobierania danych:', error);
          this.displayError(error.response.data.reason);
        });
    },
    getClassesDatesFromAPI() {
      axios.post('https://localhost/classes/get-by-class', {
        key: localStorage.getItem('authToken'),
        class_id: this.selectedClassa,
      })
        .then((response) => {
          this.schedules = response.data.classes;
        })
        .catch((error) => {
          console.error('Błąd pobierania danych:', error);
          this.displayError(error.response.data.reason);
        });
    },
    getSubjectsFromAPI() {
      axios.post('https://localhost/subjects/get-all', {
        key: localStorage.getItem('authToken'),
      })
        .then((response) => {
          this.subjects = response.data.subjects;
        })
        .catch((error) => {
          console.error('Błąd pobierania danych:', error);
          this.displayError(error.response.data.reason);
        });
    },
  },
  watch: {
    selectedClassa(newClassaCode) {
      if (newClassaCode) {
        this.selectClassa(newClassaCode);
      }
    },
  },
};
</script>

<style scoped>
.edit-class-container {
  font-family: Arial, Helvetica, sans-serif;
  max-width: 900px;
  margin: 2rem auto;
  padding: 2rem;
  background: #ffffff;
  border-radius: 15px;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.header {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  text-align: center;
  margin-bottom: 2.5rem;
  text-transform: uppercase;
}

.filters {
  display: flex;
  gap: 1.5rem;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.filter {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

select {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  background-color: #f7f7f7;
  color: #333;
  transition: all 0.3s ease;
}

select:focus {
  outline: none;
  border-color: #007bff;
  background-color: #ffffff;
}

.classa-selection {
  margin-bottom: 2rem;
}

.class-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 20px;
  background-color: #f0f8ff; /* Dodano tło */
  border: 2px solid #007bff; /* Dodano ramkę */
  padding: 1rem; /* Dodano padding */
  border-radius: 8px; /* Dodano zaokrąglenie rogów */
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin-bottom: 1.5rem;
}

.form-group label {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.6rem;
}

.form-group input,
.form-group select {
  padding: 1rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f7f7f7;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #007bff;
  background-color: #ffffff;
}

.form-group input::placeholder,
.form-group select option {
  color: #888;
}

.form-group input:disabled,
.form-group select:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}


input {
  padding: 1rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f7f7f7;
  color: #333;
  transition: all 0.3s ease;
}

input:focus {
  outline: none;
  border-color: #007bff;
  background-color: #ffffff;
}

button.save-btn {
  background-color: #007bff;
  margin-top: 20px;
  color: white;
  padding: 1rem;
  font-size: 1.2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.3s ease;
}

button.save-btn:hover {
  background-color: #0056b3;
  transform: scale(1.05);
}

button.save-btn:active {
  transform: scale(1);
}

button.save-btn:focus {
  outline: none;
  box-shadow: 0 0 10px rgba(0, 123, 255, 0.5);
}

button.delete-btn {
  background-color: #dc3545;
  color: white;
  padding: 0.8rem;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 10px;
  transition: background 0.3s ease, transform 0.3s ease;
}

button.delete-btn:hover {
  background-color: #c82333;
  transform: scale(1.05);
}

button.delete-btn:active {
  transform: scale(1);
}

button.delete-btn:focus {
  outline: none;
  box-shadow: 0 0 10px rgba(220, 53, 69, 0.5);
}

.schedule-list ul {
  list-style-type: none;
  padding: 0;
}

.schedule-list li {
  background-color: #f9f9f9; /* Dodano tło */
  border: 1px solid #ddd; /* Dodano ramkę */
  border-radius: 8px; /* Dodano zaokrąglenie rogów */
  padding: 1rem; /* Dodano padding */
  margin-bottom: 1rem; /* Dodano margines dolny */
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.schedule-list li button.delete-btn {
  margin-left: 1rem;
}
</style>