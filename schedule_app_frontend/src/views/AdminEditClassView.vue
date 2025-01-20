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
      </div>
  
      <!-- Formularz edycji zajęć -->
      <div v-if="selectedSubjectDetails" class="class-form">
        <form @submit.prevent="saveClass">
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
          <div class="form-group">
            <label for="instructor">Wykładowca:</label>
            <input type="text" v-model="form.instructor" required />
          </div>
          <button type="submit" class="save-btn">Zapisz</button>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        directions: [], // Lista kierunków
        semesters: [], // Lista semestrów
        subjects: [], // Lista przedmiotów
        selectedDirection: "", // Wybrany kierunek
        selectedSemester: "", // Wybrany semestr
        selectedSubject: "", // Wybrany przedmiot
        selectedSubjectDetails: null, // Szczegóły wybranego przedmiotu
        form: {
          start_time: "",
          end_time: "",
          room: "",
          instructor: "",
        },
      };
    },
    created() {
      this.fetchDirections(); // Pobierz kierunki przy załadowaniu widoku
      this.fetchSemesters(); // Pobierz semestry przy załadowaniu widoku
    },
    methods: {
      async fetchDirections() {
        // Przykładowa lista kierunków (symulacja pobierania danych z bazy)
        this.directions = [
          { direction_id: 1, direction_name: "Automatyka" },
          { direction_id: 2, direction_name: "Informatyka" },
          { direction_id: 3, direction_name: "Mechanika" },
        ];
      },
      async fetchSemesters() {
        // Przykładowa lista semestrów (symulacja pobierania danych z bazy)
        this.semesters = [
          { semester_id: 1, nr_semester: 1 },
          { semester_id: 2, nr_semester: 2 },
          { semester_id: 3, nr_semester: 3 },
        ];
      },
      async fetchSubjects() {
        // Pobierz przedmioty w zależności od wybranego kierunku i semestru
        if (this.selectedDirection && this.selectedSemester) {
          // Przykładowa lista przedmiotów
          this.subjects = [
            { subject_id: 1, subject_code: "CS102", name: "Programowanie", semester: 3, direction: "Automatyka" },
            { subject_id: 2, subject_code: "MATH202", name: "Matematyka", semester: 3, direction: "Automatyka" },
          ];
        }
      },
      selectSubject(subjectCode) {
        this.selectedSubject = subjectCode;
        this.selectedSubjectDetails = this.subjects.find(
          (subject) => subject.subject_code === subjectCode
        );
        this.form.start_time = "08:00";
        this.form.end_time = "09:30";
        this.form.room = "C303";
        this.form.instructor = "Dr. Wiśniewski";
      },
      saveClass() {
        // Zapisz zmodyfikowane zajęcia
        const updatedSubject = { ...this.selectedSubjectDetails, ...this.form };
        console.log("Zapisane zajęcia: ", updatedSubject);
        alert("Zajęcia zostały zapisane!");
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

  </style>
  