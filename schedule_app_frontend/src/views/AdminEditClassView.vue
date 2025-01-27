<template>
  <div class="edit-class-container">
    <h1>Edytuj Zajęcia</h1>

    <!-- Wybór kierunku i semestru -->
    <div class="filters">
      <select v-model="selectedDirection" @change="fetchSubjects">
        <option value="">Wybierz Kierunek</option>
        <option v-for="direction in directions" :key="direction.direction_id" :value="direction.direction_name">
          {{ direction.direction_name }}
        </option>
      </select>

      <select v-model="selectedSemester" @change="fetchSubjects">
        <option value="">Wybierz Semestr</option>
        <option v-for="semester in semesters" :key="semester.semester_id" :value="semester.nr_semester">
          Semestr {{ semester.nr_semester }}
        </option>
      </select>
    </div>

    <!-- Wybór przedmiotu do edycji -->
    <div v-if="subjects.length > 0" class="subjects-list">
  <select v-model="selectedSubject">
    <option value="">Wybierz Przedmiot</option>
    <option v-for="subject in subjects" :key="subject.subject_id" :value="subject.subject_code">
      {{ subject.name }} - {{ subject.subject_code }}
    </option>
  </select>
  <button 
    v-if="selectedSubject" 
    class="delete-btn" 
    @click="removeSubject"
  >
    Usuń Wybrany Przedmiot
  </button>
</div>


    <!-- Formularz dodawania terminu -->
    <div v-if="selectedSubjectDetails" class="class-form">
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
          <label for="room">Sala:</label>
          <input type="text" v-model="form.room" required />
        </div>
        <button type="submit" class="save-btn">Dodaj Termin</button>
      </form>
    </div>

    <!-- Lista terminów -->
    <div v-if="schedules.length > 0" class="schedule-list">
      <h2>Terminy</h2>
      <ul>
        <li v-for="(schedule, index) in schedules" :key="index">
          {{ schedule.start_time }} - {{ schedule.end_time }} | Sala: {{ schedule.room }}
          <button class="delete-btn" @click="removeSchedule(index)">Usuń</button>
        </li>
      </ul>
    </div>

    <!-- Nowy formularz dodawania zajęć -->
    <div v-if="selectedDirection && selectedSemester" class="add-class-form">
      <h2>Dodaj Nowe Zajęcia</h2>
      <form @submit.prevent="addNewClass">
        <div class="form-group">
          <label for="newSubject">Przedmiot:</label>
          <select v-model="newClass.subject" required>
            <option value="" disabled>Wybierz przedmiot</option>
            <option v-for="subject in subjects" :key="subject.subject_id" :value="subject.subject_code">
              {{ subject.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="lecturer">Wykładowca:</label>
          <select v-model="newClass.lecturer" required>
            <option value="" disabled>Wybierz wykładowcę</option>
            <option v-for="lecturer in lecturers" :key="lecturer.lecturer_id" :value="lecturer.name">
              {{ lecturer.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="classType">Typ Zajęć:</label>
          <select v-model="newClass.type" required>
            <option value="" disabled>Wybierz typ zajęć</option>
            <option v-for="type in classTypes" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="group">Grupa:</label>
          <select v-model="newClass.group" required>
            <option value="" disabled>Wybierz grupę</option>
            <option v-for="group in groups" :key="group.group_id" :value="group.name">
              {{ group.name }}
            </option>
          </select>
        </div>

        <button type="submit" class="save-btn">Dodaj Zajęcia</button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      directions: [],
      semesters: [],
      subjects: [],
      lecturers: [],
      classTypes: ["Wykład", "Ćwiczenia", "Laboratorium"],
      groups: [],
      schedules: [],
      selectedDirection: "",
      selectedSemester: "",
      selectedSubject: "",
      selectedSubjectDetails: null,
      form: {
        start_time: "",
        end_time: "",
        room: "",
      },
      newClass: {
        subject: "",
        lecturer: "",
        type: "",
        group: "",
      },
    };
  },
  created() {
    this.fetchDirections();
    this.fetchSemesters();
    this.fetchLecturers();
    this.fetchGroups();
  },
  methods: {
    async fetchDirections() {
      this.directions = [
        { direction_id: 1, direction_name: "Automatyka" },
        { direction_id: 2, direction_name: "Informatyka" },
        { direction_id: 3, direction_name: "Mechanika" },
      ];
    },
    async fetchSemesters() {
      this.semesters = [
        { semester_id: 1, nr_semester: 1 },
        { semester_id: 2, nr_semester: 2 },
        { semester_id: 3, nr_semester: 3 },
      ];
    },
    async fetchSubjects() {
      if (this.selectedDirection && this.selectedSemester) {
        this.subjects = [
          { subject_id: 1, subject_code: "CS102", name: "Programowanie" },
          { subject_id: 2, subject_code: "MATH202", name: "Matematyka" },
        ];
      }
    },
    async fetchLecturers() {
      this.lecturers = [
        { lecturer_id: 1, name: "Dr. Jan Kowalski" },
        { lecturer_id: 2, name: "Prof. Anna Nowak" },
      ];
    },
    selectSubject(subjectCode) {
      this.selectedSubject = subjectCode;
      this.selectedSubjectDetails = this.subjects.find(
        (subject) => subject.subject_code === subjectCode
      );

      // Przykładowe terminy dla przedmiotu
      this.schedules = [
        { start_time: "08:00", end_time: "09:30", room: "C303" },
        { start_time: "10:00", end_time: "11:30", room: "A101" },
      ];
    },
    async fetchGroups() {
      this.groups = [
        { group_id: 1, name: "Grupa 1" },
        { group_id: 2, name: "Grupa 2" },
      ];
    },
    addSchedule() {
      this.schedules.push({ ...this.form });
      this.form.start_time = "";
      this.form.end_time = "";
      this.form.room = "";
    },
    removeSchedule(index) {
      this.schedules.splice(index, 1);
    },
    addNewClass() {
      console.log("Nowe zajęcia dodane:", this.newClass);
      this.newClass = { subject: "", lecturer: "", type: "", group: "" };
    },
    removeSubject() {
  const subjectIndex = this.subjects.findIndex(
    (subject) => subject.subject_code === this.selectedSubject
  );
  if (subjectIndex !== -1) {
    this.subjects.splice(subjectIndex, 1);
    this.selectedSubject = "";
    this.selectedSubjectDetails = null;
  }
},

  },
  watch: {
    selectedSubject(newSubjectCode) {
      if (newSubjectCode) {
        this.selectSubject(newSubjectCode);
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

.subject-selection {
margin-bottom: 2rem;
}

.class-form {
display: flex;
flex-direction: column;
gap: 1.5rem;
margin-top: 20px;
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

.form-group input, .form-group select {
padding: 1rem;
font-size: 1rem;
border: 1px solid #ddd;
border-radius: 8px;
background-color: #f7f7f7;
transition: all 0.3s ease;
}

.form-group input:focus, .form-group select:focus {
outline: none;
border-color: #007bff;
background-color: #ffffff;
}

.form-group input::placeholder, .form-group select option {
color: #888; 
}

.form-group input:disabled, .form-group select:disabled {
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


</style>