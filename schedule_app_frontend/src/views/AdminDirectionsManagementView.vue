<template>
  <div class="direction-and-specialization-management">
    <!-- Zarządzanie Kierunkami -->
    <div class="direction-management">
      <header>
        <h1>Zarządzanie Kierunkami</h1>
        <button class="add-button" @click="openDirectionModal">Dodaj Kierunek</button>
      </header>
      <table class="direction-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nazwa Kierunku</th>
            <th>Akcje</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="direction in directions" :key="direction.direction_id">
            <td>{{ direction.direction_id }}</td>
            <td>{{ direction.direction_name }}</td>
            <td>
              <button class="edit-button" @click="editDirection(direction)">Edytuj</button>
              <button class="delete-button" @click="deleteDirection(direction.direction_id)">Usuń</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal do Zarządzania Kierunkami -->
    <div v-if="showDirectionModal" class="modal">
      <div class="modal-content">
        <h2>{{ isEditingDirection ? 'Edytuj Kierunek' : 'Dodaj Kierunek' }}</h2>
        <form @submit.prevent="handleDirectionSubmit">
          <div class="form-group">
            <label for="direction_name">Nazwa Kierunku:</label>
            <input type="text" v-model="directionForm.direction_name" required />
          </div>
          <div class="form-actions">
            <button type="submit" class="save-button">Zapisz</button>
            <button type="button" class="cancel-button" @click="closeDirectionModal">Anuluj</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Zarządzanie Specjalizacjami -->
    <div class="specialization-management">
      <header>
        <h1>Zarządzanie Specjalizacjami</h1>
        <button class="add-button" @click="openSpecializationModal">Dodaj Specjalizację</button>
      </header>
      <table class="specialization-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Kierunek</th>
            <th>Nazwa Specjalizacji</th>
            <th>Akcje</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="specialization in specializations" :key="specialization.direction_specialization_id">
            <td>{{ specialization.direction_specialization_id }}</td>
            <td>{{ getDirectionName(specialization.direction_id) }}</td>
            <td>{{ specialization.specialization_name }}</td>
            <td>
              <button class="edit-button" @click="editSpecialization(specialization)">Edytuj</button>
              <button class="delete-button"
                @click="deleteSpecialization(specialization.direction_specialization_id)">Usuń</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal do Zarządzania Specjalizacjami -->
    <div v-if="showSpecializationModal" class="modal">
      <div class="modal-content">
        <h2>{{ isEditingSpecialization ? 'Edytuj Specjalizację' : 'Dodaj Specjalizację' }}</h2>
        <form @submit.prevent="handleSpecializationSubmit">
          <div class="form-group">
            <label for="direction_id">Kierunek:</label>
            <select v-model="specializationForm.direction_id" required>
              <option v-for="direction in directions" :key="direction.direction_id" :value="direction.direction_id">
                {{ direction.direction_name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="specialization_name">Nazwa Specjalizacji:</label>
            <input type="text" v-model="specializationForm.specialization_name" required />
          </div>
          <div class="form-actions">
            <button type="submit" class="save-button">Zapisz</button>
            <button type="button" class="cancel-button" @click="closeSpecializationModal">Anuluj</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      // Kierunki
      directions: [
        { direction_id: 1, direction_name: "Informatyka" },
        { direction_id: 2, direction_name: "Automatyka i Robotyka" },
      ],
      showDirectionModal: false,
      isEditingDirection: false,
      directionForm: {
        direction_id: null,
        direction_name: "",
      },

      // Specjalizacje
      specializations: [
        { direction_specialization_id: 1, direction_id: 1, specialization_name: "Sztuczna Inteligencja" },
        { direction_specialization_id: 2, direction_id: 2, specialization_name: "Systemy Sterowania" },
      ],
      showSpecializationModal: false,
      isEditingSpecialization: false,
      specializationForm: {
        direction_specialization_id: null,
        direction_id: null,
        specialization_name: "",
      },
    };
  },
  methods: {
    // Kierunki
    openDirectionModal() {
      this.isEditingDirection = false;
      this.directionForm = { direction_id: null, direction_name: "" };
      this.showDirectionModal = true;
    },
    editDirection(direction) {
      this.isEditingDirection = true;
      this.directionForm = { ...direction };
      this.showDirectionModal = true;
    },
    deleteDirection(id) {
      axios.post('https://localhost/directions/delete', {
        key: localStorage.getItem('authToken'),
        id: id,
      })
        .then((response) => {
          this.$toast.success('Kierunek został usunięty pomyślnie.');
          this.getDirectionsFromAPI();
        })
        .catch((error) => {
          console.error('Błąd usuwania danych:', error);
          this.displayError(error.response.data.reason);
        });
    },
    handleDirectionSubmit() {
      if (this.isEditingDirection) {
        axios.post('https://localhost/directions/update', {
          key: localStorage.getItem('authToken'),
          id: this.directionForm.direction_id,
          direction_name: this.directionForm.direction_name,
        })
          .then((response) => {
            this.$toast.success('Kierunek został zaktualizowany pomyślnie.');
            this.getDirectionsFromAPI();
            this.resetDirectionForm();
          })
          .catch((error) => {
            console.error('Błąd zapisu danych:', error);
            this.displayError(error.response.data.reason);
          });
      } else {
        axios.post('https://localhost/directions/add', {
          key: localStorage.getItem('authToken'),
          direction_name: this.directionForm.direction_name,
        })
          .then((response) => {
            this.$toast.success('Kierunek został dodany pomyślnie.');
            this.getDirectionsFromAPI();
            this.resetDirectionForm();
          })
          .catch((error) => {
            console.error('Błąd zapisu danych:', error);
            this.displayError(error.response.data.reason);
          });
      }
      this.closeDirectionModal();
    },
    closeDirectionModal() {
      this.showDirectionModal = false;
    },

    // Specjalizacje
    openSpecializationModal() {
      this.isEditingSpecialization = false;
      this.specializationForm = { direction_specialization_id: null, direction_id: null, specialization_name: "" };
      this.showSpecializationModal = true;
    },
    editSpecialization(specialization) {
      this.isEditingSpecialization = true;
      this.specializationForm = { ...specialization };
      this.showSpecializationModal = true;
    },
    deleteSpecialization(id) {
      axios.post('https://localhost/specializations/delete', {
        key: localStorage.getItem('authToken'),
        id: id,
      })
        .then((response) => {
          this.$toast.success('Specjalizacja została usunięta pomyślnie.');
          this.getSpecialozationsFromAPI();
        })
        .catch((error) => {
          console.error('Błąd usuwania danych:', error);
          this.displayError(error.response.data.reason);
        });
    },
    handleSpecializationSubmit() {
      if (this.isEditingSpecialization) {
        axios.post('https://localhost/specializations/update', {
          key: localStorage.getItem('authToken'),
          id: this.specializationForm.direction_specialization_id,
          direction_id: this.specializationForm.direction_id,
          specialization_name: this.specializationForm.specialization_name,
        })
          .then((response) => {
            this.$toast.success('Specjalizacja została zaktualizowana pomyślnie.');
            this.getSpecialozationsFromAPI();
            this.resetSpecializationForm();
          })
          .catch((error) => {
            console.error('Błąd zapisu danych:', error);
            this.displayError(error.response.data.reason);
          });
      } else {
        axios.post('https://localhost/specializations/add', {
          key: localStorage.getItem('authToken'),
          direction_id: this.specializationForm.direction_id,
          specialization_name: this.specializationForm.specialization_name,
        })
          .then((response) => {
            this.$toast.success('Specjalizacja została dodana pomyślnie.');
            this.getSpecialozationsFromAPI();
            this.resetSpecializationForm();
          })
          .catch((error) => {
            console.error('Błąd zapisu danych:', error);
            this.displayError(error.response.data.reason);
          });
      }
      this.closeSpecializationModal();
    },
    closeSpecializationModal() {
      this.showSpecializationModal = false;
    },
    getDirectionName(direction_id) {
      const direction = this.directions.find((d) => d.direction_id === direction_id);
      return direction ? direction.direction_name : "Nieznany";
    },
    resetDirectionForm() {
      this.directionForm = {
        direction_id: null,
        direction_name: '',
      };
      this.isEditingDirection = false;
    },
    resetSpecializationForm() {
      this.specializationForm = {
        direction_specialization_id: null,
        direction_id: null,
        specialization_name: "",
      };
      this.isEditingSpecialization = false;
    },
    displayError(error) {
      console.error(error);
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
    getSpecialozationsFromAPI() {
      axios.post('https://localhost/specializations/get-all', {
        key: localStorage.getItem('authToken'),
      })
        .then((response) => {
          this.specializations = response.data.specializations;
        })
        .catch((error) => {
          console.error('Błąd pobierania danych:', error);
          this.displayError(error.response.data.reason);
        });
    },
  },
  created() {
    this.getDirectionsFromAPI();
    this.getSpecialozationsFromAPI();
  },
};
</script>

<style scoped>
body {
  background-color: #f4f5f7;
  color: #212529;
  margin: 0;
  padding: 0;
}

h1 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #212529;
  margin-bottom: 1rem;
}

button {
  cursor: pointer;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

/* Kontener */
.direction-and-specialization-management {
  font-family: Arial, Helvetica, sans-serif;
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Nagłówki i przyciski */
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.add-button {
  background-color: #0d6efd;
  color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.add-button:hover {
  background-color: #0056b3;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Tabele */
table {
  width: 100%;
  border-collapse: collapse;
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
}

th,
td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

td {
  color: #212529;
  font-size: 0.95rem;
}

tr:last-child td {
  border-bottom: none;
}

tr:hover {
  background-color: #f1f3f5;
}

td:last-child {
  text-align: right;
  white-space: nowrap;
}

/* Przyciski w tabeli */
.edit-button {
  background-color: #ffc107;
  color: #212529;
  margin-right: 8px;
}

.edit-button:hover {
  background-color: #e0a800;
}

.delete-button {
  background-color: #dc3545;
  color: #ffffff;
}

.delete-button:hover {
  background-color: #bd2130;
}

/* Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #ffffff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  width: 400px;
  max-width: 90%;
  animation: fadeIn 0.3s ease;
}

.modal-content h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.modal-content form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ced4da;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #0d6efd;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.2);
}

/* Przyciski formularza */
.form-actions {
  display: flex;
  justify-content: space-between;
}

button.save-button {
  background-color: #28a745;
  color: #ffffff;
}

button.save-button:hover {
  background-color: #218838;
}

button.cancel-button {
  background-color: #6c757d;
  color: #ffffff;
}

button.cancel-button:hover {
  background-color: #5a6268;
}

/* Animacje */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>