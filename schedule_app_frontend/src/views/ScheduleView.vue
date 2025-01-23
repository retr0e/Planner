<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="schedule">
    <h1>Plan zajęć</h1>
    <div class="filters">
      <label for="direction">Kierunek:</label>
      <select
        v-model="selectedDirection"
        id="direction"
        @change="updateAvailableSemesters"
      >
        <option
          v-for="direction in availableDirections"
          :key="direction"
          :value="direction"
        >
          {{ direction }}
        </option>
      </select>

      <label for="semester">Semestr:</label>
      <select v-model="selectedSemester" id="semester">
        <option
          v-for="semester in availableSemesters"
          :key="semester"
          :value="semester"
        >
          {{ semester }}
        </option>
      </select>

      <label for="date">Data:</label>
      <select v-model="selectedDate" id="date">
        <option v-for="date in availableDates" :key="date" :value="date">
          {{ new Date(date).toLocaleDateString() }}
        </option>
      </select>

      <button @click="filterSchedule">Odśwież</button>
    </div>

    <div v-if="filteredSchedule.length > 0">
      <h2>
        Plan zajęć dla semestru {{ selectedSemester }} ({{
          selectedDirection
        }}), {{ new Date(selectedDate).toLocaleDateString() }}
      </h2>
      <ul>
        <li
          v-for="classItem in filteredSchedule"
          :key="classItem.id"
          :class="classItem.type.toLowerCase()"
        >
          <div class="schedule-header">
            <strong>{{ classItem.subject_name }}</strong>
            <span class="subject-code">Kod: {{ classItem.subject_code }}</span>
          </div>
          <div class="schedule-details">
            <p>Typ: {{ classItem.type }}</p>
            <p>
              Godziny: {{ formatTime(classItem.start_time) }} - {{ formatTime(classItem.end_time) }}
            </p>
            <p>Sala: {{ classItem.room }}</p>
            <p>Wykładowca: {{ classItem.instructor }}</p>
            <p>Semestr: {{ classItem.semester }}</p>
            <p>Kierunek: {{ classItem.direction }}</p>
          </div>
        </li>
      </ul>
    </div>
    <p v-else>Nie znaleziono zajęć dla wybranych filtrów.</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      fullSchedule: [
        {
          id: 1,
          subject_name: 'Matematyka',
          subject_code: 'MATH101',
          type: 'Wykład',
          date: '2025-01-15',
          start_time: '08:00',
          end_time: '09:30',
          room: 'A101',
          instructor: 'Dr. Kowalski',
          semester: 1,
          direction: 'Informatyka',
        },
        {
          id: 2,
          subject_name: 'Fizyka', 
          subject_code: 'PHYS201',
          type: 'Ćwiczenia',
          date: '2025-01-15',
          start_time: '10:00',
          end_time: '11:30',
          room: 'B202',
          instructor: 'Prof. Nowak',
          semester: 1,
          direction: 'Informatyka',
        },
        {
          id: 3,
          subject_name: 'Programowanie',
          subject_code: 'CS102',
          type: 'Wykład',
          date: '2025-01-16',
          start_time: '08:00',
          end_time: '09:30',
          room: 'C303',
          instructor: 'Dr. Wiśniewski',
          semester: 3,
          direction: 'Automatyka',
        }
      ],
      availableSemesters: [],
      availableDirections: [],
      availableDates: [],
      selectedSemester: null,
      selectedDirection: null,
      selectedDate: null,
      filteredSchedule: [],
    };
  },
  methods: {
    initializeFilters() {
      this.availableDirections = [
        ...new Set(this.fullSchedule.map((item) => item.direction)),
      ];
      this.selectedDirection = this.availableDirections[0];
      this.updateAvailableSemesters();
    },
    updateAvailableSemesters() {
      this.availableSemesters = [
        ...new Set(
          this.fullSchedule
            .filter((item) => item.direction === this.selectedDirection)
            .map((item) => item.semester)
        ),
      ].sort((a, b) => a - b);
      this.selectedSemester = this.availableSemesters[0];
      this.updateAvailableDates();
    },
    updateAvailableDates() {
      this.availableDates = [
        ...new Set(
          this.fullSchedule
            .filter(
              (item) =>
                item.direction === this.selectedDirection &&
                item.semester === this.selectedSemester
            )
            .map((item) => item.date)
        ),
      ].sort();
      this.selectedDate = this.availableDates[0];
      this.filterSchedule();
    },
    filterSchedule() {
      this.filteredSchedule = this.fullSchedule.filter(
        (item) =>
          item.semester === this.selectedSemester &&
          item.direction === this.selectedDirection &&
          item.date === this.selectedDate
      );
    },
    formatTime(dateString) {
      const date = new Date(dateString); 
      return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    },
    getScheduleFromAPI() {
      axios
        .get('https://localhost/plan')
        .then((response) => {
          this.fullSchedule = response.data;
          this.initializeFilters();
        })
        .catch((error) => {
          console.error('There was an error while downloading schedule!', error);
        });
    },
  },
  mounted() {
    this.getScheduleFromAPI();
  },
};
</script>

<style scoped>
.schedule {
  font-family: Arial, sans-serif;
  margin: 20px;
}

.filters {
  margin-bottom: 20px;
}

.filters label {
  margin-right: 10px;
  font-weight: bold;
}

.filters select {
  margin-right: 20px;
  padding: 5px;
}

.filters button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 15px;
  cursor: pointer;
  border-radius: 5px;
}

.filters button:hover {
  background-color: #0056b3;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  background-color: #f9f9f9;
  margin: 5px 0;
  padding: 10px;
  border-left: 5px solid #007bff;
  border-radius: 3px;
}

li.wykład {
  border-left-color: #007bff;
}

li.ćwiczenia {
  border-left-color: #28a745;
}

li.laboratorium {
  border-left-color: #ffc107;
}

li.projekt {
  border-left-color: #17a2b8;
}

.schedule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.subject-code {
  font-size: 12px;
  color: #777;
}

.schedule-details p {
  margin: 5px 0;
}

p {
  font-style: italic;
}
</style>
