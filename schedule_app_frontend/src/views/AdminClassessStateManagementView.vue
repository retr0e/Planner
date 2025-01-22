<template>
  <div class="classes-state-container">
    <h1 class="header">Zarządzanie stanami zajęć</h1>

    <!-- Formularz dodawania nowego stanu -->
    <form @submit.prevent="addState" class="state-form">
      <input type="text" v-model="newState" placeholder="Dodaj nowy stan zajęć" class="input" required />
      <button type="submit" class="add-btn">Dodaj</button>
    </form>

    <!-- Tabela stanów zajęć -->
    <table class="state-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nazwa stanu</th>
          <th>Akcje</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="state in classesStates" :key="state.class_state_id">
          <td>{{ state.class_state_id }}</td>
          <td>
            <!-- Edycja nazwy stanu -->
            <div v-if="state.isEditing">
              <input type="text" v-model="state.tempStateName" class="editable-input" />
            </div>
            <div v-else>{{ state.state_name }}</div>
          </td>
          <td>
            <!-- Akcje: Edytuj, Zapisz, Anuluj, Usuń -->
            <button v-if="state.isEditing" @click="saveEdit(state)" class="save-btn">
              Zapisz
            </button>
            <button v-if="state.isEditing" @click="cancelEdit(state)" class="cancel-btn">
              Anuluj
            </button>
            <button v-else @click="startEdit(state)" class="edit-btn">
              Edytuj
            </button>
            <button @click="deleteState(state.class_state_id)" class="delete-btn">
              Usuń
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "ClassesStateManagementView",
  data() {
    return {
      // Mockowane dane odpowiadające tabeli Classes_state
      classesStates: [
        { class_state_id: 1, state_name: "Planowane", isEditing: false, tempStateName: "" },
        { class_state_id: 2, state_name: "W trakcie", isEditing: false, tempStateName: "" },
        { class_state_id: 3, state_name: "Zakończone", isEditing: false, tempStateName: "" },
        { class_state_id: 4, state_name: "Odwołane", isEditing: false, tempStateName: "" },
      ],
      newState: "", // Pole do dodania nowego stanu
    };
  },
  methods: {
    addState() {
      axios.post('https://localhost/classes-states/add', {
        key: localStorage.getItem('authToken'),
        state_name: this.newState,
      })
        .then((response) => {
          this.$toast.success('Dodano nowy stan zajęć');
          this.getClassessStateFromAPI();
        })
        .catch((error) => {
          console.error('Błąd dodawania stanu:', error);
          this.displayError(error.response.data.reason);
        });
      this.newState = ""; 
    },
    startEdit(state) {
      // Rozpocznij edycję stanu
      state.isEditing = true;
      state.tempStateName = state.state_name; // Przechowaj aktualną nazwę w tempStateName
    },
    saveEdit(state) {
      // Zapisz edytowany stan
      if (state.tempStateName.trim()) {
        state.state_name = state.tempStateName;
      }

      axios.post('https://localhost/classes-states/update', {
        key: localStorage.getItem('authToken'),
        id: state.class_state_id,
        state_name: state.state_name,
      })
        .then((response) => {
          this.$toast.success('Zapisano zmiany');
          this.getClassessStateFromAPI();
        })
        .catch((error) => {
          console.error('Błąd zapisywania zmian:', error);
          this.displayError(error.response.data.reason);
        });

      state.isEditing = false;
      state.tempStateName = ""; // Wyczyść tymczasowe pole
    },
    cancelEdit(state) {
      // Anuluj edycję stanu
      state.isEditing = false;
      state.tempStateName = ""; // Wyczyść tymczasowe pole
    },
    deleteState(id) {
      // Usunięcie stanu zajęć
      axios.post('https://localhost/classes-states/delete', {
        key: localStorage.getItem('authToken'),
        id: id,
      })
        .then((response) => {
          this.$toast.success('Usunięto stan zajęć');
          this.getClassessStateFromAPI();
        })
        .catch((error) => {
          console.error('Błąd usuwania stanu:', error);
          this.displayError(error.response.data.reason);
        });
    },
    displayError(error) {
      console.error(error);
      this.$toast.error(error);
    },
    getClassessStateFromAPI() {
      axios.post('https://localhost/classes-states/get-all', {
        key: localStorage.getItem('authToken'),
      })
        .then((response) => {
          this.classesStates = response.data.states;
        })
        .catch((error) => {
          console.error('Błąd pobierania danych:', error);
          this.displayError(error.response.data.reason);
        });
    },
  },
  created() {
    this.getClassessStateFromAPI();
  },
};
</script>

<style scoped>
.classes-state-container {
  font-family: Arial, Helvetica, sans-serif;
  max-width: 800px;
  margin: 2rem auto;
  padding: 1.5rem;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header {
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 1.5rem;
}

.state-form {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.input {
  flex: 1;
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.add-btn {
  background: #4caf50;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.add-btn:hover {
  background: #45a049;
}

.state-table {
  width: 100%;
  border-collapse: collapse;
}

.state-table th,
.state-table td {
  padding: 0.75rem;
  text-align: left;
  border: 1px solid #ddd;
}

.state-table th {
  background: #f4f4f4;
  color: #333;
}

.editable-input {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.edit-btn,
.save-btn,
.cancel-btn,
.delete-btn {
  padding: 0.4rem 0.8rem;
  margin-right: 0.5rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.3s;
}

.edit-btn {
  background: #007bff;
  color: white;
}

.edit-btn:hover {
  background: #0056b3;
}

.save-btn {
  background: #28a745;
  color: white;
}

.save-btn:hover {
  background: #218838;
}

.cancel-btn {
  background: #ffc107;
  color: white;
}

.cancel-btn:hover {
  background: #e0a800;
}

.delete-btn {
  background: #e74c3c;
  color: white;
}

.delete-btn:hover {
  background: #c0392b;
}
</style>